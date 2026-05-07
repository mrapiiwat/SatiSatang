import { type Static, t } from "elysia";

export const BotType = {
  Sati: "sati",
  Satang: "satang",
} as const;

export type BotType = (typeof BotType)[keyof typeof BotType];

export const getSessionQuery = t.Object({
  cursor: t.Optional(t.Numeric()),
  limit: t.Optional(t.Numeric({ default: 20 })),
});

export const checkMessage = t.Object({
  content: t.String({ minLength: 1 }),
});

export const chatMessage = t.Object({
  content: t.String({ minLength: 1 }),
});

export const satiLog = t.Object({
  role: t.Union([t.Literal("user"), t.Literal("assistant")]),
  content: t.String(),
});

export const paramsId = t.Object({
  id: t.String(),
});

export type getSessionQuery = Static<typeof getSessionQuery>;
export type checkMessage = Static<typeof checkMessage>;
export type chatMessage = Static<typeof chatMessage>;
export type satiLog = Static<typeof satiLog>;
