import { redis } from "@/common/config/redis";

export const scanAndDelete = async (pattern: string) => {
  let cursor = "0";

  do {
    const [nextCursor, keys] = await redis.scan(
      cursor,
      "MATCH",
      pattern,
      "COUNT",
      100
    );

    cursor = nextCursor;

    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } while (cursor !== "0");
};

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
