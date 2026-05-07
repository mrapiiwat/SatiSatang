import type { Context } from "elysia";
import { StatusCodes } from "http-status-codes";
import { redis } from "../config/redis";

type Options = {
  max: number;
  window: number; // in seconds
  prefix?: string;
  keyGenerator?: (ctx: AuthContext) => string;
};

type AuthContext = Context & {
  user?: {
    id: string | number;
  };
};

export const limit = (options: Options) => {
  const { max, window, prefix = "rl", keyGenerator } = options;

  return async (ctx: Context) => {
    const { request, set } = ctx;
    const authCtx = ctx as AuthContext;

    try {
      const ipRaw =
        request.headers.get("x-forwarded-for") ??
        request.headers.get("x-real-ip") ??
        "unknown";

      const ip = ipRaw.split(",")[0]?.trim() || "unknown";

      const path = new URL(request.url).pathname;

      const key =
        keyGenerator?.(authCtx) ??
        (authCtx.user
          ? `${prefix}:user:${authCtx.user.id}:${path}`
          : `${prefix}:ip:${ip}:${path}`);

      const multi = redis.multi();
      multi.incr(key);
      multi.ttl(key);

      const results = await multi.exec();
      if (!results) return;

      const incrResult = results[0];
      const ttlResult = results[1];

      if (!incrResult || !ttlResult) return;

      const count = incrResult[1] as number;
      let ttl = ttlResult[1] as number;

      if (count === 1) {
        await redis.expire(key, window);
        ttl = window;
      }

      if (ttl <= 0) {
        ttl = window;
      }

      const resetTime = Math.floor(Date.now() / 1000) + ttl;

      set.headers["X-RateLimit-Limit"] = String(max);
      set.headers["X-RateLimit-Remaining"] = String(Math.max(0, max - count));
      set.headers["X-RateLimit-Reset"] = String(resetTime);

      if (count > max) {
        set.status = StatusCodes.TOO_MANY_REQUESTS;

        set.headers["Retry-After"] = String(ttl);
        set.headers["Content-Type"] = "application/json";

        return {
          message: "Too many requests",
        };
      }
    } catch (err) {
      console.error("[RateLimit Error]", err);
    }
  };
};
