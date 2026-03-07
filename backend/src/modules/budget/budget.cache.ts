import { scanAndDelete } from "@/common/utils/cache";
import type { getBudgetsQuery } from "./budget.schema";

export const budgetCache = {
  list: (userId: number, query: getBudgetsQuery) => {
    const month = query.month || "current";
    const year = query.year || "current";
    const isOverDeadline = query.isOverDeadline ?? "all";
    return `budgets:user:${userId}:m:${month}:y:${year}:over:${isOverDeadline}`;
  },
  pattern: (userId: number) => `budgets:user:${userId}:*`,
};

export const clearBudgetCache = async (userId: number) => {
  try {
    const pattern = budgetCache.pattern(userId);
    await scanAndDelete(pattern);
    console.log(`[Cache] Cleared Budgets for user: ${userId}`);
  } catch (error) {
    console.error(`[Cache] Error clearing budget cache:`, error);
  }
};
