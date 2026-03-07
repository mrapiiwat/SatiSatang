import { type Static, t } from "elysia";

export const emailSchema = t.Object({
  email: t.String({
    format: "email",
    error: "Invalid email address",
  }),
});

export type emailSchema = Static<typeof emailSchema>;

export const verifySchema = t.Object({
  userId: t.Number({
    minimum: 1,
    error: "Invalid user ID",
  }),
  otp: t.String({
    minLength: 6,
    maxLength: 6,
    error: "OTP must be 6 characters long",
  }),
});

export type verifySchema = Static<typeof verifySchema>;

export const registerSchema = t.Object({
  email: t.String({ format: "email", error: "Invalid email address" }),
  name: t.String({
    minLength: 2,
    maxLength: 30,
    error: "ชื่อผู้ใช้ต้องมีความยาวระหว่าง 2 ถึง 30 ตัวอักษร",
  }),
  password: t.Intersect(
    [
      t.String({
        minLength: 6,
        error: "กรุณาตั้งรหัสผ่านอย่างน้อย 6 ตัวอักษร",
      }),
      t.String({
        pattern: "(?=.*[A-Z])",
        error: "รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่ อย่างน้อย 1 ตัว",
      }),
      t.String({
        pattern: "(?=.*[a-z])",
        error: "รหัสผ่านต้องมีตัวอักษรพิมพ์เล็ก อย่างน้อย 1 ตัว",
      }),
      t.String({
        pattern: "(?=.*[0-9])",
        error: "รหัสผ่านต้องมีตัวเลข อย่างน้อย 1 ตัว",
      }),
    ],
    { error: "Invalid password format" }
  ),
  acceptTermsAndPrivacy: t.Boolean(),
});

export type registerSchema = Static<typeof registerSchema>;

export const resetPasswordSchema = t.Object({
  token: t.String({
    minLength: 1,
    error: "Token is required",
  }),
  uid: t.Number(),
  newPassword: t.Intersect(
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
});

export type resetPasswordSchema = Static<typeof resetPasswordSchema>;

export const oauthSchema = t.Object({
  email: t.String({ format: "email" }),
  name: t.String(),
  provider: t.Union([t.Literal("google"), t.Literal("facebook")]),
  providerUserId: t.String(),
  accessToken: t.String(),
  refreshToken: t.Optional(t.Nullable(t.String())),
  expiresAt: t.Optional(t.Date()),
});

export type oauthSchema = Static<typeof oauthSchema>;

export const loginSchema = t.Object({
  email: t.String({ format: "email", error: "Invalid email address" }),
  password: t.String(),
});

export type loginSchema = Static<typeof loginSchema>;

export const cookie = t.Object({
  refreshToken: t.String(),
});

export const validateResetSchema = t.Object({
  token: t.String({
    minLength: 1,
    error: "Token is required",
  }),
  uid: t.String({
    minLength: 1,
    error: "User ID is required",
  }),
});

export type validateResetSchema = Static<typeof validateResetSchema>;

export interface GoogleUser {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
}

export interface FacebookUser {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

export interface FacebookTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
