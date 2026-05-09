import { Elysia } from "elysia";
import { StatusCodes } from "http-status-codes";
import { UAParser } from "ua-parser-js";
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
          async ({ user, body, set, headers }) => {
            const userId = Number(user.id);
            const userAgent = headers["user-agent"] || "unknown";
            const parser = new UAParser(userAgent);
            const device = parser.getDevice();
            const os = parser.getOS();

            const deviceName = device.model
              ? `${device.model} (${os.name} ${os.version})`
              : `${os.name} (Browser)`;

            const deviceType = device.type || "desktop";

            const result = await notificationService.registerToken(
              userId,
              body.token,
              deviceName,
              deviceType
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
        .delete(
          "/token/all",
          async ({ user, set }) => {
            const userId = Number(user.id);
            await notificationService.unregisterAllToken(userId);

            set.status = StatusCodes.OK;
            return { message: "All tokens removed" };
          },
          {
            beforeHandle: limit({
              max: 10,
              window: 60,
              prefix: "unregister-token",
            }),
            detail: {
              summary: "ยกเลิกการลงทะเบียนอุปกรณ์ทั้งหมด",
              description:
                "ลบ Push Token ทั้งหมดของผู้ใช้งานออกจากระบบเพื่อหยุดส่งการแจ้งเตือนไปยังอุปกรณ์ทั้งหมดของผู้ใช้งาน",
            },
          }
        )
  );
