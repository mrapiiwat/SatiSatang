import { and, desc, eq, gte, ilike, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { budgets, category, goals, transaction } from "@/db/schema";

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

  async getCategoryRanking(
    userId: number,
    startDate?: string,
    endDate?: string
  ) {
    const conditions = [
      eq(transaction.userId, userId),
      eq(transaction.type, "EXPENSE"),
    ];

    if (startDate)
      conditions.push(gte(transaction.createdAt, new Date(startDate)));
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      conditions.push(lte(transaction.createdAt, end));
    }

    const result = await db
      .select({
        categoryName: category.name,
        totalAmount: sql<number>`sum(${transaction.amount})`.mapWith(Number),
      })
      .from(transaction)
      .innerJoin(category, eq(transaction.categoryId, category.id))
      .where(and(...conditions))
      .groupBy(category.name)
      .orderBy(desc(sql`sum(${transaction.amount})`));

    if (result.length === 0) return "ไม่พบข้อมูลการใช้จ่ายครับ";

    return (
      "อันดับหมวดหมู่ใช้จ่ายสูงสุด:\n" +
      result
        .map((r, i) => `${i + 1}. ${r.categoryName}: ${r.totalAmount} บาท`)
        .join("\n")
    );
  }

  async getTopExpenses(
    userId: number,
    limit: number = 5,
    startDate?: string,
    endDate?: string
  ) {
    const conditions = [
      eq(transaction.userId, userId),
      eq(transaction.type, "EXPENSE"),
    ];

    if (startDate)
      conditions.push(gte(transaction.createdAt, new Date(startDate)));
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      conditions.push(lte(transaction.createdAt, end));
    }

    const result = await db
      .select({
        description: transaction.description,
        amount: transaction.amount,
        date: transaction.createdAt,
      })
      .from(transaction)
      .where(and(...conditions))
      .orderBy(desc(transaction.amount))
      .limit(limit);

    if (result.length === 0) return "ไม่พบรายการรายจ่ายครับ";

    return (
      `รายการที่จ่ายแพงที่สุด:\n` +
      result
        .map(
          (r, i) =>
            `${i + 1}. ${r.description} - ${r.amount} บาท (${r.date.toISOString().split("T")[0]})`
        )
        .join("\n")
    );
  }

  async compareMonthlySpending(userId: number) {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999
    );

    const currentRes = await db
      .select({
        total: sql<number>`sum(${transaction.amount})`.mapWith(Number),
      })
      .from(transaction)
      .where(
        and(
          eq(transaction.userId, userId),
          eq(transaction.type, "EXPENSE"),
          gte(transaction.createdAt, currentMonthStart)
        )
      );

    const lastRes = await db
      .select({
        total: sql<number>`sum(${transaction.amount})`.mapWith(Number),
      })
      .from(transaction)
      .where(
        and(
          eq(transaction.userId, userId),
          eq(transaction.type, "EXPENSE"),
          gte(transaction.createdAt, lastMonthStart),
          lte(transaction.createdAt, lastMonthEnd)
        )
      );

    const currentTotal = currentRes[0]?.total || 0;
    const lastTotal = lastRes[0]?.total || 0;
    const diff = currentTotal - lastTotal;

    return `เดือนนี้ใช้ไป: ${currentTotal} บาท\nเดือนที่แล้วใช้ไป: ${lastTotal} บาท\nส่วนต่าง: ${diff > 0 ? `มากกว่าเดือนที่แล้ว ${diff} บาท` : `น้อยกว่าเดือนที่แล้ว ${Math.abs(diff)} บาท`}`;
  }

  async getGoalsAndBudgets(userId: number) {
    const userGoals = await db
      .select()
      .from(goals)
      .where(eq(goals.userId, userId));
    const userBudgets = await db
      .select({
        amount: budgets.amount,
        currentAmount: budgets.currentAmount,
        frequency: budgets.frequency,
        categoryName: category.name,
      })
      .from(budgets)
      .innerJoin(category, eq(budgets.categoryId, category.id))
      .where(eq(budgets.userId, userId));

    const goalsText = userGoals.length
      ? userGoals
          .map(
            (g) =>
              `- เป้าหมาย: ${g.name} (เป้า: ${g.amount}, สำเร็จ: ${g.finished})`
          )
          .join("\n")
      : "ไม่มีเป้าหมาย";
    const budgetsText = userBudgets.length
      ? userBudgets
          .map(
            (b) =>
              `- งบหมวด ${b.categoryName} (${b.frequency}): ตั้งไว้ ${b.amount}, ใช้ไป ${b.currentAmount}, เหลือ ${b.amount - b.currentAmount}`
          )
          .join("\n")
      : "ไม่ได้ตั้งงบประมาณ";

    return `[เป้าหมาย (Goals)]\n${goalsText}\n\n[งบประมาณ (Budgets)]\n${budgetsText}`;
  }
}

export const financialService = new FinancialService();
