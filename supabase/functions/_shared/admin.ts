export const corsHeaders = {
  'Access-Control-Allow-Headers': 'apikey, authorization, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Origin': '*',
};

export function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: corsHeaders });
}

export async function requireAdmin(request: Request): Promise<Response | null> {
  const authorization = request.headers.get('authorization');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!authorization?.startsWith('Bearer ') || !supabaseUrl || !serviceRoleKey) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const userResponse = await fetch(new URL('/auth/v1/user', supabaseUrl), {
    headers: {
      apikey: serviceRoleKey,
      Authorization: authorization,
    },
  });

  if (!userResponse.ok) return json({ error: 'Unauthorized' }, 401);

  const user = await userResponse.json() as { id?: string };
  if (!user.id) return json({ error: 'Unauthorized' }, 401);

  const membershipUrl = new URL('/rest/v1/admin_users', supabaseUrl);
  membershipUrl.searchParams.set('select', 'user_id');
  membershipUrl.searchParams.set('user_id', `eq.${user.id}`);
  membershipUrl.searchParams.set('limit', '1');

  const membershipResponse = await fetch(membershipUrl, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });

  if (!membershipResponse.ok) {
    console.error('Could not check administrator membership', await membershipResponse.text());
    return json({ error: 'Could not authorize administrator' }, 500);
  }

  const members = await membershipResponse.json() as Array<{ user_id: string }>;
  return members.length ? null : json({ error: 'Forbidden' }, 403);
}
