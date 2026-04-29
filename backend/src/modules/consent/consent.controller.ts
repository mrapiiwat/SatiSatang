import { Elysia } from "elysia";
import { StatusCodes } from "http-status-codes";
import { authenticateJWT } from "@/common/middlewares/auth.middleware";
import { ConsentService } from "./consent.service";

const consentService = new ConsentService();

export const consentController = new Elysia({
  prefix: "/consent",
  tags: ["CONSENT"],
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
        .get(
          "/status",
          async ({ set, user }) => {
            const userId = Number(user.id);
            const status = await consentService.getConsentStatus(userId);

            set.status = StatusCodes.OK;
            return status;
          },
          {
            detail: {
              summary: "ตรวจสอบสถานะความยินยอม",
              description:
                "ตรวจสอบว่าผู้ใช้งานได้ยอมรับนโยบายความเป็นส่วนตัวและข้อกำหนดต่างๆ แล้วหรือยัง",
            },
          }
        )
        .post(
          "/accept",
          async ({ set, user, headers }) => {
            const userId = Number(user.id);
            const userAgent = headers["user-agent"] || "unknown";
            const ipAddress =
              headers["x-forwarded-for"] || headers["x-real-ip"] || "unknown";

            const result = await consentService.acceptConsents(
              userId,
              ipAddress,
              userAgent
            );

            set.status = StatusCodes.CREATED;
            return result;
          },
          {
            detail: {
              summary: "ยืนยันการยอมรับความยินยอม",
              description: "บันทึกการยอมรับนโยบายและข้อกำหนดของผู้ใช้งาน",
            },
          }
        )
  );
