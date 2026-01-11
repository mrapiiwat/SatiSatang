import { type Static, t } from "elysia";

export const GetStocksQuerySchema = t.Object({
  search: t.Optional(t.String()),
  page: t.Optional(t.Numeric({ default: 1 })),
  limit: t.Optional(t.Numeric({ default: 10 })),
});

export type GetStocksQuery = Static<typeof GetStocksQuerySchema>;

export const paramsId = t.Object({
  id: t.Numeric(),
});

export type paramsId = Static<typeof paramsId>;
