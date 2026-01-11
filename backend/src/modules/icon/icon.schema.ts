import { type Static, t } from "elysia";

export const createIcon = t.Object({
  url: t.File({
    maxSize: 5 * 1024 * 1024,
    error: "File is required (key: 'url') and must be less than 5MB",
  }),
  description: t.Optional(t.String()),
});

export const querySearch = t.Object({
  search: t.Optional(t.String()),
});

export const paramsId = t.Object({
  id: t.Numeric(),
});

export type createIcon = Static<typeof createIcon>;

export const updateIcon = t.Object({
  url: t.Optional(
    t.File({
      maxSize: 5 * 1024 * 1024,
      error: "File must be less than 5MB",
    })
  ),
  description: t.Optional(t.String()),
});

export type updateIcon = Static<typeof updateIcon>;
