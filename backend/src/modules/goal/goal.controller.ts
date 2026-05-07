import { Elysia } from "elysia";
import { StatusCodes } from "http-status-codes";
import { authenticateJWT } from "@/common/middlewares/auth.middleware";
import { limit } from "@/common/middlewares/limit.middleware";
import { cached } from "@/common/utils/cache";
import { clearGoalCache, goalCache } from "./goal.cache";
import * as goalSchema from "./goal.schema";
import { GoalService } from "./goal.service";

const goalService = new GoalService();

export const goalController = new Elysia({ prefix: "/goal", tags: ["GOAL"] })
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
            const result = await goalService.createGoal(userId, body);
            await clearGoalCache(userId);

            set.status = StatusCodes.CREATED;
            return {
              message: "Goal created successfully",
              data: result,
            };
          },
          {
            body: goalSchema.createGoal,
            beforeHandle: limit({
              max: 20,
              window: 60,
              prefix: "create-goal",
            }),
            detail: {
              summary: "สร้างเป้าหมายการออมใหม่",
              description:
                "กำหนดเป้าหมายทางการเงินใหม่ เช่น การออมเงินซื้อบ้าน หรือเที่ยวต่างประเทศ",
            },
          }
        )
        .get(
          "/",
          async ({ query, user, set }) => {
            const userId = Number(user.id);
            const cacheKey = goalCache.list(userId, query);

            const { data, status } = await cached(
              cacheKey,
              () => goalService.getGoals(userId, query),
              "1h"
            );

            set.headers["X-Cache"] = status;
            set.status = StatusCodes.OK;
            return {
              message: "Goals summary fetched successfully",
              data: data.data,
              summary: data.summary,
            };
          },
          {
            query: goalSchema.getGoalsQuery,
            detail: {
              summary: "ดึงรายการและสรุปเป้าหมายการออม",
              description: "ดึงรายการเป้าหมายทั้งหมดพร้อมสรุปความคืบหน้าของการออม",
            },
          }
        )

        .put(
          "/:id",
          async ({ params: { id }, body, user, set }) => {
            const userId = Number(user.id);

            const result = await goalService.updateGoal(
              userId,
              Number(id),
              body
            );
            await clearGoalCache(userId);

            set.status = StatusCodes.OK;
            return {
              message: "Goal updated successfully",
              data: result,
            };
          },
          {
            body: goalSchema.updateGoal,
            params: goalSchema.paramsId,
            beforeHandle: limit({
              max: 20,
              window: 60,
              prefix: "update-goal",
            }),
            detail: {
              summary: "แก้ไขข้อมูลเป้าหมายการออม",
              description:
                "อัปเดตรายละเอียด เช่น จำนวนเงินเป้าหมาย หรือ วันที่ต้องการบรรลุเป้าหมาย",
            },
          }
        )
        .delete(
          "/:id",
          async ({ params: { id }, user, set }) => {
            const userId = Number(user.id);

            const result = await goalService.deleteGoal(Number(id), userId);
            await clearGoalCache(userId);

            set.status = StatusCodes.OK;
            return result;
          },
          {
            params: goalSchema.paramsId,
            beforeHandle: limit({
              max: 20,
              window: 60,
              prefix: "delete-goal",
            }),
            detail: {
              summary: "ลบเป้าหมายการออม",
              description: "ลบเป้าหมายการออมที่ไม่ต้องการออกจากระบบ",
            },
          }
        )
  );
