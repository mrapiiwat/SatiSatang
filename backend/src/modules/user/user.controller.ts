import { Elysia } from "elysia";
import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "@/common/exceptions";
import { authenticateJWT } from "@/common/middlewares/auth.middleware";
import { cached } from "@/common/utils/cache";
import { clearUserCache, userCache } from "./user.cache";
import * as userSchema from "./user.schema";
import { UserService } from "./user.service";

const userService = new UserService();

export const userController = new Elysia({ tags: ["USER"] })
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
          "/me",
          async ({ user, set }) => {
            const userId = Number(user.id);
            const cacheKey = userCache.me(userId, user.provider);

            const { data, status } = await cached(
              cacheKey,
              () => userService.me(userId, user.provider),
              "1h"
            );

            set.headers["X-Cache"] = status;
            set.status = 200;

            return data;
          },
          {
            detail: {
              summary: "ดึงข้อมูลส่วนตัวของผู้ใช้งาน",
              description: "ดึงข้อมูลโปรไฟล์ของผู้ใช้งานที่กำลังเข้าสู่ระบบอยู่",
            },
          }
        )

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
            detail: {
              summary: "เปลี่ยนรหัสผ่าน",
              description: "เปลี่ยนรหัสผ่านใหม่สำหรับผู้ใช้งานที่เข้าสู่ระบบด้วยอีเมล",
            },
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
            detail: {
              summary: "แก้ไขชื่อผู้ใช้งาน",
              description: "อัปเดตชื่อที่แสดงในระบบของผู้ใช้งาน",
            },
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
            detail: {
              summary: "ลบบัญชีผู้ใช้งาน",
              description: "ลบข้อมูลบัญชีและข้อมูลที่เกี่ยวข้องทั้งหมดของผู้ใช้งานออกจากระบบ",
            },
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
            detail: {
              summary: "ดึงข้อมูลสรุปภาพรวมทางการเงิน",
              description: "ดึงข้อมูลสรุป รายรับ รายจ่าย และงบประมาณคงเหลือ",
            },
          }
        )

        .get(
          "/users/balance",
          async ({ user, set }) => {
            const userId = Number(user.id);
            set.status = StatusCodes.OK;
            const result = await userService.getBalance(userId);

            return result;
          },
          {
            detail: {
              summary: "ดึงข้อมูลยอดเงินคงเหลือ",
              description: "ดึงยอดเงินรวมทั้งหมดที่มีอยู่ในปัจจุบัน",
            },
          }
        )
  );
