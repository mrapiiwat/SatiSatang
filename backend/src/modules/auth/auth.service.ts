import { and, count, eq, gt, isNull } from "drizzle-orm";
import {
  BadRequestError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
} from "@/common/exceptions";
import {
  generateOTP,
  sendResetEmail,
  sendVerificationEmail,
} from "@/common/utils/mail";
import {
  createPasswordResetToken,
  findRefreshTokenByRaw,
  findValidResetTokenByRaw,
  markResetTokenUsed,
  revokeRefreshTokenByRaw,
  rotateRefreshToken,
} from "@/common/utils/token";
import { db } from "@/db";
import {
  category,
  emailVerification,
  oauthAccount,
  passwordResetToken,
  refreshToken,
  user,
} from "@/db/schema";
import type * as authSchema from "./auth.schema";

export class AuthService {
  async checkEmailStatus(data: authSchema.emailSchema) {
    const userRecord = await db.query.user.findFirst({
      where: eq(user.email, data.email),
      with: {
        oauthAccounts: true,
      },
    });

    if (!userRecord) {
      return { message: "SIGN UP" };
    }

    if (userRecord.password && userRecord.isEmailVerified) {
      return { message: "SIGN IN" };
    }

    if (userRecord.oauthAccounts && userRecord.oauthAccounts.length > 0) {
      const providers = userRecord.oauthAccounts.map((acc) => acc.provider);
      if (providers.includes("google"))
        return { message: "OAUTH SIGN IN (GOOGLE)" };
      if (providers.includes("facebook"))
        return { message: "OAUTH SIGN IN (FACEBOOK)" };
    }

    return { message: "PENDING VERIFICATION" };
  }

  async register(data: authSchema.registerSchema) {
    const hashPassword = await Bun.password.hash(data.password);
    return await db.transaction(async (tx) => {
      const [newUser] = await tx
        .insert(user)
        .values({
          email: data.email.toLocaleLowerCase().trim(),
          password: hashPassword,
          name: data.name,
        })
        .returning({ id: user.id, email: user.email });

      const presetCategories = await tx
        .select()
        .from(category)
        .where(isNull(category.userId));

      if (presetCategories.length > 0) {
        const userCategories = presetCategories.map((c) => ({
          name: c.name,
          type: c.type,
          userId: newUser.id,
          iconId: c.iconId,
        }));
        await tx.insert(category).values(userCategories);
      }

      await tx
        .delete(emailVerification)
        .where(eq(emailVerification.userId, newUser.id));

      const otp = generateOTP();
      const otpHash = await Bun.password.hash(otp);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await tx.insert(emailVerification).values({
        userId: newUser.id,
        otpHash: otpHash,
        expiresAt: expiresAt,
      });

      await sendVerificationEmail(newUser.email!, otp);

      return newUser.id;
    });
  }

  async login(data: authSchema.loginSchema) {
    const [users] = await db
      .select()
      .from(user)
      .where(eq(user.email, data.email.toLocaleLowerCase().trim()))
      .limit(1);

    if (!users || !users.password) {
      throw new UnauthorizedError("Invalid credentials");
    }

    if (!users.isEmailVerified)
      throw new UnauthorizedError("Please verify your email first.");

    const isPasswordValid = await Bun.password.verify(
      data.password,
      users.password
    );
    if (!isPasswordValid) {
      throw new UnauthorizedError("email or password is incorrect");
    }

    return { userId: users.id };
  }

  async verifyEmail(data: authSchema.verifySchema) {
    return await db.transaction(async (tx) => {
      const record = await tx.query.emailVerification.findFirst({
        where: eq(emailVerification.userId, data.userId),
      });

      if (!record)
        throw new UnauthorizedError(
          "The provided OTP is invalid or has expired."
        );

      if (record.expiresAt < new Date()) {
        throw new BadRequestError("OTP has expired");
      }

      const isValid = await Bun.password.verify(data.otp, record.otpHash);
      if (!isValid)
        throw new BadRequestError(
          "The provided OTP is invalid or has expired."
        );

      await tx
        .update(user)
        .set({ isEmailVerified: true })
        .where(eq(user.id, data.userId));

      await tx
        .delete(emailVerification)
        .where(eq(emailVerification.id, record.id));

      const userRecord = await tx.query.user.findFirst({
        where: eq(user.id, data.userId),
      });

      if (!userRecord) throw new NotFoundError("User not found");

      return { userId: userRecord.id };
    });
  }

  async refreshToken(rawToken: string) {
    const tokenInDb = await findRefreshTokenByRaw(rawToken);

    if (!tokenInDb || tokenInDb.revoked || tokenInDb.expiresAt < new Date()) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    const newRaw = await rotateRefreshToken(
      rawToken,
      tokenInDb.userId,
      tokenInDb.provider as "local" | "google" | "facebook"
    );

    return {
      userId: tokenInDb.userId,
      newRefreshToken: newRaw,
      provider: tokenInDb.provider,
    };
  }

