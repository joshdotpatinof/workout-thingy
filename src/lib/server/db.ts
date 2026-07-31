import { Redis } from '@upstash/redis';
import { env } from '$env/dynamic/private';

type Workouts = Record<string, number>;

const KEY = 'workouts';

const redis = env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN })
  : null;

const memory = new Map<string, number>();

if (!redis) {
  console.warn('Upstash Redis not configured; using in-memory storage (data will not persist).');
}

export async function getWorkouts(): Promise<Workouts> {
  if (!redis) return Object.fromEntries(memory);
  const raw = await redis.hgetall(KEY);
  if (!raw) return {};
  const out: Workouts = {};
  for (const [field, value] of Object.entries(raw)) {
    const n = Number(value);
    if (!Number.isNaN(n)) out[field] = n;
  }
  return out;
}

export async function markWorkout(date: string, minutes: number): Promise<Workouts> {
  if (redis) {
    await redis.hset(KEY, { [date]: minutes });
  } else {
    memory.set(date, minutes);
  }
  return getWorkouts();
}

export async function unmarkWorkout(date: string): Promise<Workouts> {
  if (redis) {
    await redis.hdel(KEY, date);
  } else {
    memory.delete(date);
  }
  return getWorkouts();
}

export async function clearAll(): Promise<Workouts> {
  if (redis) {
    await redis.del(KEY);
  } else {
    memory.clear();
  }
  return {};
}
