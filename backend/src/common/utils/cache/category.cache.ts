import type { GetCategoriesQuery } from "@/modules/category/category.schema";
import { scanAndDelete } from "./cache.helper";

export const categoryCache = {
  list: (userId: number, query: GetCategoriesQuery): string => {
    const type = query.type || "all";
    const search = query.search || "none";
    const includeGoals = query.includeGoals ?? false;
    return `categories:user:${userId}:type=${type}:search=${search}:includeGoals=${includeGoals}`;
  },
  pattern: (userId: number) => `categories:user:${userId}:*`,
};

export const clearCategoryCache = async (userId: number) => {
  const pattern = categoryCache.pattern(userId);
  try {
    await scanAndDelete(pattern);
    console.log(`[Cache] Cleared Categories for User: ${userId}`);
  } catch (error) {
    console.error(
      `[Cache] Failed to clear Categories for User ${userId}:`,
      error
    );
  }
};
