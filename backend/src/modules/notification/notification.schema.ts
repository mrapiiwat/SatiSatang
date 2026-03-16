import { type Static, t } from "elysia";

export const registerToken = t.Object({
  token: t.String(),
});

export type registerToken = Static<typeof registerToken>;
