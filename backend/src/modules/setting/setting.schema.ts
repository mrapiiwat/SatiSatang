import { type Static, t } from "elysia";

export const updateSetting = t.Partial(
  t.Object({
    appLanguage: t.Union([t.Literal("th"), t.Literal("en")]),
    aiLanguage: t.Union([t.Literal("th"), t.Literal("en")]),
    theme: t.Union([
      t.Literal("light"),
      t.Literal("dark"),
      t.Literal("system"),
    ]),
    isNotificationEnabled: t.Boolean(),
    budgetStartDate: t.Numeric({
      minimum: 1,
      maximum: 31,
      error: "วันที่เริ่มงบประมาณต้องอยู่ระหว่าง 1 ถึง 31",
    }),
  })
);

export type updateSetting = Static<typeof updateSetting>;
