import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import prisma from './prismaClient';


passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.password) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return done(null, false, { message: 'email or password is incorrect' });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        let user = email ? await prisma.user.findUnique({ where: { email } }) : null;
        const expiresAt = new Date(Date.now() + 3600 * 1000);
        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName,
              isEmailVerified: true,
              oauthAccounts: {
                create: {
                  provider: 'google',
                  providerUserId: profile.id,
                  accessToken,
                  refreshToken,
                  expiresAt: expiresAt,
                },
              },
            },
            include: { oauthAccounts: true },
          });
        } else {
          // upsert oauth account
          await prisma.oAuthAccount.upsert({
            where: { provider_providerUserId: { provider: 'google', providerUserId: profile.id } },
            update: { accessToken, refreshToken },
            create: {
              provider: 'google',
              providerUserId: profile.id,
              accessToken,
              refreshToken,
              userId: user.id,
            },
          });
        }
        done(null, user);
      } catch (err) {
        done(err as Error);
      }
    },
  ),
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL!,
      profileFields: ['id', 'displayName', 'emails'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        let user = email ? await prisma.user.findUnique({ where: { email } }) : null;
        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName,
              isEmailVerified: true,
              oauthAccounts: {
                create: {
                  provider: 'facebook',
                  providerUserId: profile.id,
                  accessToken,
                  refreshToken,
                },
              },
            },
          });
        } else {
          const longLivedToken = await fetch(
            `https://graph.facebook.com/v17.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.FB_APP_ID}&client_secret=${process.env.FB_APP_SECRET}&fb_exchange_token=${accessToken}`,
          )
            .then((res) => res.json())
            .then((data) => data.access_token);
          await prisma.oAuthAccount.upsert({
            where: {
              provider_providerUserId: { provider: 'facebook', providerUserId: profile.id },
            },
            update: {
              accessToken: longLivedToken,
              refreshToken: refreshToken ? refreshToken : null,
            },
            create: {
              provider: 'facebook',
              providerUserId: profile.id,
              accessToken: longLivedToken,
              refreshToken: refreshToken ? refreshToken : null,
              userId: user.id,
            },
          });
        }
        done(null, user);
      } catch (err) {
        done(err as Error, null);
      }
    },
  ),
);
