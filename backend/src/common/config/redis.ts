import Redis from "ioredis";

export const redis = new Redis({
  host: Bun.env.REDIS_HOST,
  port: Bun.env.REDIS_PORT ? parseInt(Bun.env.REDIS_PORT, 10) : 6379,
  password: Bun.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});
