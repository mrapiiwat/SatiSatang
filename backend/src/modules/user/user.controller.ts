import { Elysia } from "elysia";
import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "@/common/exceptions";
import { authenticateJWT } from "@/common/middlewares/auth.middleware";
import * as userSchema from "./user.schema";
import { UserService } from "./user.service";

const userService = new UserService();

export const userController = new Elysia()
  .use(authenticateJWT)
  .get("/me", async ({ user, set }) => {
    const userId = Number(user.id);

    const result = await userService.me(userId);

    set.status = StatusCodes.OK;
    return result;
  })
  .put(
    "/change-password",
    async ({ body, set, user }) => {
      const userId = Number(user.id);

      if (body.password !== body.confirmPassword) {
        throw new BadRequestError("Passwords do not match");
      }

      const result = userService.changePassword(userId, body);
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
      set.status = StatusCodes.OK;
      const result = await userService.deleteAccount(userId, body);

      refreshToken.remove();

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
  );
