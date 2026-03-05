import { and, desc, eq, gte, ilike, isNull, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { budgets, category, goals, transaction } from "@/db/schema";

export class FinancialService {
  async getSummary(userId: number, startDate?: string, endDate?: string) {
    const conditions = [eq(transaction.userId, userId)];
    if (startDate) {
      conditions.push(gte(transaction.date, new Date(startDate)));
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      conditions.push(lte(transaction.date, end));
    }

    const summary = await db
      .select({
        type: transaction.type,
        totalAmount: sql<number>`sum(${transaction.amount})`.mapWith(Number),
      })
      .from(transaction)
      .where(and(...conditions, isNull(transaction.deletedAt)))
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
      isNull(transaction.deletedAt),
      ilike(transaction.description, `%${keyword}%`),
    ];

    if (startDate) {
      conditions.push(gte(transaction.date, new Date(startDate)));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      conditions.push(lte(transaction.date, end));
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
      isNull(transaction.deletedAt),
      isNull(category.deletedAt),
      ilike(category.name, `%${categoryName}%`),
    ];

    if (startDate) {
      conditions.push(gte(transaction.date, new Date(startDate)));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      conditions.push(lte(transaction.date, end));
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
      isNull(transaction.deletedAt),
      isNull(category.deletedAt),
    ];

    if (startDate) conditions.push(gte(transaction.date, new Date(startDate)));
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      conditions.push(lte(transaction.date, end));
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
    endDate?: string,
    categoryName?: string
  ) {
    const conditions = [
      eq(transaction.userId, userId),
      eq(transaction.type, "EXPENSE"),
      isNull(transaction.deletedAt),
      isNull(category.deletedAt),
    ];

    if (startDate) conditions.push(gte(transaction.date, new Date(startDate)));
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      conditions.push(lte(transaction.date, end));
    }

    const query = db
      .select({
        description: transaction.description,
        amount: transaction.amount,
        date: transaction.date,
        categoryName: category.name,
      })
      .from(transaction)
      .innerJoin(category, eq(transaction.categoryId, category.id));

    if (categoryName) {
      conditions.push(ilike(category.name, `%${categoryName}%`));
    }

    const result = await query
      .where(and(...conditions))
      .orderBy(desc(transaction.amount))
      .limit(limit);

    if (result.length === 0)
      return `ไม่พบรายการรายจ่าย${categoryName ? `ในหมวด ${categoryName}` : ""}ครับ`;

    return (
      `รายการที่จ่ายแพงที่สุด${categoryName ? `ในหมวด ${categoryName}` : ""}:\n` +
      result
        .map(
          (r, i) =>
            `${i + 1}. ${r.description} (${r.categoryName}) - ${r.amount} บาท (${r.date.toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" })})`
        )
        .join("\n")
    );
  }

  async getDetailedTransactions(
    userId: number,
    limit: number = 15,
    startDate?: string,
    endDate?: string,
    categoryName?: string
  ) {
    const conditions = [
      eq(transaction.userId, userId),
      isNull(transaction.deletedAt),
      isNull(category.deletedAt),
    ];

    if (startDate) conditions.push(gte(transaction.date, new Date(startDate)));
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      conditions.push(lte(transaction.date, end));
    }

    const query = db
      .select({
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        date: transaction.date,
        categoryName: category.name,
      })
      .from(transaction)
      .innerJoin(category, eq(transaction.categoryId, category.id));

    if (categoryName) {
      conditions.push(ilike(category.name, `%${categoryName}%`));
    }

    const result = await query
      .where(and(...conditions))
      .orderBy(desc(transaction.date))
      .limit(limit);

    if (result.length === 0)
      return `ไม่พบรายการ${categoryName ? `ในหมวด ${categoryName}` : ""}ครับ`;

    return (
      `ลิสต์รายการล่าสุด${categoryName ? ` (หมวด ${categoryName})` : ""}:\n` +
      result
        .map(
          (r) =>
            `- [${r.date.toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" })}] ${r.description} (${r.categoryName}): ${r.amount} บาท`
        )
        .join("\n")
    );
  }

  async compareMonthlySpending(userId: number, month?: number, year?: number) {
    const now = new Date();
    const targetYear = year ?? now.getFullYear();
    const targetMonthIndex = month ? month - 1 : now.getMonth();
    const currentMonthStart = new Date(
      targetYear,
      targetMonthIndex,
      1,
      0,
      0,
      0,
      0
    );
    const currentMonthEnd = new Date(
      targetYear,
      targetMonthIndex + 1,
      0,
      23,
      59,
      59,
      999
    );

    const lastMonthStart = new Date(
      targetYear,
      targetMonthIndex - 1,
      1,
      0,
      0,
      0,
      0
    );
    const lastMonthEnd = new Date(
      targetYear,
      targetMonthIndex,
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
          isNull(transaction.deletedAt),
          gte(transaction.date, currentMonthStart),
          lte(transaction.date, currentMonthEnd)
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
          isNull(transaction.deletedAt),
          gte(transaction.date, lastMonthStart),
          lte(transaction.date, lastMonthEnd)
        )
      );

    const currentTotal = currentRes[0]?.total || 0;
    const lastTotal = lastRes[0]?.total || 0;
    const diff = currentTotal - lastTotal;

    const currentMonthName = currentMonthStart.toLocaleDateString("th-TH", {
      month: "long",
      year: "numeric",
    });
    const lastMonthName = lastMonthStart.toLocaleDateString("th-TH", {
      month: "long",
      year: "numeric",
    });

    return `[ข้อมูลจริงจาก Database - ห้ามสลับหรือดัดแปลงตัวเลขเด็ดขาด]
    - เดือน ${currentMonthName}: มียอดใช้จ่ายทั้งหมด ${currentTotal} บาท
    - เดือน ${lastMonthName}: มียอดใช้จ่ายทั้งหมด ${lastTotal} บาท
    สรุปส่วนต่าง: ${diff > 0 ? `เดือน ${currentMonthName} ใช้เยอะกว่าเดือน ${lastMonthName} อยู่ ${diff} บาท` : `เดือน ${currentMonthName} ใช้น้อยกว่าเดือน ${lastMonthName} อยู่ ${Math.abs(diff)} บาท`}`;
  }

  async getGoalsAndBudgets(userId: number) {
    const userGoals = await db
      .select()
      .from(goals)
      .where(and(eq(goals.userId, userId), isNull(goals.deletedAt)));

    const userBudgets = await db
      .select({
        amount: budgets.amount,
        currentAmount: budgets.currentAmount,
        frequency: budgets.frequency,
        categoryName: category.name,
      })
      .from(budgets)
      .innerJoin(category, eq(budgets.categoryId, category.id))
      .where(
        and(
          eq(budgets.userId, userId),
          isNull(budgets.deletedAt),
          isNull(category.deletedAt)
        )
      );

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
