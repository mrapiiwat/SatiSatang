import { scanAndDelete } from "@/common/utils/cache";
import type { getGoalsQuery } from "./goal.schema";

export const goalCache = {
  list: (userId: number, query: getGoalsQuery) => {
    const month = query.month || "current";
    const year = query.year || "current";
    const isFinished = query.isFinished ?? "all";
    return `goals:user:${userId}:m:${month}:y:${year}:finished:${isFinished}`;
  },
  pattern: (userId: number) => `goals:user:${userId}:*`,
};

export const clearGoalCache = async (userId: number) => {
  try {
    const pattern = goalCache.pattern(userId);
    await scanAndDelete(pattern);
    console.log(`[Cache] Cleared Goals for user: ${userId}`);
  } catch (error) {
    console.error(`[Cache] Error clearing goal cache:`, error);
  }
};
