import { Elysia } from "elysia";
import { StatusCodes } from "http-status-codes";
import { authenticateJWT } from "@/common/middlewares/auth.middleware";
import { cached } from "@/common/utils/cache";
import { clearIconCache, iconCache } from "./icon.cache";
import * as iconSchema from "./icon.schema";
import { IconService } from "./icon.service";

const iconService = new IconService();

export const iconController = new Elysia({ prefix: "/icon", tags: ["ICON"] })
  .use(authenticateJWT)
  .post(
    "/",
    async ({ body, user, set }) => {
      const userId = Number(user.id);

      const result = await iconService.createIcon(userId, body);
      await clearIconCache(userId);

      set.status = StatusCodes.CREATED;
      return {
        message: "Icon uploaded successfully",
        data: result,
      };
    },
    {
      body: iconSchema.createIcon,
    }
  )
  .get(
    "/",
    async ({ query, user, set }) => {
      const userId = Number(user.id);
      const search = query.search;
      const cacheKey = iconCache.list(userId, search);

      const { data, status } = await cached(
        cacheKey,
        () => iconService.getIcons(userId, search),
        "50m"
      );

      set.headers["X-Cache"] = status;
      set.status = StatusCodes.OK;

      return {
        message: "Icons fetched successfully",
        data: data,
      };
    },
    {
      query: iconSchema.querySearch,
    }
  )
  .put(
    "/:id",
    async ({ params: { id }, body, set, user }) => {
      const userId = Number(user.id);
      const iconId = Number(id);
      const result = await iconService.updateIcon(iconId, body);
      await clearIconCache(userId);

      set.status = StatusCodes.OK;
      return {
        message: "Icon updated successfully",
        data: result,
      };
    },
    {
      params: iconSchema.paramsId,
      body: iconSchema.updateIcon,
    }
  );
