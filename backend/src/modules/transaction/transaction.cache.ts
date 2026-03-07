import { scanAndDelete } from "@/common/utils/cache";
import type {
  getTotalAmountQuery,
  getTransactionsQuery,
} from "./transaction.schema";

export const transactionCache = {
  list: (userId: number, query: getTransactionsQuery) => {
    return `tx:user:${userId}:p:${query.page}:l:${query.limit}:s:${query.search || "none"}:m:${query.month || "all"}:y:${query.year || "all"}`;
  },
  total: (userId: number, query: getTotalAmountQuery) => {
    return `tx:total:user:${userId}:t:${query.type || "all"}:m:${query.month || "all"}:y:${query.year || "all"}`;
  },
  receipt: (txnId: number) => `tx:receipt:${txnId}`,
  pattern: (userId: number) => `tx:*user:${userId}:*`,
};

export const clearTransactionCache = async (userId: number) => {
  try {
    const pattern = transactionCache.pattern(userId);
    await scanAndDelete(pattern);
    console.log(`[Cache] Cleared Transactions for user: ${userId}`);
  } catch (error) {
    console.error(`[Cache] Error clearing transaction cache:`, error);
  }
};
