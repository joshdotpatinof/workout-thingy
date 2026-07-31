import { json } from '@sveltejs/kit';
import { isAdmin } from '$lib/server/auth';
import { clearAll } from '$lib/server/db';

export async function DELETE({ request }) {
  if (!isAdmin(request)) {
    return json({ error: 'unauthorized' }, { status: 401 });
  }
  return json(await clearAll());
}
