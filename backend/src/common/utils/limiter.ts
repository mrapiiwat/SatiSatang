import rateLimit from 'express-rate-limit';

export const forgotLimiter = rateLimit({
  windowMs: 60_000 * 10,
  max: 5,
  message: 'Too many password reset requests, please try again later.',
});
