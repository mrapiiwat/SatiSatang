import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  and,
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
import { BadRequestError, NotFoundError } from "@/common/exceptions";
import { SmartCategorizer } from "@/common/services/categorizer";
import { OCRService } from "@/common/services/ocr.service";
import { OpenAIService } from "@/common/services/openai.service";
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
    const { search, month, year, page = 1, limit = 10 } = query;
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

      conditions.push(gte(transaction.createdAt, startDate));
      conditions.push(lte(transaction.createdAt, endDate));
    }

    const [totalResult] = await db
      .select({ value: count() })
      .from(transaction)
      .where(and(...conditions, isNull(transaction.deletedAt)));

    const total = totalResult?.value ?? 0;

    const transactions = await db.query.transaction.findMany({
      where: and(...conditions, isNull(transaction.deletedAt)),
      orderBy: [desc(transaction.createdAt)],
      limit: limit,
      offset: skip,
      with: {
        category: true,
      },
    });

    const formattedTransactions = transactions.map((t) => ({
      ...t,
      amount: Number(t.amount),
      receipt: t.receipt
        ? `${Bun.env.APP_BASE_URL}/api/transactions/receipt/${t.id}`
        : null,
    }));

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

      conditions.push(gte(transaction.createdAt, startDate));
      conditions.push(lte(transaction.createdAt, endDate));
    }

    const [result] = await db
      .select({ totalAmount: sum(transaction.amount) })
      .from(transaction)
      .where(and(...conditions, isNull(transaction.deletedAt)));

    return {
      totalAmount: Number(result?.totalAmount ?? 0),
    };
  }

  async getReceiptUrl(transactionId: number) {
    const txn = await db.query.transaction.findFirst({
      where: and(
        eq(transaction.id, transactionId),
        isNull(transaction.deletedAt)
      ),
    });

    if (!txn || !txn.receipt) {
      throw new NotFoundError("Receipt not found");
    }

    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: txn.receipt,
      });

      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600,
      });

      return {
        url: signedUrl,
        filename: txn.receipt,
      };
    } catch (error) {
      console.error("S3 Signing Error:", error);
      throw new Error("Cannot generate receipt URL");
    }
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
          createdAt: new Date(newTransaction.createdAt).getTime(),
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

  async processSingleSlip(file: File, userId: number) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const text = await ocrService.extractTextFromImage(buffer);
    if (!text) throw new BadRequestError("ไม่สามารถอ่านข้อความจากภาพได้");

    const isSlip = await openAIService.checkSlipType(text);
    if (!isSlip) throw new BadRequestError("รูปที่อัปโหลดไม่ใช่สลิปการเงิน");

    const categories = await db.query.category.findMany({
      where: and(eq(category.userId, userId), isNull(category.deletedAt)),
      columns: { id: true, name: true, type: true },
    });

    const userData = await db.query.user.findFirst({
      where: and(eq(user.id, userId), isNull(user.deletedAt)),
      columns: { name: true },
    });

    if (!userData) throw new NotFoundError("User not found");

    const formattedCategories = categories.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
    }));

    const transactionData = await openAIService.extractTransactionData(
      text,
      formattedCategories,
      { name: userData.name }
    );

    return transactionData;
  }

  async transactionByUpload(files: File[], userId: number) {
    const results = await Promise.allSettled(
      files.map((file) => this.processSingleSlip(file, userId))
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
          error:
            result.reason instanceof Error
              ? result.reason.message
              : "Unknown error",
        };
      }
    });
  }

  async updateTransaction(
    id: number,
    data: transactionSchema.updateTransaction,
    userId: number
  ) {
    const existingTxn = await db.query.transaction.findFirst({
      where: and(
        eq(transaction.id, id),
        eq(transaction.userId, userId),
        isNull(transaction.deletedAt)
      ),
    });

    if (!existingTxn) {
      throw new NotFoundError("Transaction not found");
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

      if (existingTxn.receipt) {
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

      finalReceiptPath = newS3Key;
    }

    const [updatedTxn] = await db
      .update(transaction)
      .set({
        type: data.type ?? existingTxn.type,
        description: data.description ?? existingTxn.description,
        amount: data.amount ? data.amount : existingTxn.amount,
        categoryId: data.categoryId ?? existingTxn.categoryId,
        receipt: finalReceiptPath,
        toAccount: data.toAccount ?? existingTxn.toAccount,
        fromAccount: data.fromAccount ?? existingTxn.fromAccount,
        updatedAt: new Date(),
      })
      .where(eq(transaction.id, id))
      .returning();

    ragService
      .addTransactionIndex({
        id: updatedTxn.id,
        type: updatedTxn.type || "EXPENSE",
        amount: updatedTxn.amount,
        description: updatedTxn.description,
        userId: updatedTxn.userId,
        createdAt: new Date(updatedTxn.createdAt).getTime(),
      })
      .catch(console.error);

    return updatedTxn;
  }

  async deleteTransaction(id: number, userId: number) {
    const existingTxn = await db.query.transaction.findFirst({
      where: and(
        eq(transaction.id, id),
        eq(transaction.userId, userId),
        isNull(transaction.deletedAt)
      ),
    });

    if (!existingTxn) {
      throw new NotFoundError("Transaction not found");
    }

    if (existingTxn.receipt) {
      try {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: existingTxn.receipt,
          })
        );
      } catch (e) {
        console.warn("Failed to delete receipt from S3:", e);
      }
    }

    await db
      .update(transaction)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(transaction.id, id),
          eq(transaction.userId, userId),
          isNull(transaction.deletedAt)
        )
      );

    ragService.deleteTransactionIndex(id).catch(console.error);

    return { message: "Transaction deleted successfully" };
  }
}
