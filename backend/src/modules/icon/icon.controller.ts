import { Elysia } from "elysia";
import { StatusCodes } from "http-status-codes";
import { authenticateJWT } from "@/common/middlewares/auth.middleware";
import * as iconSchema from "./icon.schema";
import { IconService } from "./icon.service";

const iconService = new IconService();

export const iconController = new Elysia({ prefix: "/icon" })
  .use(authenticateJWT)
  .post(
    "/",
    async ({ body, user, set }) => {
      const userId = Number(user.id);

      const result = await iconService.createIcon(userId, body);

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

      const result = await iconService.getIcons(userId, search);

      set.status = StatusCodes.OK;

      return {
        message: "Icons fetched successfully",
        data: result,
      };
    },
    {
      query: iconSchema.querySearch,
    }
  )
  .get(
    "/:id",
    async ({ params: { id }, set }) => {
      const { stream, contentType, filename } = await iconService.downloadIcon(
        Number(id)
      );

      set.headers["Content-Disposition"] = `inline; filename="${filename}"`;

      if (contentType) {
        set.headers["Content-Type"] = contentType;
      }

      return stream;
    },
    {
      params: iconSchema.paramsId,
    }
  )
  .put(
    "/:id",
    async ({ params: { id }, body, set }) => {
      const result = await iconService.updateIcon(Number(id), body);

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
