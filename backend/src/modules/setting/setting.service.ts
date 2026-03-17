import { eq } from "drizzle-orm";
import { NotFoundError } from "@/common/exceptions";
import { db } from "@/db";
import { userSettings } from "@/db/schema";
import type * as settingSchema from "./setting.schema";

export class SettingService {
  async getSettings(userId: number) {
    const settings = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, userId),
    });

    if (!settings) {
      const [newSettings] = await db
        .insert(userSettings)
        .values({
          userId,
          appLanguage: "th",
          aiLanguage: "th",
          theme: "system",
          budgetStartDate: 1,
          isNotificationEnabled: false,
        })
        .returning();

      return newSettings;
    }

    return settings;
  }

  async updateSettings(userId: number, data: settingSchema.updateSetting) {
    const [updated] = await db
      .update(userSettings)
      .set(data)
      .where(eq(userSettings.userId, userId))
      .returning();

    if (!updated) {
      throw new NotFoundError("ไม่สามารถอัปเดตข้อมูลการตั้งค่าได้");
    }

    return updated;
  }
}
