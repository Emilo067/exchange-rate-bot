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
      'messages',
      'id,client_id,sender,text,created_at',
      'created_at.desc',
    );
    if (result.error) {
      console.error('Could not load messages', result.error);
      return json({ error: 'Could not load messages' }, 500);
    }

    return json({ messages: result.data });
  },
};
