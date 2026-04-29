import { Elysia } from "elysia";
import { StatusCodes } from "http-status-codes";
import { authenticateJWT } from "@/common/middlewares/auth.middleware";
import { cached } from "@/common/utils/cache";
import { clearBudgetCache } from "../budget/budget.cache";
import { clearGoalCache } from "../goal/goal.cache";
import { clearTransactionCache, transactionCache } from "./transaction.cache";
import * as transactionSchema from "./transaction.schema";
import { TransactionService } from "./transaction.service";

const transactionService = new TransactionService();
const invalidateAllFinancialData = async (userId: number) => {
  await Promise.all([
    clearTransactionCache(userId),
    clearBudgetCache(userId),
    clearGoalCache(userId),
  ]);
};

export const transactionController = new Elysia({
  prefix: "/transaction",
  tags: ["TRANSACTION"],
})
  .use(authenticateJWT)
  .guard(
    {
      detail: {
        security: [{ JwtAuth: [] }],
      },
    },
    (app) =>
      app
        .get(
          "/",
          async ({ query, user, set }) => {
            const userId = Number(user.id);
            const cacheKey = transactionCache.list(userId, query);

            const { data, status } = await cached(
              cacheKey,
              () => transactionService.getTransactions(userId, query),
              "30m"
            );

            set.headers["X-Cache"] = status;
            set.status = StatusCodes.OK;
            return {
              message: "Transactions fetched successfully",
              ...data,
            };
          },
          {
            query: transactionSchema.getTransactionsQuery,
          }
        )

        .get(
          "/total-amount",
          async ({ query, user, set }) => {
            const userId = Number(user.id);
            const cacheKey = transactionCache.total(userId, query);

            const { data, status } = await cached(
              cacheKey,
              () => transactionService.getTotalAmount(userId, query),
              "10m"
            );

            set.headers["X-Cache"] = status;
            set.status = StatusCodes.OK;
            return {
              message: "Total amount calculated successfully",
              ...data,
            };
          },
          {
            query: transactionSchema.getTotalAmountQuery,
          }
        )

        .post(
          "/",
          async ({ body, user, set }) => {
            const userId = Number(user.id);

            const result = await transactionService.createTransaction(
              body,
              userId
            );
            await invalidateAllFinancialData(userId);

            set.status = StatusCodes.CREATED;

            return {
              message:
                result.type === "goal"
                  ? "Goal transaction created successfully"
                  : "Transaction created successfully",
              data: result.data,
            };
          },
          {
            body: transactionSchema.createTransaction,
          }
        )

        .post(
          "/predict-category",
          async ({ body, user, set }) => {
            const userId = Number(user.id);
            const result = await transactionService.predictCategory(
              body.description,
              userId
            );

            set.status = StatusCodes.OK;

            return result;
          },
          {
            body: transactionSchema.predictCategory,
          }
        )

        .post(
          "/upload",
          async ({ body, user, set }) => {
            const userId = Number(user.id);

            const results = await transactionService.transactionByUpload(
              body.receipt,
              userId
            );

            set.status = StatusCodes.OK;

            const successCount = results.filter(
              (r) => r.status === "success"
            ).length;

            return {
              message: `ประมวลผลเสร็จสิ้น สำเร็จ ${successCount} จาก ${results.length} รายการ`,
              results: results,
            };
          },
          {
            body: transactionSchema.uploadReceipt,
          }
        )

        .put(
          "/:id",
          async ({ params: { id }, body, user, set }) => {
            const userId = Number(user.id);

            const result = await transactionService.updateTransaction(
              id,
              body,
              userId
            );
            await invalidateAllFinancialData(userId);

            set.status = StatusCodes.OK;

            return {
              message: "Transaction updated successfully",
              data: result,
            };
          },
          {
            params: transactionSchema.paramsId,
            body: transactionSchema.updateTransaction,
          }
        )

        .delete(
          "/:id",
          async ({ params: { id }, user, set }) => {
            const userId = Number(user.id);
            const result = await transactionService.deleteTransaction(
              id,
              userId
            );
            await invalidateAllFinancialData(userId);

            set.status = StatusCodes.OK;
            return result;
          },
          {
            params: transactionSchema.paramsId,
          }
        )
  );
