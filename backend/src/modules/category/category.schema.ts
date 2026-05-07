import { type Static, t } from "elysia";

export const CategorySchema = t.Object({
  name: t.String({
    minLength: 2,
    maxLength: 20,
    error: "Category name must be between 2 and 20 characters long",
  }),
  type: t.Enum({ INCOME: "INCOME", EXPENSE: "EXPENSE" }),
  iconId: t.Number(),
});

export const UpdateCategorySchema = t.Partial(CategorySchema);
export type CategorySchema = Static<typeof CategorySchema>;
export type UpdateCategoryInput = Partial<Static<typeof CategorySchema>>;

export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

export const GetCategoriesQuerySchema = t.Object({
  search: t.Optional(t.String()),
  type: t.Optional(t.Union([t.Literal("INCOME"), t.Literal("EXPENSE")])),
  includeGoals: t.Optional(t.String()),
});

export type GetCategoriesQuery = Static<typeof GetCategoriesQuerySchema>;

export interface CombinedCategory {
  id: number;
  name: string;
  type: "INCOME" | "EXPENSE";
  userId: number | null;
  icon?: string;
  isGoal: boolean;
}

export const paramsId = t.Object({
  id: t.String(),
});
