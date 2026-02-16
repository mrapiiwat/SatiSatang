import { type Static, t } from "elysia";

export enum Frequency {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

export const createBudget = t.Object({
  amount: t.Numeric({
    minimum: 1,
    error: "Amount must be positive",
  }),
  categoryId: t.Numeric({
    error: "Category ID is required",
  }),
  frequency: t.Union(
    [
      t.Literal(Frequency.DAILY),
      t.Literal(Frequency.WEEKLY),
      t.Literal(Frequency.MONTHLY),
      t.Literal(Frequency.YEARLY),
    ],
    {
      error: "Invalid frequency (DAILY, WEEKLY, MONTHLY, YEARLY)",
    }
  ),
});

export type createBudget = Static<typeof createBudget>;

export const updateBudget = t.Object({
  amount: t.Optional(t.Numeric({ minimum: 1 })),
  categoryId: t.Optional(t.Numeric()),
  frequency: t.Optional(
    t.Union([
      t.Literal(Frequency.DAILY),
      t.Literal(Frequency.WEEKLY),
      t.Literal(Frequency.MONTHLY),
      t.Literal(Frequency.YEARLY),
    ])
  ),
});

export type updateBudget = Static<typeof updateBudget>;

export const getBudgetsQuery = t.Object({
  month: t.Optional(t.Numeric()),
  year: t.Optional(t.Numeric()),
  isOverDeadline: t.Optional(t.Boolean()),
});

export type getBudgetsQuery = Static<typeof getBudgetsQuery>;

export const paramsId = t.Object({
  id: t.Numeric(),
});
