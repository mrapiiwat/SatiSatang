import request from 'supertest';
import app from '../src/app';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import prisma from '../src/common/config/prismaClient';
import bcrypt from 'bcrypt';
import { hashToken } from '../src/common/utils/token';

describe('Authentication', () => {
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

  describe('POST /api/check-email', () => {
    it('should return SIGN UP for non-existent email', async () => {
      const res = await request(app)
        .post('/api/check-email')
        .send({ email: 'newuser@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('SIGN UP');
    });

    it('should return SIGN IN for verified user with password', async () => {
      // Create a verified user with password
      await prisma.user.create({
        data: {
          email: 'verified@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Test User',
          isEmailVerified: true,
        },
      });

      const res = await request(app)
        .post('/api/check-email')
        .send({ email: 'verified@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('SIGN IN');
    });

    it('should return PENDING VERIFICATION for unverified user', async () => {
      // Create an unverified user
      await prisma.user.create({
        data: {
          email: 'unverified@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Test User',
          isEmailVerified: false,
        },
      });

      const res = await request(app)
        .post('/api/check-email')
        .send({ email: 'unverified@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('PENDING VERIFICATION');
    });

    it('should return OAUTH SIGN IN (GOOGLE) for user with Google OAuth', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'oauth@example.com',
          name: 'OAuth User',
          isEmailVerified: true,
        },
      });

      await prisma.oAuthAccount.create({
        data: {
          userId: user.id,
          provider: 'google',
          providerUserId: 'google123',
        },
      });

      const res = await request(app).post('/api/check-email').send({ email: 'oauth@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('OAUTH SIGN IN (GOOGLE)');
    });

    it('should return OAUTH SIGN IN (FACEBOOK) for user with Facebook OAuth', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'facebook@example.com',
          name: 'Facebook User',
          isEmailVerified: true,
        },
      });

      await prisma.oAuthAccount.create({
        data: {
          userId: user.id,
          provider: 'facebook',
          providerUserId: 'facebook123',
        },
      });

      const res = await request(app)
        .post('/api/check-email')
        .send({ email: 'facebook@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('OAUTH SIGN IN (FACEBOOK)');
    });

    it('should return validation error for invalid email', async () => {
      const res = await request(app).post('/api/check-email').send({ email: 'invalid-email' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation error');
    });
  });

  describe('POST /api/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'Password123',
        name: 'New User',
      };

      const res = await request(app).post('/api/register').send(userData);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Please check your email to verify your account.');
      expect(res.body.userId).toBeDefined();

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      expect(user).toBeTruthy();
      expect(user?.isEmailVerified).toBe(false);
    });

    it('should return validation error for invalid password', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'weak',
        name: 'New User',
      };

      const res = await request(app).post('/api/register').send(userData);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation error');
    });

    it('should return validation error for invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'Password123',
        name: 'New User',
      };

      const res = await request(app).post('/api/register').send(userData);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation error');
    });

    it('should return validation error for short name', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'Password123',
        name: 'A',
      };

      const res = await request(app).post('/api/register').send(userData);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation error');
    });
  });

  describe('POST /api/login', () => {
    beforeEach(async () => {
      // Create a verified user for login tests
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: await bcrypt.hash('Password123', 10),
          name: 'Test User',
          isEmailVerified: true,
        },
      });
    });

    it('should login successfully with valid credentials', async () => {
      const res = await request(app).post('/api/login').send({
        email: 'test@example.com',
        password: 'Password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Login successful');
      expect(res.body.accessToken).toBeDefined();
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should return error for invalid email', async () => {
      const res = await request(app).post('/api/login').send({
        email: 'nonexistent@example.com',
        password: 'Password123',
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });

    it('should return error for invalid password', async () => {
      const res = await request(app).post('/api/login').send({
        email: 'test@example.com',
        password: 'WrongPassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('email or password is incorrect');
    });

    it('should return validation error for invalid email format', async () => {
      const res = await request(app).post('/api/login').send({
        email: 'invalid-email',
        password: 'Password123',
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation error');
    });
  });

  describe('POST /api/verify-email', () => {
    let userId: number;
    let validOtp: string;

    beforeEach(async () => {
      // Create an unverified user
      const user = await prisma.user.create({
        data: {
          email: 'unverified@example.com',
          password: await bcrypt.hash('Password123', 10),
          name: 'Unverified User',
          isEmailVerified: false,
        },
      });
      userId = user.id;

      // Create email verification record
      validOtp = '123456';
      const otpHash = await bcrypt.hash(validOtp, 10);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await prisma.emailVerification.create({
        data: {
          userId: user.id,
          otpHash,
          expiresAt,
        },
      });
    });

    it('should verify email successfully with valid OTP', async () => {
      const res = await request(app).post('/api/verify-email').send({
        userId,
        otp: validOtp,
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Email verified successfully');
      expect(res.body.accessToken).toBeDefined();

      // Verify user is now verified
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      expect(user?.isEmailVerified).toBe(true);
    });

    it('should return error for invalid OTP', async () => {
      const res = await request(app).post('/api/verify-email').send({
        userId,
        otp: '000000',
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid OTP');
    });

    it('should return error for expired OTP', async () => {
      // Create expired OTP
      const expiredOtp = '654321';
      const otpHash = await bcrypt.hash(expiredOtp, 10);
      const expiredAt = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago

      await prisma.emailVerification.deleteMany({ where: { userId } });
      await prisma.emailVerification.create({
        data: {
          userId,
          otpHash,
          expiresAt: expiredAt,
        },
      });

      const res = await request(app).post('/api/verify-email').send({
        userId,
        otp: expiredOtp,
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('OTP expired');
    });
  });

  describe('POST /api/resend-otp', () => {
    beforeEach(async () => {
      // Create an unverified user
      await prisma.user.create({
        data: {
          email: 'unverified@example.com',
          password: await bcrypt.hash('Password123', 10),
          name: 'Unverified User',
          isEmailVerified: false,
        },
      });
    });

    it('should resend OTP successfully', async () => {
      const res = await request(app).post('/api/resend-otp').send({
        email: 'unverified@example.com',
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('OTP sent successfully');
      expect(res.body.userId).toBeDefined();
    });

    it('should return error for already verified user', async () => {
      // Create a verified user
      await prisma.user.create({
        data: {
          email: 'verified@example.com',
          password: await bcrypt.hash('Password123', 10),
          name: 'Verified User',
          isEmailVerified: true,
        },
      });

      const res = await request(app).post('/api/resend-otp').send({
        email: 'verified@example.com',
      });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User not found or already verified');
    });

    it('should return error for non-existent user', async () => {
      const res = await request(app).post('/api/resend-otp').send({
        email: 'nonexistent@example.com',
      });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User not found or already verified');
    });

    it('should return validation error for invalid email format', async () => {
      const res = await request(app).post('/api/resend-otp').send({
        email: 'invalid-email',
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation error');
    });
  });

  describe('GET /api/refreshToken', () => {
    let userId: number;
    let refreshToken: string;

    beforeEach(async () => {
      // ล้างข้อมูลเก่า
      await prisma.refreshToken.deleteMany();
      await prisma.user.deleteMany();

      // สร้าง user ใหม่
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: await bcrypt.hash('Password123', 10),
          name: 'Test User',
          isEmailVerified: true,
        },
      });
      userId = user.id;

      // สร้าง refresh token ด้วย sha256 hash
      const rawToken = 'test-refresh-token';
      const tokenHash = hashToken(rawToken);

      await prisma.refreshToken.create({
        data: {
          userId,
          tokenHash,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 วัน
        },
      });

      refreshToken = rawToken;
    });

    afterEach(async () => {
      await prisma.refreshToken.deleteMany();
      await prisma.user.deleteMany();
    });

    it('should refresh token successfully', async () => {
      const res = await request(app)
        .get('/api/refreshToken')
        .set('Cookie', `refreshToken=${refreshToken}`);

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(res.headers['set-cookie']).toBeDefined();
      // อัพเดต refreshToken ใหม่จาก cookie
      const newCookie = res.headers['set-cookie'][0];
      const newRaw = newCookie.split('=')[1].split(';')[0];
      expect(newRaw).not.toBe(refreshToken);
    });

    it('should return error for missing refresh token', async () => {
      const res = await request(app).get('/api/refreshToken');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('No refresh token');
    });

    it('should return error for invalid refresh token', async () => {
      const res = await request(app)
        .get('/api/refreshToken')
        .set('Cookie', 'refreshToken=invalid-token');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid refresh token');
    });
  });

  describe('POST /api/logout', () => {
    let userId: number;
    let refreshToken: string;

    beforeEach(async () => {
      // Create a user
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: await bcrypt.hash('Password123', 10),
          name: 'Test User',
          isEmailVerified: true,
        },
      });
      userId = user.id;

      // Create a refresh token
      await prisma.refreshToken.create({
        data: {
          userId,
          tokenHash: await bcrypt.hash('test-refresh-token', 10),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });
      refreshToken = 'test-refresh-token';
    });

    it('should logout successfully', async () => {
      // First, we need to get an access token for authentication
      const loginRes = await request(app).post('/api/login').send({
        email: 'test@example.com',
        password: 'Password123',
      });

      const accessToken = loginRes.body.accessToken;

      const res = await request(app)
        .post('/api/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', `refreshToken=${refreshToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Logged out');
    });

    it('should return error for unauthenticated request', async () => {
      const res = await request(app).post('/api/logout');

      expect(res.status).toBe(401);
    });
  });

  describe('OAuth Routes', () => {
    describe('GET /api/google', () => {
      it('should redirect to Google OAuth', async () => {
        const res = await request(app).get('/api/google');

        expect(res.status).toBe(302);
        expect(res.headers.location).toContain('accounts.google.com');
      });
    });

    describe('GET /api/facebook', () => {
      it('should redirect to Facebook OAuth', async () => {
        const res = await request(app).get('/api/facebook');

        expect(res.status).toBe(302);
        expect(res.headers.location).toContain('facebook.com');
      });
    });
  });
});
