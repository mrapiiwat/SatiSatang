import { scanAndDelete } from "@/common/utils/cache";

export const iconCache = {
  list: (userId: number, search?: string) =>
    `icons:user:${userId}:search:${search || "all"}`,
  single: (iconId: number) => `icons:item:${iconId}`,
  pattern: (userId: number) => `icons:user:${userId}:*`,
};

export const clearIconCache = async (userId: number) => {
  const pattern = iconCache.pattern(userId);
  try {
    await scanAndDelete(pattern);
    console.log(`[Cache] Cleared icon for User: ${userId}`);
  } catch (error) {
    console.error(`[Cache] Failed to clear icon for User ${userId}:`, error);
  }
};
