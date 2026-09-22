export async function selectRows(
  table: 'clients' | 'messages',
  select: string,
  order: string,
): Promise<{ data: unknown; error?: string }> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    return { data: null, error: 'Supabase service credentials are not configured' };
  }

  const url = new URL(`/rest/v1/${table}`, supabaseUrl);
  url.searchParams.set('select', select);
  url.searchParams.set('order', order);

  const response = await fetch(url, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });

  if (!response.ok) {
    return { data: null, error: await response.text() };
  }

  return { data: await response.json() };
}
