import { type Static, t } from "elysia";

export const getTransactionsQuery = t.Object({
  search: t.Optional(t.String()),
  month: t.Optional(t.Numeric()),
  year: t.Optional(t.Numeric()),
  page: t.Optional(t.Numeric({ default: 1 })),
  limit: t.Optional(t.Numeric({ default: 10 })),
  sortBy: t.Optional(
    t.Union([t.Literal("date"), t.Literal("amount"), t.Literal("createdAt")])
  ),
  order: t.Optional(t.Union([t.Literal("asc"), t.Literal("desc")])),
});

export type getTransactionsQuery = Static<typeof getTransactionsQuery>;

export const getTotalAmountQuery = t.Object({
  month: t.Optional(t.Numeric()),
  year: t.Optional(t.Numeric()),
  type: t.Optional(t.Union([t.Literal("INCOME"), t.Literal("EXPENSE")])),
});

export type getTotalAmountQuery = Static<typeof getTotalAmountQuery>;

export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

export const createTransaction = t.Object({
  type: t.Union([
    t.Literal(TransactionType.INCOME),
    t.Literal(TransactionType.EXPENSE),
  ]),
  description: t.Optional(t.String()),
  amount: t.Numeric(),
  date: t.Optional(t.String()),
  categoryId: t.Numeric(),
  receipt: t.Optional(
    t.File({
      maxSize: 5 * 1024 * 1024,
      error: "Image must be less than 5MB",
    })
  ),
  toAccount: t.Optional(t.String()),
  fromAccount: t.Optional(t.String()),
  isGoal: t.Optional(t.Boolean()),
});

export type createTransaction = Static<typeof createTransaction>;

export const uploadReceipt = t.Object({
  receipt: t.Files({
    maxSize: 5 * 1024 * 1024,
    minItems: 1,
  }),
});

export type uploadReceipt = Static<typeof uploadReceipt>;

export const updateTransaction = t.Object({
  type: t.Optional(
    t.Union([
      t.Literal(TransactionType.INCOME),
      t.Literal(TransactionType.EXPENSE),
    ])
  ),
  description: t.Optional(t.String()),
  amount: t.Optional(t.Numeric()),
  date: t.Optional(t.String()),
  categoryId: t.Optional(t.Numeric()),
  receipt: t.Optional(t.File({ maxSize: 5 * 1024 * 1024 })),
  toAccount: t.Optional(t.String()),
  fromAccount: t.Optional(t.String()),
  isGoal: t.Optional(t.Boolean()),
});

export type updateTransaction = Static<typeof updateTransaction>;

export const predictCategory = t.Object({
  description: t.String({ minLength: 1, error: "Description is required" }),
});

export type predictCategory = Static<typeof predictCategory>;

export const paramsId = t.Object({
  id: t.Numeric(),
});
