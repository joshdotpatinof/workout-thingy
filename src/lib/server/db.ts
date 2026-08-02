import { Redis } from '@upstash/redis';
import { env } from '$env/dynamic/private';

export interface WorkoutEntry {
  minutes: number;
  pushUps: number;
  pullUps: number;
  squats: number;
}

type Workouts = Record<string, WorkoutEntry>;

const KEY = 'workouts';

const redis = env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN })
  : null;

const memory = new Map<string, WorkoutEntry>();

if (!redis) {
  console.warn('Upstash Redis not configured; using in-memory storage (data will not persist).');
}

function parseEntry(value: unknown): WorkoutEntry | null {
  if (value == null) return null;
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    if (typeof parsed === 'number') {
      return { minutes: parsed, pushUps: 0, pullUps: 0, squats: 0 };
    }
    if (parsed && typeof parsed === 'object' && typeof parsed.minutes === 'number') {
      return {
        minutes: parsed.minutes,
        pushUps: typeof parsed.pushUps === 'number' ? parsed.pushUps : 0,
        pullUps: typeof parsed.pullUps === 'number' ? parsed.pullUps : 0,
        squats: typeof parsed.squats === 'number' ? parsed.squats : 0,
      };
    }
  } catch {}
  return null;
}

export async function getWorkouts(): Promise<Workouts> {
  if (!redis) return Object.fromEntries(memory);
  const raw = await redis.hgetall(KEY);
  if (!raw) return {};
  const out: Workouts = {};
  for (const [field, value] of Object.entries(raw)) {
    const entry = parseEntry(value);
    if (entry) out[field] = entry;
  }
  return out;
}

export async function markWorkout(
  date: string,
  minutes: number,
  pushUps: number,
  pullUps: number,
  squats: number
): Promise<Workouts> {
  const entry: WorkoutEntry = { minutes, pushUps, pullUps, squats };
  if (redis) {
    await redis.hset(KEY, { [date]: JSON.stringify(entry) });
  } else {
    memory.set(date, entry);
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
