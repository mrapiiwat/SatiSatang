import { type Static, t } from "elysia";

export const createGoal = t.Object({
  name: t.String({
    minLength: 1,
    error: "Name is required",
  }),
  amount: t.Numeric({
    minimum: 1,
    error: "Amount must be positive",
  }),
  deadline: t.Optional(
    t.Union([t.Date(), t.String()], {
      error: "Invalid date format",
    })
  ),
});

export type createGoal = Static<typeof createGoal>;

export const updateGoal = t.Object({
  name: t.Optional(t.String({ minLength: 1 })),
  amount: t.Optional(t.Numeric({ minimum: 1 })),
  deadline: t.Optional(t.Nullable(t.Union([t.Date(), t.String()]))),
});

export type updateGoal = Static<typeof updateGoal>;

export const getGoalsQuery = t.Object({
  month: t.Optional(t.Numeric()),
  year: t.Optional(t.Numeric()),
  isFinished: t.Optional(t.Boolean()),
});

export type getGoalsQuery = Static<typeof getGoalsQuery>;

export const paramsId = t.Object({
  id: t.Numeric(),
});
