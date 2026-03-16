import { eq } from "drizzle-orm";
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
}
