import { Router } from 'express';
import * as authController from './authController';
import passport from 'passport';
import { authenticateJWT } from '../../common/middleware/authenticateJWT';
import { forgotLimiter } from '../../common/utils/limiter';

const router = Router();

//local auth
router.post('/check-email', authController.checkEmail);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-otp', authController.resendOtp);
router.post('/forgot-password', forgotLimiter, authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

//logout
router.post('/logout', authenticateJWT, authController.logout);

//google oauth
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    accessType: 'offline',
    prompt: 'consent',
  }),
);
router.get('/google/callback', authController.googleAuthCallback);

//facebook oauth
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback', authController.facebookAuthCallback);

//Refresh Token
router.get('/refreshToken', authController.refreshToken);

export default router;
