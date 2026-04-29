import { Elysia } from "elysia";
import { StatusCodes } from "http-status-codes";
import { authenticateJWT } from "@/common/middlewares/auth.middleware";
import { cached } from "@/common/utils/cache";
import { clearBudgetCache } from "../budget/budget.cache";
import { clearSettingCache, settingCache } from "./setting.cache";
import * as settingSchema from "./setting.schema";
import { SettingService } from "./setting.service";

const settingService = new SettingService();

export const settingController = new Elysia({
  prefix: "/setting",
  tags: ["SETTING"],
})
  .use(authenticateJWT)
  .get("/", async ({ user, set }) => {
    const userId = Number(user.id);
    const cacheKey = settingCache.detail(userId);

    const { data, status } = await cached(
      cacheKey,
      () => settingService.getSettings(userId),
      "24h"
    );

    set.headers["X-Cache"] = status;
    set.status = StatusCodes.OK;
    return {
      message: "Settings fetched successfully",
      data,
    };
  })
  .put(
    "/",
    async ({ user, body, set }) => {
      const userId = Number(user.id);

      const result = await settingService.updateSettings(userId, body);
      await clearSettingCache(userId);
      await clearBudgetCache(userId);

      set.status = StatusCodes.OK;
      return {
        message: "Settings updated successfully",
        data: result,
      };
    },
    {
      body: settingSchema.updateSetting,
    }
  );
