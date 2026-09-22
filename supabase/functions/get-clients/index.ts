import '@supabase/functions-js/edge-runtime.d.ts';

import { corsHeaders, json } from '../_shared/admin.ts';
import { selectRows } from '../_shared/database.ts';

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    if (request.method !== 'GET') {
      return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }
    const result = await selectRows(
      'clients',
      'id,first_name,username,last_message_at',
      'last_message_at.desc.nullslast',
    );
    if (result.error) {
      console.error('Could not load clients', result.error);
      return json({ error: 'Could not load clients' }, 500);
    }

    return json({ clients: result.data });
  },
};
