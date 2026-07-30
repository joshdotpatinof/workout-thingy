import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve('.data');
const DB_FILE = path.join(DATA_DIR, 'workouts.json');

type Workouts = Record<string, number>;

function read(): Workouts {
  try {
    if (!fs.existsSync(DB_FILE)) return {};
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function write(data: Workouts): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export function getWorkouts(): Workouts {
  return read();
}

export function markWorkout(date: string, minutes: number): Workouts {
  const data = read();
  data[date] = minutes;
  write(data);
  return data;
}

export function unmarkWorkout(date: string): Workouts {
  const data = read();
  delete data[date];
  write(data);
  return data;
}

export function clearAll(): Workouts {
  write({});
  return {};
}
