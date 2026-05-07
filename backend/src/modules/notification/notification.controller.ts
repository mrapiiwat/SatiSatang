import { Elysia } from "elysia";
import { StatusCodes } from "http-status-codes";
import { authenticateJWT } from "@/common/middlewares/auth.middleware";
import { limit } from "@/common/middlewares/limit.middleware";
import * as notificationSchema from "./notification.schema";
import { NotificationService } from "./notification.service";

const notificationService = new NotificationService();

export const notificationController = new Elysia({
  prefix: "/notification",
  tags: ["NOTIFICATION"],
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
            beforeHandle: limit({
              max: 10,
              window: 60,
              prefix: "register-token",
            }),
            detail: {
              summary: "ลงทะเบียนอุปกรณ์สำหรับการแจ้งเตือน",
              description:
                "บันทึก Push Token เพื่อใช้ส่งการแจ้งเตือนไปยังอุปกรณ์ของผู้ใช้งาน",
            },
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
            beforeHandle: limit({
              max: 10,
              window: 60,
              prefix: "unregister-token",
            }),
            detail: {
              summary: "ยกเลิกการลงทะเบียนอุปกรณ์",
              description:
                "ลบ Push Token ออกจากระบบเพื่อหยุดส่งการแจ้งเตือนไปยังอุปกรณ์นั้น",
            },
          }
        )
  );
