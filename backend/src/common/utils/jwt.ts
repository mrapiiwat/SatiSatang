import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET: string = process.env.JWT_SECRET || 'default_secret';
const ACCESS_EXPIRES: string = process.env.ACCESS_TOKEN_EXPIRES || '15m';

export interface JwtPayload {
  userId: number;
}

export function generateAccessToken(userId: number) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: ACCESS_EXPIRES } as SignOptions);
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
