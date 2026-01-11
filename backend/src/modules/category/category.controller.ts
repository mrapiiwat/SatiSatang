import { Elysia } from "elysia";
import { StatusCodes } from "http-status-codes";
import { authenticateJWT } from "@/common/middlewares/auth.middleware";
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
      const { result, includeGoals } = await categoriesService.getCategories(
        userId,
        query
      );

      set.status = StatusCodes.OK;
      return {
        message: `Categories${includeGoals ? " (and goals)" : ""} fetched successfully`,
        data: result,
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

      set.status = StatusCodes.OK;
      return result;
    },
    {
      params: categorySchema.paramsId,
    }
  );
