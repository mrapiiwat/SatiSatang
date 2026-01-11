import { and, eq, gte, isNull, lte, or, sum } from "drizzle-orm";
import { BadRequestError } from "@/common/errors";
import { db } from "@/db";
import { budgets, category, transaction } from "@/db/schema";
import type * as budgetSchema from "./budget.schema";
import {
  getDeadlineFromFrequency,
  getPeriodRangeByFrequency,
} from "./budget.utils";

export class BudgetService {
  async createBudget(data: budgetSchema.createBudget, userId: number) {
    const cat = await db.query.category.findFirst({
      where: eq(category.id, data.categoryId),
    });

    if (!cat || cat.type !== "EXPENSE") {
      throw new BadRequestError(
        "Budget can only be created for expense categories."
      );
    }

    const { start, end } = getPeriodRangeByFrequency(data.frequency);

    const existingBudget = await db.query.budgets.findFirst({
      where: and(
        eq(budgets.userId, userId),
        eq(budgets.categoryId, data.categoryId),
        eq(budgets.frequency, data.frequency),
        gte(budgets.createdAt, start),
        lte(budgets.createdAt, end)
      ),
    });

    if (existingBudget) {
      throw new BadRequestError("มีงบประเภทนี้ในรอบเวลาเดียวกันแล้ว");
    }

    const deadline = getDeadlineFromFrequency(data.frequency);

    const [aggregateResult] = await db
      .select({
        totalAmount: sum(transaction.amount),
      })
      .from(transaction)
      .where(
        and(
          eq(transaction.userId, userId),
          eq(transaction.categoryId, data.categoryId),
          eq(transaction.type, "EXPENSE"),
          gte(transaction.createdAt, start),
          lte(transaction.createdAt, end)
        )
      );

    const currentAmount = Number(aggregateResult?.totalAmount ?? 0);

    const [newBudget] = await db
      .insert(budgets)
      .values({
        amount: data.amount,
        userId: userId,
        categoryId: data.categoryId,
        frequency: data.frequency,
        currentAmount: currentAmount,
        deadline: deadline,
      })
      .returning();

    return newBudget;
  }

  async getBudgets(userId: number, query: budgetSchema.getBudgetsQuery) {
    const { month, year, isOverDeadline } = query;
    const now = new Date();

    const startDate =
      month && year
        ? new Date(year, month - 1, 1)
        : new Date(now.getFullYear(), now.getMonth(), 1);

    const endDate =
      month && year
        ? new Date(year, month, 0, 23, 59, 59, 999)
        : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const rawBudgets = await db.query.budgets.findMany({
      where: and(
        eq(budgets.userId, userId),
        lte(budgets.createdAt, endDate),
        or(gte(budgets.deadline, startDate), isNull(budgets.deadline))
      ),
      with: {
        category: true,
      },
    });

    const budgetsWithCurrent = await Promise.all(
      rawBudgets.map(async (budget) => {
        const [aggregateResult] = await db
          .select({
            totalAmount: sum(transaction.amount),
          })
          .from(transaction)
          .where(
            and(
              eq(transaction.userId, userId),
              eq(transaction.categoryId, budget.categoryId),
              eq(transaction.type, "EXPENSE"),
              gte(transaction.createdAt, startDate),
              lte(transaction.createdAt, endDate)
            )
          );

        const currentAmount = Number(aggregateResult?.totalAmount ?? 0);

        await db
          .update(budgets)
          .set({
            currentAmount: currentAmount,
          })
          .where(eq(budgets.id, budget.id));

        return {
          id: budget.id,
          amount: Number(budget.amount),
          currentAmount,
          frequency: budget.frequency,
          userId: budget.userId,
          category: {
            id: budget.category.id,
            name: budget.category.name,
          },
          deadline: budget.deadline,
          isOverDeadline: budget.deadline ? budget.deadline < now : false,
        };
      })
    );

    const filteredBudgets = budgetsWithCurrent.filter((b) =>
      isOverDeadline === undefined ? true : b.isOverDeadline === isOverDeadline
    );

    return filteredBudgets;
  }
}
