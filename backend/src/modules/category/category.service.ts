import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { and, eq, gte, ilike, isNull, or, type SQL } from "drizzle-orm";
import { BUCKET_NAME, s3Client } from "@/common/config/s3";
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
      with: {
        icon: true,
      },
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

    const categoryResult = await Promise.all(
      categoriesData.map(async (c) => {
        let signedIconUrl: string | undefined;

        if (c.icon?.url) {
          try {
            const command = new GetObjectCommand({
              Bucket: BUCKET_NAME,
              Key: c.icon.url,
            });

            signedIconUrl = await getSignedUrl(s3Client, command, {
              expiresIn: 3600,
            });
          } catch (error) {
            console.error(`Failed to sign url for category ${c.id}`, error);
          }
        }

        return {
          id: c.id,
          name: c.name,
          type: c.type as "INCOME" | "EXPENSE",
          userId: c.userId,
          icon: signedIconUrl,
          isGoal: false,
        };
      })
    );

    const goalResult = goalsData.map((g) => ({
      id: g.id,
      name: g.name,
      type: "EXPENSE" as const,
      userId: g.userId,
      isGoal: true,
    }));

    const combined: categorySchema.CombinedCategory[] = [
      ...categoryResult,
      ...goalResult,
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
