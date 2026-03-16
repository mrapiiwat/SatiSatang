import { cron } from "@elysiajs/cron";
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { db } from "@/db";
import { userFcmTokens, userSettings } from "@/db/schema";
import { NotificationService } from "./notification.service";

const notificationService = new NotificationService();

export const notificationCrons = new Elysia({ name: "Cron.Notification" }).use(
  cron({
    name: "daily-reminder",
    pattern: "35 05 * * *",
    async run() {
      try {
        const targetUsers = await db
          .select({
            userId: userFcmTokens.userId,
          })
          .from(userFcmTokens)
          .innerJoin(
            userSettings,
            eq(userFcmTokens.userId, userSettings.userId)
          )
          .where(eq(userSettings.isNotificationEnabled, true));

        if (targetUsers.length === 0) return;

        const uniqueUserIds = [...new Set(targetUsers.map((u) => u.userId))];

        await Promise.allSettled(
          uniqueUserIds.map((userId) =>
            notificationService.sendPushNotification(
              userId,
              "SATISATANG",
              "อย่าลืมเช็ครายจ่ายวันนี้ และบันทึกลงแอปด้วยนะ!"
            )
          )
        );
      } catch (error) {
        console.error("[Cron] Error:", error);
      }
    },
  })
);
