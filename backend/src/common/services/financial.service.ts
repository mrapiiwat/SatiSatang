import { and, eq, gte, ilike, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { category, transaction } from "@/db/schema";

export class FinancialService {
  async getSummary(userId: number, startDate?: string, endDate?: string) {
    const conditions = [eq(transaction.userId, userId)];
    if (startDate) {
      conditions.push(gte(transaction.createdAt, new Date(startDate)));
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      conditions.push(lte(transaction.createdAt, end));
    }

    const summary = await db
      .select({
        type: transaction.type,
        totalAmount: sql<number>`sum(${transaction.amount})`.mapWith(Number),
      })
      .from(transaction)
      .where(and(...conditions))
      .groupBy(transaction.type);

    const timeLabel = startDate
      ? `(ช่วงวันที่ ${startDate} ถึง ${endDate})`
      : "(ทั้งหมด)";

    if (summary.length === 0) {
      return `ยังไม่มีข้อมูลรายรับรายจ่าย ${timeLabel} ครับ`;
    }

    return `สรุปยอด ${timeLabel}: ${summary.map((s) => `${s.type}: ${s.totalAmount} THB`).join(", ")}`;
  }

  async getSpendingStats(
    userId: number,
    keyword: string,
    startDate?: string,
    endDate?: string
  ) {
    const conditions = [
      eq(transaction.userId, userId),
      ilike(transaction.description, `%${keyword}%`),
    ];

    if (startDate) {
      conditions.push(gte(transaction.createdAt, new Date(startDate)));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      conditions.push(lte(transaction.createdAt, end));
    }

    const result = await db
      .select({
        count: sql<number>`count(*)`.mapWith(Number),
        totalAmount: sql<number>`sum(${transaction.amount})`.mapWith(Number),
      })
      .from(transaction)
      .where(and(...conditions));

    const stats = result[0];
    const timeLabel = startDate ? `(${startDate} ถึง ${endDate})` : "";

    if (!stats || stats.count === 0) {
      return `ไม่พบรายการใช้จ่ายเกี่ยวกับ "${keyword}" ${timeLabel} ครับ`;
    }

    return `เกี่ยวกับ "${keyword}" ${timeLabel}:
    - จำนวนรายการ: ${stats.count} รายการ
    - ยอดรวมทั้งหมด: ${stats.totalAmount} บาท`;
  }

  async getSpendingByCategory(
    userId: number,
    categoryName: string,
    startDate?: string,
    endDate?: string
  ) {
    const conditions = [
      eq(transaction.userId, userId),
      ilike(category.name, `%${categoryName}%`),
    ];

    if (startDate) {
      conditions.push(gte(transaction.createdAt, new Date(startDate)));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      conditions.push(lte(transaction.createdAt, end));
    }

    const result = await db
      .select({
        categoryName: category.name,
        totalAmount: sql<number>`sum(${transaction.amount})`.mapWith(Number),
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(transaction)
      .innerJoin(category, eq(transaction.categoryId, category.id))
      .where(and(...conditions))
      .groupBy(category.name);

    if (result.length === 0)
      return `ไม่พบหมวดหมู่ที่ชื่อ "${categoryName}" ในช่วงเวลานี้ครับ`;

    const timeLabel = startDate ? `(${startDate} ถึง ${endDate})` : "";

    return result
      .map(
        (r) =>
          `หมวด ${r.categoryName} ${timeLabel}: ${r.count} รายการ, รวม ${r.totalAmount} บาท`
      )
      .join("\n");
  }
}

export const financialService = new FinancialService();
