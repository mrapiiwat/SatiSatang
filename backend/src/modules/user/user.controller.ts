import { Elysia } from "elysia";
import { StatusCodes } from "http-status-codes";
import { redis } from "@/common/config/redis";
import { BadRequestError } from "@/common/exceptions";
import { authenticateJWT } from "@/common/middlewares/auth.middleware";
import { clearUserCache, userCache } from "@/common/utils/cache";
import * as userSchema from "./user.schema";
import { UserService } from "./user.service";

const userService = new UserService();

export const userController = new Elysia()
  .use(authenticateJWT)
  .get("/me", async ({ user, set }) => {
    const userId = Number(user.id);
    const provider = user.provider;

    const cacheKey = userCache.me(userId, provider);

    try {
      const cachedUser = await redis.get(cacheKey);

      if (cachedUser) {
        set.headers["X-Cache"] = "HIT";
        return JSON.parse(cachedUser);
      }

      const result = await userService.me(userId, provider);
      await redis.set(cacheKey, JSON.stringify(result), "EX", 3600);

      set.headers["X-Cache"] = "MISS";
      set.status = 200;

      return result;
    } catch {
      const result = await userService.me(userId, provider);
      set.headers["X-Cache"] = "ERROR";

      return result;
    }
  })

  .put(
    "/change-password",
    async ({ body, set, user }) => {
      const userId = Number(user.id);

      if (body.password !== body.confirmPassword) {
        throw new BadRequestError("Passwords do not match");
      }

      const result = await userService.changePassword(userId, body);
      await clearUserCache(userId);
      set.status = StatusCodes.OK;
      return result;
    },
    {
      body: userSchema.password,
    }
  )

  .put(
    "/update-name",
    async ({ body, set, user }) => {
      const userId = Number(user.id);
      const result = await userService.updateName(body, userId);

      await clearUserCache(userId);
      set.status = StatusCodes.OK;
      return {
        message: "Name updated successfully",
        name: result,
      };
    },
    {
      body: userSchema.name,
    }
  )

  .delete(
    "/delete-account/:id",
    async ({ user, set, cookie: { refreshToken }, body }) => {
      const userId = Number(user.id);
      const result = await userService.deleteAccount(userId, body);

      refreshToken.remove();

      await clearUserCache(userId);
      set.status = StatusCodes.OK;
      return result;
    },
    {
      body: userSchema.deleteAccount,
    }
  )

  .get(
    "/summary",
    async ({ query, user, set }) => {
      const userId = Number(user.id);
      const result = await userService.getSummary(userId, query);

      set.status = StatusCodes.OK;
      return {
        message: "Summary fetched successfully",
        ...result,
      };
    },
    {
      query: userSchema.getSummaryQuery,
    }
  )

  .get("/users/balance", async ({ user, set }) => {
    const userId = Number(user.id);
    set.status = StatusCodes.OK;
    const result = await userService.getBalance(userId);

    return result;
  });
