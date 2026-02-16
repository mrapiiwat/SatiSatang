import { Elysia } from "elysia";
import { StatusCodes } from "http-status-codes";
import { authenticateJWT } from "@/common/middlewares/auth.middleware";
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
      const result = await budgetService.getBudgets(userId, query);

      set.status = StatusCodes.OK;
      return {
        message: "Budgets fetched successfully",
        data: result,
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

      set.status = StatusCodes.NO_CONTENT;
      return {
        message: "Budget deleted successfully",
      };
    },
    { params: budgetSchema.paramsId }
  );
