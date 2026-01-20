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
  );
