import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { clearAll } from '$lib/server/db';

export async function DELETE({ request }) {
  if (request.headers.get('x-admin-key') !== env.ADMIN_KEY) {
    return json({ error: 'unauthorized' }, { status: 401 });
  }
  return json(clearAll());
}
