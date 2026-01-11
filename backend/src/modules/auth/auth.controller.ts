import {
  generateCodeVerifier,
  generateState,
  OAuth2RequestError,
} from "arctic";
import { Elysia } from "elysia";
import { StatusCodes } from "http-status-codes";
import { authenticateJWT } from "@/common/middlewares/auth.middleware";
import { facebookAuth, googleAuth } from "@/common/utils/oauth";
import { createRefreshToken } from "@/common/utils/token";
import { setup } from "@/setup";
import * as authSchema from "./auth.schema";
import { AuthService } from "./auth.service";

const authService = new AuthService();

export const authController = new Elysia()
  .use(setup)
  .post(
    "/check-email",
    async ({ body, set }) => {
      const result = await authService.checkEmailStatus(body);
      set.status = StatusCodes.OK;
      return result;
    },
    {
      body: authSchema.emailSchema,
    }
  )

  .post(
    "/register",
    async ({ body, set }) => {
      const result = await authService.register(body);
      set.status = StatusCodes.CREATED;
      return {
        userId: result,
        message: "Please check your email to verify your account.",
      };
    },
    {
      body: authSchema.registerSchema,
    }
  )

  .post(
    "/login",
    async ({ body, set, jwt, cookie: { refreshToken } }) => {
      const result = await authService.login(body);
      const accessToken = await jwt.sign({ id: result.userId });
      const refreshRaw = await createRefreshToken(result.userId);
      refreshToken.set({
        value: refreshRaw,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: Number(process.env.REFRESH_EXPIRES_DAYS || 30) * 86400,
        path: "/",
      });
      set.status = StatusCodes.OK;
      return {
        message: "Login successful",
        accessToken: accessToken,
      };
    },
    {
      body: authSchema.loginSchema,
    }
  )

  .post(
    "/verify-email",
    async ({ body, set, jwt, cookie: { refreshToken } }) => {
      const result = await authService.verifyEmail(body);
      const accessToken = await jwt.sign({ id: result.userId });
      const refreshRaw = await createRefreshToken(result.userId);

      refreshToken.set({
        value: refreshRaw,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: Number(process.env.REFRESH_EXPIRES_DAYS || 30) * 86400,
        path: "/",
      });

      set.status = StatusCodes.OK;
      return {
        message: "Email verified successfully",
        accessToken: accessToken,
      };
    },
    {
      body: authSchema.verifySchema,
    }
  )

  .get("/refreshToken", async ({ cookie: { refreshToken }, set, jwt }) => {
    const raw = refreshToken.value;
    if (!raw) {
      set.status = StatusCodes.UNAUTHORIZED;
      return { error: "No refresh token" };
    }

    const { userId, newRefreshToken } = await authService.refreshToken(
      raw as string
    );

    const accessToken = await jwt.sign({ id: userId });

    refreshToken.set({
      value: newRefreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: Number(process.env.REFRESH_EXPIRES_DAYS || 30) * 86400,
      path: "/",
    });

    return { accessToken };
  })

  .post(
    "/resend-otp",
    async ({ body, set }) => {
      const result = await authService.resendOtp(body);

      set.status = StatusCodes.OK;
      return {
        message: "OTP sent successfully",
        userId: result,
      };
    },
    {
      body: authSchema.emailSchema,
    }
  )

  .post(
    "/forgot-password",
    async ({ body, set }) => {
      const result = await authService.forgotPassword(body);

      set.status = StatusCodes.OK;
      return result;
    },
    {
      body: authSchema.emailSchema,
    }
  )

  .post(
    "/reset-password",
    async ({ body, set }) => {
      const result = await authService.resetPassword(body);

      set.status = StatusCodes.OK;
      return result;
    },
    {
      body: authSchema.resetPasswordSchema,
    }
  )

  .post(
    "/validate-recovery",
    async ({ body, set }) => {
      const result = await authService.validateRecovery(body);
      
      set.status = StatusCodes.OK;
      return result;
    },
    {
      body: authSchema.emailSchema,
    }
  )

  .get(
    "/reset-password/verify",
    async ({ query, set }) => {
      const result = await authService.validateResetToken(query);
      set.status = StatusCodes.OK;
      return result;
    },
    {
      query: authSchema.validateResetSchema,
    }
  )

  .get("/google", async ({ cookie, redirect }) => {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    const url = googleAuth.createAuthorizationURL(state, codeVerifier, [
      "profile",
      "email",
    ]);

    cookie.oauth_state.set({
      value: state,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 600,
    });
    cookie.oauth_code_verifier.set({
      value: codeVerifier,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 600,
    });

    return redirect(url.toString());
  })

  .get("/google/callback", async ({ query, cookie, jwt, set, redirect }) => {
    const code = query.code;
    const state = query.state;
    const storedState = cookie.oauth_state.value as string;
    const storedCodeVerifier = cookie.oauth_code_verifier.value as string;

    if (
      !code ||
      !state ||
      !storedState ||
      state !== storedState ||
      !storedCodeVerifier
    ) {
      set.status = StatusCodes.BAD_REQUEST;
      return { message: "Invalid state or code" };
    }

    try {
      const tokens = await googleAuth.validateAuthorizationCode(
        code,
        storedCodeVerifier
      );

      const accessToken = tokens.accessToken();
      const refreshToken = tokens.hasRefreshToken()
        ? tokens.refreshToken()
        : null;
      const accessTokenExpiresAt = tokens.accessTokenExpiresAt();

      const response = await fetch(
        "https://openidconnect.googleapis.com/v1/userinfo",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const googleUser = (await response.json()) as authSchema.GoogleUser;

      const { userId } = await authService.handleOAuthLogin({
        email: googleUser.email,
        name: googleUser.name,
        provider: "google",
        providerUserId: googleUser.sub,
        accessToken: accessToken,
        refreshToken: refreshToken,
        expiresAt: accessTokenExpiresAt,
      });

      const newAccessToken = await jwt.sign({ id: userId });
      const refreshRaw = await createRefreshToken(userId);

      cookie.refreshToken.set({
        value: refreshRaw,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: Number(process.env.REFRESH_EXPIRES_DAYS || 30) * 86400,
        path: "/",
      });

      return redirect(
        `${process.env.FRONTEND_BASE_URL}/auth/callback?token=${newAccessToken}`
      );
    } catch (e) {
      if (e instanceof OAuth2RequestError) {
        set.status = StatusCodes.BAD_REQUEST;
        return { message: "Invalid authorization code" };
      }
      console.error(e);
      set.status = StatusCodes.INTERNAL_SERVER_ERROR;
      return { message: "Internal server error" };
    }
  })

  .get("/facebook", async ({ cookie, redirect }) => {
    const state = generateState();
    const url = facebookAuth.createAuthorizationURL(state, [
      "email",
      "public_profile",
    ]);

    cookie.oauth_state.set({
      value: state,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 600,
    });

    return redirect(url.toString());
  })

  .get("/facebook/callback", async ({ query, cookie, jwt, set, redirect }) => {
    const code = query.code;
    const state = query.state;
    const storedState = cookie.oauth_state.value as string;

    if (!code || !state || !storedState || state !== storedState) {
      set.status = StatusCodes.BAD_REQUEST;
      return { message: "Invalid state" };
    }

    try {
      const tokens = await facebookAuth.validateAuthorizationCode(code);

      const accessToken = tokens.accessToken();

      const response = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`
      );
      const fbUser = (await response.json()) as authSchema.FacebookUser;

      if (!fbUser.email) {
        set.status = StatusCodes.BAD_REQUEST;
        return { message: "Email permission required" };
      }

      let finalAccessToken: string = accessToken;

      try {
        const longLivedResponse = await fetch(
          `https://graph.facebook.com/v17.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.FACEBOOK_CLIENT_ID}&client_secret=${process.env.FACEBOOK_CLIENT_SECRET}&fb_exchange_token=${accessToken}`
        );
        const longLivedData =
          (await longLivedResponse.json()) as authSchema.FacebookTokenResponse;
        if (longLivedData.access_token) {
          finalAccessToken = longLivedData.access_token;
        }
      } catch (_err) {
        console.error("Failed to exchange facebook token");
      }

      const { userId } = await authService.handleOAuthLogin({
        email: fbUser.email,
        name: fbUser.name,
        provider: "facebook",
        providerUserId: fbUser.id,
        accessToken: finalAccessToken,
        refreshToken: null,
      });

      const newAccessToken = await jwt.sign({ id: userId });
      const refreshRaw = await createRefreshToken(userId);

      cookie.refreshToken.set({
        value: refreshRaw,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: Number(process.env.REFRESH_EXPIRES_DAYS || 30) * 86400,
        path: "/",
      });

      return redirect(
        `${process.env.FRONTEND_BASE_URL}/auth/callback?token=${newAccessToken}`
      );
    } catch (e) {
      console.error(e);
      set.status = StatusCodes.INTERNAL_SERVER_ERROR;
      return { message: "Internal server error" };
    }
  })

  .use(authenticateJWT)
  .post(
    "/logout",
    async ({ cookie: { refreshToken }, set }) => {
      const rawRefreshToken = refreshToken?.value;

      if (rawRefreshToken) {
        await authService.logout(rawRefreshToken);
      }

      refreshToken.remove();

      set.status = StatusCodes.OK;
      return { message: "Logged out" };
    },
    {
      cookie: authSchema.cookie,
    }
  );
