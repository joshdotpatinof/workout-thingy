import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getWorkouts, markWorkout, unmarkWorkout } from '$lib/server/db';

function isAdmin(request: Request): boolean {
  return request.headers.get('x-admin-key') === env.ADMIN_KEY;
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
