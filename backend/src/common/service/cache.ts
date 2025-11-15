import redis from '../config/redisClient';

const scanAndDelete = async (pattern: string) => {
  let cursor = '0';

  do {
    const reply = await redis.scan(cursor, {
      MATCH: pattern,
      COUNT: 100,
    });

    cursor = reply.cursor;
    const keys = reply.keys;

    if (keys.length > 0) {
      await redis.del(keys);
    }
  } while (cursor !== '0');
};

export const getCategoryCacheKey = (
  userId: number,
  typeParam?: string,
  search?: string,
  includeGoals?: boolean,
): string => {
  return `categories:user:${userId}:type=${typeParam || ''}:search=${search || 'none'}:includeGoals=${includeGoals}`;
};

export const clearUserCategoryCache = async (userId: number) => {
  const pattern = `categories:user:${userId}:*`;
  await scanAndDelete(pattern);
  console.log(`Cleared Categories cache for user ${userId}`);
};

export const getIconCacheKey = (userId: number, search?: string): string => {
  return `icons:user:${userId}:search=${search || 'none'}`;
};

export const clearUserIconCache = async (userId: number) => {
  const pattern = `icons:user:${userId}:*`;
  await scanAndDelete(pattern);
  console.log(`Cleared Icon cache for user ${userId}`);
};

export const getTransactionCacheKey = (
  userId: number,
  month?: number,
  year?: number,
  search?: string,
  page?: number,
  limit?: number,
): string => {
  return `transactions:user:${userId}:month=${month || 'all'}:year=${
    year || 'all'
  }:search=${search || 'none'}:page=${page}:limit=${limit}`;
};

export const clearUserTransactionCache = async (userId: number) => {
  const pattern = `transactions:user:${userId}:*`;
  await scanAndDelete(pattern);
  console.log(`Cleared Transaction cache for user ${userId}`);
};

export const getBudgetCacheKey = (
  userId: number,
  month?: number,
  year?: number,
  isOverDeadline?: boolean,
): string => {
  return `budgets:user:${userId}:month=${month || 'all'}:year=${year || 'all'}:isOverDeadline=${isOverDeadline}`;
};

export const clearUserBudgetCache = async (userId: number) => {
  const pattern = `budgets:user:${userId}:*`;
  await scanAndDelete(pattern);
  console.log(`Cleared Budget cache for user ${userId}`);
};

export const getGoalCacheKey = (
  userId: number,
  month?: number,
  year?: number,
  isFinished?: boolean,
): string => {
  return `goals:user:${userId}:month=${month || 'all'}:year=${year || 'all'}:isFinished=${isFinished}`;
};

export const clearUserGoalCache = async (userId: number) => {
  const pattern = `goals:user:${userId}:*`;
  await scanAndDelete(pattern);
  console.log(`Cleared Goal cache for user ${userId}`);
};
