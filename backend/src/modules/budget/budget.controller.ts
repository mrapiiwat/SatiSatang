import { Elysia } from "elysia";
import { StatusCodes } from "http-status-codes";
import { authenticateJWT } from "@/common/middlewares/auth.middleware";
import { limit } from "@/common/middlewares/limit.middleware";
import { cached } from "@/common/utils/cache";
import { budgetCache, clearBudgetCache } from "./budget.cache";
import * as budgetSchema from "./budget.schema";
import { BudgetService } from "./budget.service";

const budgetService = new BudgetService();

export const budgetController = new Elysia({
  prefix: "/budget",
  tags: ["BUDGET"],
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
            beforeHandle: limit({
              max: 20,
              window: 60,
              prefix: "create-budget",
            }),
            detail: {
              summary: "สร้างงบประมาณใหม่",
              description: "กำหนดงบประมาณการใช้จ่ายรายเดือนสำหรับหมวดหมู่ต่างๆ",
            },
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
            detail: {
              summary: "ดึงรายการงบประมาณทั้งหมด",
              description: "ดึงข้อมูลงบประมาณทั้งหมดของผู้ใช้งานพร้อมสถานะการใช้จ่าย",
            },
          }
        )

        .put(
          "/:id",
          async ({ body, params, user, set }) => {
            const userId = Number(user.id);
            const result = await budgetService.updateBudget(
              userId,
              Number(params.id),
              body
            );
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
            beforeHandle: limit({
              max: 20,
              window: 60,
              prefix: "update-budget",
            }),
            detail: {
              summary: "แก้ไขข้อมูลงบประมาณ",
              description: "อัปเดตวงเงินงบประมาณสำหรับหมวดหมู่ที่เลือก",
            },
          }
        )

        .delete(
          "/:id",
          async ({ params, user, set }) => {
            const userId = Number(user.id);
            await budgetService.deleteBudget(userId, Number(params.id));
            await clearBudgetCache(userId);

            set.status = StatusCodes.NO_CONTENT;
            return {
              message: "Budget deleted successfully",
            };
          },
          {
            params: budgetSchema.paramsId,
            beforeHandle: limit({
              max: 20,
              window: 60,
              prefix: "delete-budget",
            }),
            detail: {
              summary: "ลบงบประมาณ",
              description: "ลบข้อมูลการตั้งงบประมาณของหมวดหมู่ที่เลือก",
            },
          }
        )
  );
