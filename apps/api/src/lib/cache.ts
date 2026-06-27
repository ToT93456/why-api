import Redis from "ioredis";

const memory = new Map<string, string>();

const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 1 }) : null;

export const cache = {
  async get(key: string) {
    if (redis) {
      return redis.get(key);
    }

    return memory.get(key) ?? null;
  },
  async set(key: string, value: string, ttlSeconds: number) {
    if (redis) {
      await redis.set(key, value, "EX", ttlSeconds);
      return;
    }

    memory.set(key, value);
    setTimeout(() => memory.delete(key), ttlSeconds * 1000).unref();
  },
  async del(key: string) {
    if (redis) {
      await redis.del(key);
      return;
    }

    memory.delete(key);
  },
};
