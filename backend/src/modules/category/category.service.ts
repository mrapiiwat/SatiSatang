import { and, eq, gte, ilike, isNull, or, type SQL } from "drizzle-orm";
import { BadRequestError, NotFoundError } from "@/common/errors";
import { db } from "@/db";
import { category, goals } from "@/db/schema";
import type * as categorySchema from "./category.schema";

export class CategoriesService {
  async createCategory(userId: number, data: categorySchema.CategorySchema) {
    const existing = await db.query.category.findFirst({
      where: and(eq(category.name, data.name), eq(category.userId, userId)),
    });

    if (existing) {
      throw new BadRequestError("Category name already exists");
    }
    const [newCategory] = await db
      .insert(category)
      .values({
        name: data.name,
        type: data.type,
        userId: userId,
        iconId: data.iconId,
      })
      .returning();

    return newCategory;
  }

  async getCategories(
    userId: number,
    query: categorySchema.GetCategoriesQuery
  ) {
    const { search, type: typeParam, includeGoals: includeGoalsParam } = query;
    const includeGoals =
      includeGoalsParam === "true" || includeGoalsParam === "1";

    const categoryFilters: SQL[] = [eq(category.userId, userId)];

    if (typeParam) {
      categoryFilters.push(eq(category.type, typeParam));
    }

    if (search) {
      const searchTerms = search.split(" ").filter(Boolean);
      if (searchTerms.length > 0) {
        const searchFilters = searchTerms.map((word) =>
          ilike(category.name, `%${word}%`)
        );
        categoryFilters.push(or(...searchFilters)!);
      }
    }

    const categoriesData = await db.query.category.findMany({
      where: and(...categoryFilters, isNull(category.deletedAt)),
      orderBy: (table, { desc }) => [desc(table.createdAt)],
    });

    let goalsData: (typeof goals.$inferSelect)[] = [];

    if (includeGoals && (typeParam === "EXPENSE" || !typeParam)) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      goalsData = await db.query.goals.findMany({
        where: and(
          eq(goals.userId, userId),
          eq(goals.finished, false),
          or(gte(goals.deadline, today), isNull(goals.deadline)),
          isNull(goals.deletedAt)
        ),
      });
    }

    const combined: categorySchema.CombinedCategory[] = [
      ...categoriesData.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type as "INCOME" | "EXPENSE",
        userId: c.userId,
        icon: `${Bun.env.APP_BASE_URL}/api/icon/${c.iconId}`,
        isGoal: false,
      })),
      ...goalsData.map((g) => ({
        id: g.id,
        name: g.name,
        type: "EXPENSE" as const,
        userId: g.userId,
        isGoal: true,
      })),
    ];

    return { result: combined, includeGoals };
  }

  async updateCategory(
    userId: number,
    categoryId: number,
    data: categorySchema.UpdateCategoryInput
  ) {
    const existing = await db.query.category.findFirst({
      where: and(
        eq(category.id, categoryId),
        eq(category.userId, userId),
        isNull(category.deletedAt)
      ),
    });

    if (!existing) {
      throw new NotFoundError("Category not found");
    }

    const [updated] = await db
      .update(category)
      .set({
        ...data,
      })
      .where(eq(category.id, categoryId))
      .returning();

    return {
      id: updated.id,
      name: updated.name,
      type: updated.type,
      userId: updated.userId,
      icon: `${Bun.env.APP_BASE_URL}/api/icon/${updated.iconId}`,
    };
  }

  async deleteCategory(categoryId: number, userId: number) {
    const existing = await db.query.category.findFirst({
      where: and(eq(category.id, categoryId), eq(category.userId, userId)),
    });

    if (!existing) {
      throw new NotFoundError("Category not found");
    }

    await db
      .update(category)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(category.id, categoryId),
          eq(category.userId, userId),
          isNull(category.deletedAt)
        )
      );

    return { message: "Category deleted successfully" };
  }
}
