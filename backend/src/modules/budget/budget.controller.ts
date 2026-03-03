import { Elysia } from "elysia";
import { StatusCodes } from "http-status-codes";
import { authenticateJWT } from "@/common/middlewares/auth.middleware";
import { cached } from "@/common/utils/cache";
import { budgetCache, clearBudgetCache } from "./budget.cache";
import * as budgetSchema from "./budget.schema";
import { BudgetService } from "./budget.service";

const budgetService = new BudgetService();

export const budgetController = new Elysia({ prefix: "/budget" })
  .use(authenticateJWT)
  .post(
    "/",
    async ({ body, user, set }) => {
      const userId = Number(user.id);
      const result = await budgetService.createBudget(body, userId);
      await clearBudgetCache(userId);

      set.status = StatusCodes.CREATED;
      return {
        message: "Budget created successfully",
        data: result,
      };
    },
    {
      body: budgetSchema.createBudget,
    }
  )
  .get(
    "/",
    async ({ query, user, set }) => {
      const userId = Number(user.id);
      const cacheKey = budgetCache.list(userId, query);

      const { data, status } = await cached(
        cacheKey,
        () => budgetService.getBudgets(userId, query),
        "1h"
      );

      set.headers["X-Cache"] = status;
      set.status = StatusCodes.OK;
      return {
        message: "Budgets fetched successfully",
        data,
      };
    },
    {
      query: budgetSchema.getBudgetsQuery,
    }
  )

  .put(
    "/:id",
    async ({ body, params, user, set }) => {
      const userId = Number(user.id);
      const result = await budgetService.updateBudget(userId, params.id, body);
      await clearBudgetCache(userId);

      set.status = StatusCodes.OK;
      return {
        message: "Budget updated successfully",
        data: result,
      };
    },
    {
      body: budgetSchema.updateBudget,
      params: budgetSchema.paramsId,
    }
  )

  .delete(
    "/:id",
    async ({ params, user, set }) => {
      const userId = Number(user.id);
      await budgetService.deleteBudget(userId, params.id);
      await clearBudgetCache(userId);

      set.status = StatusCodes.NO_CONTENT;
      return {
        message: "Budget deleted successfully",
      };
    },
    { params: budgetSchema.paramsId }
  );
