import { Elysia } from "elysia";
import { StatusCodes } from "http-status-codes";
import { authenticateJWT } from "@/common/middlewares/auth.middleware";
import { cached } from "@/common/utils/cache";
import { clearGoalCache, goalCache } from "./goal.cache";
import * as goalSchema from "./goal.schema";
import { GoalService } from "./goal.service";

const goalService = new GoalService();

export const goalController = new Elysia({ prefix: "/goal", tags: ["GOAL"] })
  .use(authenticateJWT)
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
    }
  )

  .put(
    "/:id",
    async ({ params: { id }, body, user, set }) => {
      const userId = Number(user.id);

      const result = await goalService.updateGoal(userId, Number(id), body);
      await clearGoalCache(userId);

      set.status = StatusCodes.OK;
      return {
        message: "Goal updated successfully",
        data: result,
      };
    },
    {
      params: goalSchema.paramsId,
      body: goalSchema.updateGoal,
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
    }
  );
