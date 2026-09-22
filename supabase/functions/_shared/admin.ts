export const corsHeaders = {
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Origin': '*',
};

export function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: corsHeaders });
}
