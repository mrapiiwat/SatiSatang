import { scanAndDelete } from "@/common/utils/cache";

export const userCache = {
  me: (userId: number, provider: string) =>
    `users:user:${userId}:provider:${provider}:me`,
  pattern: (userId: number) => `users:user:${userId}:provider:*:me`,
};

export const clearUserCache = async (userId: number) => {
  const pattern = userCache.pattern(userId);
  try {
    await scanAndDelete(pattern);
    console.log(`[Cache] Cleared all /me sessions for User: ${userId}`);
  } catch (error) {
    console.error(`[Cache] Failed to clear /me for User ${userId}:`, error);
  }
};
