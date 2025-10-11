import request from 'supertest';
import app from '../src/app';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import prisma from '../src/common/config/prismaClient';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('User Module', () => {
  beforeEach(async () => {
    await prisma.emailVerification.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.oAuthAccount.deleteMany();
    await prisma.user.deleteMany();
  });

  afterEach(async () => {
    await prisma.emailVerification.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.oAuthAccount.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('GET /api/me', () => {
    let userId: number;
    let accessToken: string;

    beforeEach(async () => {
      // Create a verified user
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: await bcrypt.hash('Password123', 10),
          name: 'Test User',
          isEmailVerified: true,
          balance: 1000.5,
        },
      });
      userId = user.id;

      // Generate access token
      accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'test-secret', {
        expiresIn: '1h',
      });
    });

    it('should return user information for authenticated user', async () => {
      const res = await request(app).get('/api/me').set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        balance: 1000.5,
        oauthAccounts: [],
      });
    });

    it('should return user information with OAuth accounts', async () => {
      // Add OAuth accounts
      await prisma.oAuthAccount.createMany({
        data: [
          {
            userId,
            provider: 'google',
            providerUserId: 'google123',
          },
          {
            userId,
            provider: 'facebook',
            providerUserId: 'facebook123',
          },
        ],
      });

      const res = await request(app).get('/api/me').set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(userId);
      expect(res.body.email).toBe('test@example.com');
      expect(res.body.name).toBe('Test User');
      expect(res.body.balance).toBe(1000.5);
      expect(res.body.oauthAccounts).toHaveLength(2);
      expect(res.body.oauthAccounts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            provider: 'google',
            providerUserId: 'google123',
          }),
          expect.objectContaining({
            provider: 'facebook',
            providerUserId: 'facebook123',
          }),
        ]),
      );
    });

    it('should return 400 error when userId is missing from token', async () => {
      // Create a token without userId
      const invalidToken = jwt.sign(
        { someOtherField: 'value' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' },
      );

      const res = await request(app).get('/api/me').set('Authorization', `Bearer ${invalidToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(
        "Oops! We couldn't find your user info. Please log in again to continue.",
      );
    });

    it('should return 404 error when user is not found', async () => {
      // Create a token with non-existent userId
      const nonExistentUserId = 99999;
      const tokenWithNonExistentUser = jwt.sign(
        { userId: nonExistentUserId },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' },
      );

      const res = await request(app)
        .get('/api/me')
        .set('Authorization', `Bearer ${tokenWithNonExistentUser}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Not found');
    });

    it('should return 401 error when no authorization header is provided', async () => {
      const res = await request(app).get('/api/me');

      expect(res.status).toBe(401);
    });

    it('should return 401 error when invalid token is provided', async () => {
      const res = await request(app).get('/api/me').set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });

    it('should return 401 error when malformed authorization header is provided', async () => {
      const res = await request(app).get('/api/me').set('Authorization', 'InvalidFormat token');

      expect(res.status).toBe(401);
    });

    it('should return user with zero balance', async () => {
      // Create user with zero balance
      const user = await prisma.user.create({
        data: {
          email: 'zerobalance@example.com',
          password: await bcrypt.hash('Password123', 10),
          name: 'Zero Balance User',
          isEmailVerified: true,
          balance: 0,
        },
      });

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'test-secret', {
        expiresIn: '1h',
      });

      const res = await request(app).get('/api/me').set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.balance).toBe(0);
    });
  });
});
