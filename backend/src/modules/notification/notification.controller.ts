import { Elysia } from "elysia";
import { StatusCodes } from "http-status-codes";
import { authenticateJWT } from "@/common/middlewares/auth.middleware";
import * as notificationSchema from "./notification.schema";
import { NotificationService } from "./notification.service";

const notificationService = new NotificationService();

export const notificationController = new Elysia({
  prefix: "/notification",
  tags: ["NOTIFICATION"],
})
  .use(authenticateJWT)
  .post(
    "/token",
    async ({ user, body, set }) => {
      const userId = Number(user.id);

      const result = await notificationService.registerToken(
        userId,
        body.token
      );

      set.status = StatusCodes.OK;
      return result;
    },
    {
      body: notificationSchema.registerToken,
    }
  )
  .delete(
    "/token",
    async ({ body, set }) => {
      await notificationService.unregisterToken(body.token);

      set.status = StatusCodes.OK;
      return { message: "Token removed" };
    },
    {
      body: notificationSchema.registerToken,
    }
  );
