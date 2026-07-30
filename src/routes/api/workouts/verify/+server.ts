import { json } from '@sveltejs/kit';
import { isAdmin } from '$lib/server/auth';

export function GET({ request }) {
  if (!isAdmin(request)) {
    return json({ error: 'unauthorized' }, { status: 401 });
  }
  return json({ ok: true });
}
