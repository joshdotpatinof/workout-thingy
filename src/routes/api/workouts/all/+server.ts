import { json } from '@sveltejs/kit';
import { ADMIN_KEY } from '$env/static/private';
import { clearAll } from '$lib/server/db';

export async function DELETE({ request }) {
  if (request.headers.get('x-admin-key') !== ADMIN_KEY) {
    return json({ error: 'unauthorized' }, { status: 401 });
  }
  return json(clearAll());
}
