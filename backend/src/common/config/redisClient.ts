import { createClient } from 'redis';

const redis = createClient({
  url: `redis://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

redis.on('connect', () => {
  console.log('Redis connected');
});

redis.on('error', (err) => {
  console.error('Redis Error:', err);
});

(async () => {
  try {
    await redis.connect();
  } catch (error) {
    console.error('Redis connection failed:', error);
  }
})();

export default redis;
