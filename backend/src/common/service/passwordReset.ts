// src/services/passwordResetService.ts
import prisma from '../config/prismaClient';
import { generateResetToken, hashToken } from '../utils/token';

const RESET_EXPIRES_MINUTES = Number(process.env.RESET_TOKEN_EXPIRES_MINUTES || 15);

export async function createPasswordResetToken(userId: number) {
  const raw = generateResetToken(48);
  const tokenHash = hashToken(raw);
  const expiresAt = new Date(Date.now() + RESET_EXPIRES_MINUTES * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { userId, tokenHash, expiresAt },
  });

  return raw;
}

export async function findValidResetTokenByRaw(raw: string) {
  const tokenHash = hashToken(raw);
  return prisma.passwordResetToken.findFirst({
    where: { tokenHash, used: false, expiresAt: { gt: new Date() } },
  });
}

export async function markResetTokenUsed(tokenId: number) {
  return prisma.passwordResetToken.update({
    where: { id: tokenId },
    data: { used: true },
  });
}

export async function deleteResetTokenByRaw(raw: string) {
  const tokenHash = hashToken(raw);
  return prisma.passwordResetToken.deleteMany({ where: { tokenHash } });
}
