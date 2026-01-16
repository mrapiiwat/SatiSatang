import { Elysia } from "elysia";
import { StatusCodes } from "http-status-codes";
import { authenticateJWT } from "@/common/middlewares/auth.middleware";
import * as transactionSchema from "./transaction.schema";
import { TransactionService } from "./transaction.service";

const transactionService = new TransactionService();

export const transactionController = new Elysia({ prefix: "/transaction" })
  .use(authenticateJWT)
  .get(
    "/",
    async ({ query, user, set }) => {
      const userId = Number(user.id);

      const result = await transactionService.getTransactions(userId, query);

      set.status = StatusCodes.OK;
      return {
        message: "Transactions fetched successfully",
        ...result,
      };
    },
    {
      query: transactionSchema.getTransactionsQuery,
    }
  )
  .get(
    "/total-expense",
    async ({ query, user, set }) => {
      const userId = Number(user.id);

      const result = await transactionService.getTotalExpense(userId, query);

      set.status = StatusCodes.OK;
      return {
        message: "Total expense calculated successfully",
        ...result,
      };
    },
    {
      query: transactionSchema.getTotalExpenseQuery,
    }
  )
  .post(
    "/",
    async ({ body, user, set }) => {
      const userId = Number(user.id);

      const result = await transactionService.createTransaction(body, userId);

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
    "/upload",
    async ({ body, user, set }) => {
      const userId = Number(user.id);

      const result = await transactionService.transactionByUpload(
        body.receipt,
        userId
      );

      set.status = StatusCodes.OK;

      return {
        message: "OCR และการแปลงข้อมูลสำเร็จ",
        transactionData: result,
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
    async ({ params: { id }, body, user, set }) => {
      const userId = Number(user.id);
      const result = await transactionService.deleteTransaction(id, userId);

      set.status = StatusCodes.OK;
      return result;
    },
    {
      params: transactionSchema.paramsId,
    }
  );