  async resendOtp(data: authSchema.emailSchema) {
    const emailLower = data.email.toLowerCase().trim();

    const userRecord = await db.query.user.findFirst({
      where: and(eq(user.email, emailLower), eq(user.isEmailVerified, false)),
    });

    if (!userRecord) {
      throw new NotFoundError("User not found or already verified");
    }

    return await db.transaction(async (tx) => {
      const existingRecord = await tx.query.emailVerification.findFirst({
        where: eq(emailVerification.userId, userRecord.id),
      });

      if (existingRecord) {
        const cooldownMs = 60 * 1000;
        const timeSinceLastOtp =
          Date.now() - existingRecord.createdAt.getTime();

        if (timeSinceLastOtp < cooldownMs) {
          const remainingSeconds = Math.ceil(
            (cooldownMs - timeSinceLastOtp) / 1000
          );
          throw new TooManyRequestsError(
            `Please wait ${remainingSeconds} seconds before requesting new OTP`
          );
        }

        await tx
          .delete(emailVerification)
          .where(eq(emailVerification.id, existingRecord.id));
      }

      const otp = generateOTP();
      const otpHash = await Bun.password.hash(otp);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await tx.insert(emailVerification).values({
        userId: userRecord.id,
        otpHash: otpHash,
        expiresAt: expiresAt,
      });

      await sendVerificationEmail(emailLower, otp);

      return userRecord.id;
    });
  }

  async forgotPassword(data: { email: string }) {
    const emailNormalized = data.email.toLowerCase().trim();

    (async () => {
      try {
        const userRecord = await db.query.user.findFirst({
          where: eq(user.email, emailNormalized),
        });

        if (!userRecord) return;

        const rawToken = await createPasswordResetToken(userRecord.id);

        const resetUrl = `${Bun.env.FRONTEND_BASE_URL}/reset-password?token=${encodeURIComponent(rawToken)}&uid=${userRecord.id}`;

        await sendResetEmail(userRecord.email!, resetUrl);
      } catch (error) {
        console.error("Background Forgot Password Error:", error);
      }
    })();

    return {
      message:
        "If that email is registered, you'll receive password reset instructions.",
    };
  }

  async resetPassword(data: authSchema.resetPasswordSchema) {
    const resetRecord = await findValidResetTokenByRaw(data.token);
    if (!resetRecord || resetRecord.userId !== Number(data.uid)) {
      throw new BadRequestError("Invalid or expired token");
    }

    const hashed = await Bun.password.hash(data.newPassword);

    await db.transaction(async (tx) => {
      await tx
        .update(user)
        .set({ password: hashed })
        .where(eq(user.id, resetRecord.userId));

      await tx
        .update(refreshToken)
        .set({ revoked: true })
        .where(
          and(
            eq(refreshToken.userId, resetRecord.userId),
            eq(refreshToken.revoked, false)
          )
        );

      await markResetTokenUsed(resetRecord.id);
    });

    return {
      message: "Password has been reset successfully",
    };
  }

  async validateRecovery(data: { email: string }) {
    const emailNormalized = data.email.toLowerCase().trim();

    const userRecord = await db.query.user.findFirst({
      where: eq(user.email, emailNormalized),
    });

    if (!userRecord) {
      return { valid: false };
    }

    const tokenRecord = await db.query.passwordResetToken.findFirst({
      where: and(
        eq(passwordResetToken.userId, userRecord.id),
        eq(passwordResetToken.used, false),
        gt(passwordResetToken.expiresAt, new Date())
      ),
    });

    if (!tokenRecord) {
      return { valid: false };
    }

    return { valid: true };
  }

  async validateResetToken(query: authSchema.validateResetSchema) {
    const record = await findValidResetTokenByRaw(query.token);

    if (!record || record.userId !== Number(query.uid)) {
      return { valid: false };
    }

    return { valid: true };
  }

  async handleOAuthLogin(data: authSchema.oauthSchema) {
    return await db.transaction(async (tx) => {
      let userRecord = await tx.query.user.findFirst({
        where: eq(user.email, data.email),
      });

      if (!userRecord) {
        const [newUser] = await tx
          .insert(user)
          .values({
            email: data.email,
            name: data.name,
            isEmailVerified: true,
          })
          .returning();
        userRecord = newUser;
      }

      await tx
        .insert(oauthAccount)
        .values({
          provider: data.provider,
          providerUserId: data.providerUserId,
          userId: userRecord.id,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken || null,
          expiresAt: data.expiresAt || null,
        })
        .onConflictDoUpdate({
          target: [oauthAccount.provider, oauthAccount.providerUserId],
          set: {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken || null,
            expiresAt: data.expiresAt || null,
          },
        });

      const [catCount] = await tx
        .select({ count: count() })
        .from(category)
        .where(eq(category.userId, userRecord.id));

      if (catCount.count === 0) {
        const presetCategories = await tx
          .select()
          .from(category)
          .where(isNull(category.userId));

        if (presetCategories.length > 0) {
          const userCategories = presetCategories.map((c) => ({
            name: c.name,
            type: c.type,
            userId: userRecord!.id,
            iconId: c.iconId,
          }));
          await tx.insert(category).values(userCategories);
        }
      }

      return { userId: userRecord.id };
    });
  }

  async logout(rawToken: string) {
    if (!rawToken) return;

    await revokeRefreshTokenByRaw(rawToken);
  }
}
