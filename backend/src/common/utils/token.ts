import crypto from 'crypto';
import prisma from '../config/prismaClient';

const REFRESH_EXPIRES_DAYS = Number(process.env.REFRESH_EXPIRES_DAYS || 30);

export function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function createRefreshToken(userId: number) {
  const raw = crypto.randomBytes(48).toString('hex');
  const tokenHash = hashToken(raw);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_EXPIRES_DAYS);

  await prisma.refreshToken.create({
    data: { tokenHash, userId, expiresAt },
  });

  return raw;
}

export async function findRefreshTokenByRaw(raw: string) {
  const tokenHash = hashToken(raw);
  return prisma.refreshToken.findUnique({ where: { tokenHash } });
}

export async function revokeRefreshTokenByRaw(raw: string) {
  const tokenHash = hashToken(raw);
  return prisma.refreshToken.updateMany({ where: { tokenHash }, data: { revoked: true } });
}

export async function rotateRefreshToken(oldRaw: string, userId: number) {
  await revokeRefreshTokenByRaw(oldRaw);
  const newRaw = await createRefreshToken(userId);
  return newRaw;
}
