import type { Elysia } from "elysia";
import { UnauthorizedError } from "@/common/exceptions";
import { setup } from "@/setup";

export const authenticateJWT = (app: Elysia) =>
  app.use(setup).derive(async ({ jwt, headers, cookie: { token } }) => {
    const authHeader = headers.authorization;

    const tokenValue = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : token?.value;

    if (!tokenValue) {
      throw new UnauthorizedError("No token");
    }
    const decoded = await jwt.verify(tokenValue as string);

    if (!decoded) {
      throw new UnauthorizedError("Invalid or expired access token");
    }

    return {
      user: decoded,
    };
  });
