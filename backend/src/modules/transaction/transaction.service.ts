import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  isNull,
  lte,
  or,
  type SQL,
  sql,
  sum,
} from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { BUCKET_NAME, s3Client } from "@/common/config/s3";
import { NotFoundError } from "@/common/exceptions";
import { SmartCategorizer } from "@/common/services/categorizer";
import { OCRService } from "@/common/services/ocr.service";
import {
  type Category,
  OpenAIService,
  type User,
} from "@/common/services/openai.service";
import { RAGService } from "@/common/services/rag.service";
import { db } from "@/db";
import { category, goalTransaction, transaction, user } from "@/db/schema";
import type * as transactionSchema from "./transaction.schema";

const ocrService = new OCRService();
const ragService = new RAGService();
const openAIService = new OpenAIService();

export class TransactionService {
  private categorizer = new SmartCategorizer();

  async getTransactions(
    userId: number,
    query: transactionSchema.getTransactionsQuery
  ) {
    const {
      search,
      month,
      year,
      page = 1,
      limit = 10,
      sortBy = "date",
      order = "desc",
    } = query;
    const skip = (page - 1) * limit;

    const conditions: SQL[] = [eq(transaction.userId, userId)];

    if (search) {
      const searchTerms = search.split(" ").filter(Boolean);
      if (searchTerms.length > 0) {
        const searchConditions = searchTerms.map((term) =>
          ilike(transaction.description, `%${term}%`)
        );
        const searchSql = or(...searchConditions);

        if (searchSql) {
          conditions.push(searchSql);
        }
      }
    }

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      conditions.push(gte(transaction.date, startDate));
      conditions.push(lte(transaction.date, endDate));
    }

    const sortColumn =
      sortBy === "amount"
        ? transaction.amount
        : sortBy === "createdAt"
          ? transaction.createdAt
          : transaction.date;

    const orderFn = order === "asc" ? asc : desc;

    const [totalResult] = await db
      .select({ value: count() })
      .from(transaction)
      .where(and(...conditions, isNull(transaction.deletedAt)));

    const total = totalResult?.value ?? 0;

    const transactions = await db.query.transaction.findMany({
      where: and(...conditions, isNull(transaction.deletedAt)),
      orderBy: [orderFn(sortColumn), desc(transaction.createdAt)],
      limit: limit,
      offset: skip,
      with: {
        category: true,
      },
    });

    const formattedTransactions = await Promise.all(
      transactions.map(async (t) => {
        let signedReceiptUrl = null;

        if (t.receipt) {
          try {
            const command = new GetObjectCommand({
              Bucket: BUCKET_NAME,
              Key: t.receipt,
            });

            signedReceiptUrl = await getSignedUrl(s3Client, command, {
              expiresIn: 3600,
            });
          } catch (error) {
            console.error(`Failed to sign url for transaction ${t.id}`, error);
          }
        }

        return {
          ...t,
          amount: Number(t.amount),
          receipt: signedReceiptUrl,
        };
      })
    );

    return {
      data: formattedTransactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTotalAmount(
    userId: number,
    query: transactionSchema.getTotalAmountQuery
  ) {
    const { month, year, type } = query;

    const conditions: SQL[] = [
      eq(transaction.userId, userId),
      type ? eq(transaction.type, type) : undefined,
    ].filter(Boolean) as SQL[];

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      conditions.push(gte(transaction.date, startDate));
      conditions.push(lte(transaction.date, endDate));
    }

    const [result] = await db
      .select({ totalAmount: sum(transaction.amount) })
      .from(transaction)
      .where(and(...conditions, isNull(transaction.deletedAt)));

    return {
      totalAmount: Number(result?.totalAmount ?? 0),
    };
  }

