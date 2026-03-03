import { Elysia } from "elysia";
import { StatusCodes } from "http-status-codes";
import { authenticateJWT } from "@/common/middlewares/auth.middleware";
import {
  cached,
  categoryCache,
  clearCategoryCache,
} from "@/common/utils/cache";
import * as categorySchema from "./category.schema";
import { CategoriesService } from "./category.service";

const categoriesService = new CategoriesService();

export const categoryController = new Elysia()
  .use(authenticateJWT)
  .post(
    "/category",
    async ({ body, set, user }) => {
      const userId = Number(user.id);

      const result = await categoriesService.createCategory(userId, body);
      await clearCategoryCache(userId);
      set.status = StatusCodes.CREATED;
      return {
        message: "Category created successfully",
        data: result,
      };
    },
    {
      body: categorySchema.CategorySchema,
    }
  )
  .get(
    "/categories",
    async ({ query, user, set }) => {
      const userId = Number(user.id);
      const cacheKey = categoryCache.list(userId, query);

      const { data, status } = await cached(
        cacheKey,
        () => categoriesService.getCategories(userId, query),
        "50m"
      );

      set.headers["X-Cache"] = status;
      set.status = StatusCodes.OK;
      return {
        message: `Categories${data.includeGoals ? " (and goals)" : ""} fetched successfully`,
        data: data.result,
      };
    },
    {
      query: categorySchema.GetCategoriesQuerySchema,
    }
  )
  .put(
    "/category/:id",
    async ({ params: { id }, body, user, set }) => {
      const userId = Number(user.id);
      const categoryId = Number(id);

      const result = await categoriesService.updateCategory(
        userId,
        categoryId,
        body
      );
      await clearCategoryCache(userId);
      set.status = StatusCodes.OK;
      return {
        message: "Category updated successfully",
        data: result,
      };
    },
    {
      params: categorySchema.paramsId,
      body: categorySchema.UpdateCategorySchema,
    }
  )
  .delete(
    "/category/:id",
    async ({ params: { id }, user, set }) => {
      const userId = Number(user.id);
      const categoryId = Number(id);

      const result = await categoriesService.deleteCategory(userId, categoryId);
      await clearCategoryCache(userId);
      set.status = StatusCodes.OK;
      return result;
    },
    {
      params: categorySchema.paramsId,
    }
  );
