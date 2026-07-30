import { json } from '@sveltejs/kit';
import crypto from 'node:crypto';
import { getWorkouts, markWorkout, unmarkWorkout } from '$lib/server/db';

const ADMIN_KEY_HASH = 'c9344c5f1079f7ce9b007e604829f7e8e4516e9132e098ebd58e2cc7f2a5fd4c';

function isAdmin(request: Request): boolean {
  const key = request.headers.get('x-admin-key');
  if (!key) return false;
  const hash = crypto.createHash('sha256').update(key).digest();
  if (hash.length !== Buffer.from(ADMIN_KEY_HASH, 'hex').length) return false;
  return crypto.timingSafeEqual(hash, Buffer.from(ADMIN_KEY_HASH, 'hex'));
}

export function GET() {
  return json(getWorkouts());
}

export async function POST({ request }) {
  if (!isAdmin(request)) {
    return json({ error: 'unauthorized' }, { status: 401 });
  }
  const { date, minutes } = await request.json();
  if (!date || typeof date !== 'string') {
    return json({ error: 'date is required' }, { status: 400 });
  }
  const mins = typeof minutes === 'number' ? minutes : 0;
  return json(markWorkout(date, mins));
}

export async function DELETE({ request }) {
  if (!isAdmin(request)) {
    return json({ error: 'unauthorized' }, { status: 401 });
  }
  const { date } = await request.json();
  if (!date || typeof date !== 'string') {
    return json({ error: 'date is required' }, { status: 400 });
  }
  return json(unmarkWorkout(date));
}