  async createTransaction(
    data: transactionSchema.createTransaction,
    userId: number
  ) {
    return await db.transaction(async (tx) => {
      if (data.isGoal) {
        const [newGoalTxn] = await tx
          .insert(goalTransaction)
          .values({
            goalId: data.categoryId,
            userId: userId,
            amount: data.amount,
          })
          .returning();

        await tx
          .update(user)
          .set({
            balance: sql`${user.balance} - ${data.amount}`,
          })
          .where(eq(user.id, userId));

        return { type: "goal", data: newGoalTxn };
      }

      let filename: string | null = null;
      let s3Key: string | null = null;
      if (data.receipt) {
        const file = data.receipt;
        const ext = file.name.split(".").pop();
        filename = `${uuidv4()}.${ext}`;
        s3Key = `receipts/${filename}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        await s3Client.send(
          new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: buffer,
            ContentType: file.type,
          })
        );
      }

      const [newTransaction] = await tx
        .insert(transaction)
        .values({
          type: data.type,
          description: data.description,
          amount: data.amount,
          date: data.date ? new Date(data.date) : undefined,
          categoryId: data.categoryId,
          receipt: s3Key,
          userId: userId,
          toAccount: data.toAccount,
          fromAccount: data.fromAccount,
        })
        .returning();

      if (data.type === "INCOME") {
        await tx
          .update(user)
          .set({
            balance: sql`${user.balance} + ${data.amount}`,
          })
          .where(eq(user.id, userId));
      } else if (data.type === "EXPENSE") {
        await tx
          .update(user)
          .set({
            balance: sql`${user.balance} - ${data.amount}`,
          })
          .where(eq(user.id, userId));
      }

      ragService
        .addTransactionIndex({
          id: newTransaction.id,
          type: newTransaction.type || "EXPENSE",
          amount: newTransaction.amount,
          description: newTransaction.description,
          userId: newTransaction.userId,
          date: new Date(newTransaction.date).getTime(),
        })
        .catch((err) => {
          console.error(
            `[RAG] Failed to index transaction ${newTransaction.id}:`,
            err
          );
        });

      this.categorizer.trainModel(userId).catch((err) => {
        console.error(`Background training failed for user ${userId}:`, err);
      });

      return { type: "transaction", data: newTransaction };
    });
  }

  async predictCategory(description: string, userId: number) {
    const predictedId = await this.categorizer.predict(description, userId);

    if (!predictedId) {
      return { categoryId: null, type: null };
    }

    const [catInfo] = await db
      .select({
        type: category.type,
      })
      .from(category)
      .where(and(eq(category.id, predictedId), isNull(category.deletedAt)));

    return {
      type: catInfo.type,
      categoryId: predictedId,
    };
  }

  private async processSingleSlip(
    file: File,
    categories: Category[],
    user: User
  ) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ocrText = await ocrService.extractTextFromImage(buffer);
    if (!ocrText) throw new Error("ไม่สามารถอ่านข้อความจากภาพได้");

    const base64Image = buffer.toString("base64");

    const isSlip = await openAIService.checkSlipType(base64Image);
    if (!isSlip) throw new Error("รูปภาพนี้ไม่ใช่สลิปการเงิน");

    const transactionData = await openAIService.extractTransactionData(
      base64Image,
      ocrText,
      categories,
      user.name
    );

    return transactionData;
  }

  async transactionByUpload(files: File[], userId: number) {
    const [categories, userData] = await Promise.all([
      db.query.category.findMany({
        where: and(eq(category.userId, userId), isNull(category.deletedAt)),
        columns: { id: true, name: true, type: true },
      }),
      db.query.user.findFirst({
        where: and(eq(user.id, userId), isNull(user.deletedAt)),
        columns: { name: true },
      }),
    ]);

    if (!userData) throw new NotFoundError("ไม่พบข้อมูลผู้ใช้งาน");

    const results = await Promise.allSettled(
      files.map((file) => this.processSingleSlip(file, categories, userData))
    );

    return results.map((result, index) => {
      if (result.status === "fulfilled") {
        return {
          status: "success",
          fileName: files[index].name,
          data: result.value,
        };
      } else {
        return {
          status: "error",
          fileName: files[index].name,
          error: result.reason?.message || "Unknown error",
        };
      }
    });
  }

  async updateTransaction(
    id: number,
    data: transactionSchema.updateTransaction,
    userId: number
  ) {
    return await db.transaction(async (tx) => {
      const existingTxn = await tx.query.transaction.findFirst({
        where: and(
          eq(transaction.id, id),
          eq(transaction.userId, userId),
          isNull(transaction.deletedAt)
        ),
      });

      if (!existingTxn) {
        throw new NotFoundError("Transaction not found");
      }

      const oldAmount = Number(existingTxn.amount);
      const newAmount = Number(data.amount ?? existingTxn.amount);
      const oldType = existingTxn.type;
      const newType = data.type ?? existingTxn.type;

      let balanceChange = 0;

      balanceChange += oldType === "INCOME" ? -oldAmount : oldAmount;

      balanceChange += newType === "INCOME" ? newAmount : -newAmount;

      if (balanceChange !== 0) {
        await tx
          .update(user)
          .set({ balance: sql`${user.balance} + ${balanceChange}` })
          .where(eq(user.id, userId));
      }

      let finalReceiptPath = existingTxn.receipt;
      if (data.receipt) {
        const file = data.receipt;
        const ext = file.name.split(".").pop();
        const newFilename = `${uuidv4()}.${ext}`;
        const newS3Key = `receipts/${newFilename}`;
        const buffer = new Uint8Array(await file.arrayBuffer());
        await s3Client.send(
          new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: newS3Key,
            Body: buffer,
            ContentType: file.type,
          })
        );
        finalReceiptPath = newS3Key;
      }

      const [updatedTxn] = await tx
        .update(transaction)
        .set({
          type: newType,
          description: data.description ?? existingTxn.description,
          amount: newAmount,
          date: data.date ? new Date(data.date) : existingTxn.date,
          categoryId: data.categoryId ?? existingTxn.categoryId,
          receipt: finalReceiptPath,
          toAccount: data.toAccount ?? existingTxn.toAccount,
          fromAccount: data.fromAccount ?? existingTxn.fromAccount,
          updatedAt: new Date(),
        })
        .where(eq(transaction.id, id))
        .returning();

      if (data.receipt && existingTxn.receipt) {
        try {
          await s3Client.send(
            new DeleteObjectCommand({
              Bucket: BUCKET_NAME,
              Key: existingTxn.receipt,
            })
          );
        } catch (e) {
          console.warn("Failed to delete old receipt:", e);
        }
      }
      ragService
        .addTransactionIndex({
          id: updatedTxn.id,
          type: updatedTxn.type || "EXPENSE",
          amount: updatedTxn.amount,
          description: updatedTxn.description,
          userId: updatedTxn.userId,
          date: new Date(updatedTxn.date).getTime(),
        })
        .catch(console.error);

      return updatedTxn;
    });
  }

  async deleteTransaction(id: number, userId: number) {
    let s3KeyToDelete: string | null = null;

    await db.transaction(async (tx) => {
      const existingTxn = await tx.query.transaction.findFirst({
        where: and(
          eq(transaction.id, id),
          eq(transaction.userId, userId),
          isNull(transaction.deletedAt)
        ),
      });

      if (!existingTxn) {
        throw new NotFoundError("Transaction not found");
      }

      s3KeyToDelete = existingTxn.receipt;

      const amount = Number(existingTxn.amount);
      const balanceUpdate = existingTxn.type === "INCOME" ? -amount : amount;

      await tx
        .update(user)
        .set({ balance: sql`${user.balance} + ${balanceUpdate}` })
        .where(eq(user.id, userId));

      await tx
        .update(transaction)
        .set({ receipt: null, deletedAt: new Date() })
        .where(
          and(
            eq(transaction.id, id),
            eq(transaction.userId, userId),
            isNull(transaction.deletedAt)
          )
        );
    });

    if (s3KeyToDelete) {
      s3Client
        .send(
          new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: s3KeyToDelete ?? undefined,
          })
        )
        .catch((err) => console.error("[S3] Cleanup Error:", err));
    }

    ragService.deleteTransactionIndex(id).catch(console.error);
    return { message: "Transaction deleted successfully" };
  }
}
