import { scanAndDelete } from "@/common/utils/cache";

export const settingCache = {
  detail: (userId: number) => `user_settings:user:${userId}`,
  pattern: (userId: number) => `user_settings:user:${userId}*`,
};

export const clearSettingCache = async (userId: number) => {
  try {
    const pattern = settingCache.pattern(userId);
    await scanAndDelete(pattern);
    console.log(`[Cache] Cleared Settings for user: ${userId}`);
  } catch (error) {
    console.error(`[Cache] Error clearing setting cache:`, error);
  }
};
