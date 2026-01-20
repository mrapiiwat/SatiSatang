import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { passwordResetToken, refreshToken } from "@/db/schema";

const REFRESH_EXPIRES_DAYS = Number(Bun.env.REFRESH_EXPIRES_DAYS) || 30;
const RESET_EXPIRES_MINUTES = Number(Bun.env.RESET_TOKEN_EXPIRES_MINUTES || 5);
const APP_SECRET = Bun.env.APP_SECRET || "fallback-secret";

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export const createRefreshToken = async (userId: number) => {
  const raw = randomBytes(48).toString("hex");
  const tokenHash = hashToken(raw);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_EXPIRES_DAYS);

  await db.insert(refreshToken).values({
    tokenHash,
    userId,
    expiresAt,
  });

  return raw;
};

export const findRefreshTokenByRaw = async (raw: string) => {
  const tokenHash = hashToken(raw);
  const [token] = await db
    .select()
    .from(refreshToken)
    .where(eq(refreshToken.tokenHash, tokenHash))
    .limit(1);

  return token;
};

export const revokeRefreshTokenByRaw = async (raw: string) => {
  const tokenHash = hashToken(raw);

  return db
    .update(refreshToken)
    .set({ revoked: true })
    .where(eq(refreshToken.tokenHash, tokenHash));
};

export const rotateRefreshToken = async (oldRaw: string, userId: number) => {
  await revokeRefreshTokenByRaw(oldRaw);
  return createRefreshToken(userId);
};

export function generateResetToken(bytes = 32) {
  return randomBytes(bytes).toString("hex");
}

export function hashResetToken(token: string) {
  return createHash("sha256").update(APP_SECRET).update(token).digest("hex");
}

export async function createPasswordResetToken(userId: number) {
  const raw = generateResetToken(48);
  const tokenHash = hashToken(raw);
  const expiresAt = new Date(Date.now() + RESET_EXPIRES_MINUTES * 60 * 1000);

  await db.insert(passwordResetToken).values({
    userId,
    tokenHash,
    expiresAt,
  });

  return raw;
}

export async function findValidResetTokenByRaw(raw: string) {
  const tokenHash = hashToken(raw);

  return await db.query.passwordResetToken.findFirst({
    where: and(
      eq(passwordResetToken.tokenHash, tokenHash),
      eq(passwordResetToken.used, false),
      gt(passwordResetToken.expiresAt, new Date())
    ),
  });
}

export async function markResetTokenUsed(tokenId: number) {
  return await db
    .update(passwordResetToken)
    .set({ used: true })
    .where(eq(passwordResetToken.id, tokenId));
}

export async function deleteResetTokenByRaw(raw: string) {
  const tokenHash = hashToken(raw);

  return await db
    .delete(passwordResetToken)
    .where(eq(passwordResetToken.tokenHash, tokenHash));
}
