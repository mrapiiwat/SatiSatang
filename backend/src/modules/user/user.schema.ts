import { type Static, t } from "elysia";

export const password = t.Object({
  oldPassword: t.String({
    minLength: 1,
    error: "Old password is required",
  }),
  password: t.Intersect(
    [
      t.String({
        minLength: 6,
        error: "Password must be at least 6 characters long",
      }),
      t.String({
        pattern: "(?=.*[A-Z])",
        error: "Password must contain at least one uppercase letter",
      }),
      t.String({
        pattern: "(?=.*[a-z])",
        error: "Password must contain at least one lowercase letter",
      }),
      t.String({
        pattern: "(?=.*[0-9])",
        error: "Password must contain at least one number",
      }),
    ],
    { error: "Invalid password format" }
  ),
  confirmPassword: t.String({
    minLength: 1,
    error: "Old password is required",
  }),
});

export type password = Static<typeof password>;

export const name = t.Object({
  name: t.String({
    minLength: 2,
    maxLength: 30,
    error: "Name must be between 2 and 30 characters long",
  }),
});

export type name = Static<typeof name>;

export const deleteAccount = t.Object({
  confirm: t.String({
    minLength: 1,
    error: "Confirmation email is required",
  }),
});

export type deleteAccount = Static<typeof deleteAccount>;

export const getSummaryQuery = t.Object({
  month: t.Optional(t.Numeric()),
  year: t.Optional(t.Numeric()),
});

export type getSummaryQuery = Static<typeof getSummaryQuery>;
