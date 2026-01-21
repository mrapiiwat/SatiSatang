import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
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
  sum,
} from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { BUCKET_NAME, s3Client } from "@/common/config/s3";
import { BadRequestError, NotFoundError } from "@/common/errors";
import { OCRService } from "@/common/service/ocr.service";
import { OpenAIService } from "@/common/service/openai";
import { db } from "@/db";
import { category, goalTransaction, transaction, user } from "@/db/schema";
import type * as transactionSchema from "./transaction.schema";

const ocrService = new OCRService();
const openAIService = new OpenAIService();

export class TransactionService {
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
  async getTotalExpense(
    userId: number,
    query: transactionSchema.getTotalExpenseQuery
  ) {
    const { month, year } = query;

    const conditions: SQL[] = [
      eq(transaction.userId, userId),
      eq(transaction.type, "EXPENSE"),
    ];

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
      totalExpense: Number(result?.totalAmount ?? 0),
    };
  }

  async getReceiptStream(transactionId: number) {
    const txn = await db.query.transaction.findFirst({
      where: and(
        eq(transaction.id, transactionId),
        isNull(transaction.deletedAt)
      ),
    });

    if (!txn || !txn.receipt) {
      throw new NotFoundError("Receipt not found");
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: txn.receipt,
    });

    try {
      const response = await s3Client.send(command);

      return {
        stream: response.Body,
        contentType: response.ContentType,
        filename: txn.receipt,
      };
    } catch (error) {
      console.error("S3 Error:", error);
      throw new NotFoundError("File not found in storage");
    }
  }
  async createTransaction(
    data: transactionSchema.createTransaction,
    userId: number
  ) {
    if (data.isGoal) {
      const [newGoalTxn] = await db
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
    if (data.receipt) {
      const file = data.receipt;
      const ext = file.name.split(".").pop();
      filename = `${uuidv4()}.${ext}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: filename,
          Body: buffer,
          ContentType: file.type,
        })
      );
    }

    const [newTransaction] = await db
      .insert(transaction)
      .values({
        type: data.type,
        description: data.description,
        amount: data.amount,
        categoryId: data.categoryId,
        receipt: filename,
        userId: userId,
        toAccount: data.toAccount,
        fromAccount: data.fromAccount,
      })
      .returning();

    return { type: "transaction", data: newTransaction };
  }
  async transactionByUpload(file: File, userId: number) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const text = await ocrService.extractTextFromImage(buffer);
    if (!text) {
      throw new BadRequestError("ไม่สามารถอ่านข้อความจากภาพได้");
    }

    const isSlip = await openAIService.checkSlipType(text);
    if (!isSlip) {
      throw new BadRequestError("รูปที่อัปโหลดไม่ใช่สลิปการเงิน");
    }

    const categories = await db.query.category.findMany({
      where: and(eq(category.userId, userId), isNull(category.deletedAt)),
      columns: {
        id: true,
        name: true,
        type: true,
      },
    });

    const userData = await db.query.user.findFirst({
      where: and(eq(user.id, userId), isNull(user.deletedAt)),
      columns: { name: true },
    });

    if (!userData) {
      throw new NotFoundError("User not found");
    }

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

    let filename = existingTxn.receipt;

    if (data.receipt) {
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

      const file = data.receipt;
      const ext = file.name.split(".").pop();
      const newFilename = `${uuidv4()}.${ext}`;

      const buffer = new Uint8Array(await file.arrayBuffer());

      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: newFilename,
          Body: buffer,
          ContentType: file.type,
        })
      );

      filename = newFilename;
    }
    const [updatedTxn] = await db
      .update(transaction)
      .set({
        type: data.type ?? existingTxn.type,
        description: data.description ?? existingTxn.description,
        amount: data.amount ? data.amount : existingTxn.amount,
        categoryId: data.categoryId ?? existingTxn.categoryId,
        receipt: filename,
        toAccount: data.toAccount ?? existingTxn.toAccount,
        fromAccount: data.fromAccount ?? existingTxn.fromAccount,
        updatedAt: new Date(),
      })
      .where(eq(transaction.id, id))
      .returning();

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

    return { message: "Transaction deleted successfully" };
  }
}
