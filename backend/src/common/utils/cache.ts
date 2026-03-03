import { redis } from "@/common/config/redis";

const parseTTL = (ttl: string | number): number => {
  if (typeof ttl === "number") return ttl;

  const unit = ttl.slice(-1);
  const value = parseInt(ttl.slice(0, -1), 10);

  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 3600;
    case "d":
      return value * 86400;
    default:
      return parseInt(ttl, 10);
  }
};

export const cached = async <T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  ttl: string | number = "1h"
) => {
  try {
    const seconds = parseTTL(ttl);
    const cached = await redis.get(cacheKey);

    if (cached) {
      return { data: JSON.parse(cached) as T, status: "HIT" as const };
    }

    const result = await fetcher();

    redis
      .set(cacheKey, JSON.stringify(result), "EX", seconds)
      .catch(console.error);

    return { data: result, status: "MISS" as const };
  } catch (error) {
    console.error("Cache Error:", error);
    const result = await fetcher();
    return { data: result, status: "ERROR" as const };
  }
};

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
