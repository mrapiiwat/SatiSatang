import { eq, inArray } from "drizzle-orm";
import { messaging } from "@/common/config/firebase";
import {
  NOTIFICATION_TEMPLATES,
  type NotificationParamsMap,
} from "@/common/constants/notifications";
import { db } from "@/db";
import { userFcmTokens } from "@/db/schema";

export class NotificationService {
  async registerToken(userId: number, token: string) {
    const [result] = await db
      .insert(userFcmTokens)
      .values({
        userId,
        token,
      })
      .onConflictDoUpdate({
        target: userFcmTokens.token,
        set: { userId: userId },
      })
      .returning();

    return result;
  }

  async unregisterToken(token: string) {
    await db.delete(userFcmTokens).where(eq(userFcmTokens.token, token));

    return { success: true };
  }

  async sendPushNotification(userId: number, title: string, body: string) {
    try {
      const tokensRecord = await db
        .select()
        .from(userFcmTokens)
        .where(eq(userFcmTokens.userId, userId));

      if (tokensRecord.length === 0) return;

      const registrationTokens = tokensRecord.map((t) => t.token);

      const response = await messaging.sendEachForMulticast({
        data: {
          title: title,
          body: body,
        },
        tokens: registrationTokens,
      });

      if (response.failureCount > 0) {
        const tokensToDelete: string[] = [];

        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const error = resp.error;
            if (
              error?.code === "messaging/registration-token-not-registered" ||
              error?.code === "messaging/invalid-registration-token"
            ) {
              tokensToDelete.push(registrationTokens[idx]);
            }
          }
        });

        if (tokensToDelete.length > 0) {
          await db
            .delete(userFcmTokens)
            .where(inArray(userFcmTokens.token, tokensToDelete));
        }
      }

      return response;
    } catch (error) {
      console.error("Notification Error:", error);
    }
  }

  async sendTemplatedNotification<T extends keyof NotificationParamsMap>(
    userId: number,
    lang: "th" | "en",
    template: T,
    params: NotificationParamsMap[T]
  ) {
    const templateData = NOTIFICATION_TEMPLATES[template][lang];
    const title = templateData.title;
    const bodyFunc = templateData.body as (
      p: NotificationParamsMap[T]
    ) => string;
    const body = bodyFunc(params);

    return this.sendPushNotification(userId, title, body);
  }
}
