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

export type getSessionQuery = Static<typeof getSessionQuery>;
export type checkMessage = Static<typeof checkMessage>;
export type chatMessage = Static<typeof chatMessage>;
