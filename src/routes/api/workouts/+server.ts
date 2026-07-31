import { json } from '@sveltejs/kit';
import { isAdmin } from '$lib/server/auth';
import { getWorkouts, markWorkout, unmarkWorkout } from '$lib/server/db';

export async function GET() {
  return json(await getWorkouts());
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
  return json(await markWorkout(date, mins));
}

export async function DELETE({ request }) {
  if (!isAdmin(request)) {
    return json({ error: 'unauthorized' }, { status: 401 });
  }
  const { date } = await request.json();
  if (!date || typeof date !== 'string') {
    return json({ error: 'date is required' }, { status: 400 });
  }
  return json(await unmarkWorkout(date));
}
