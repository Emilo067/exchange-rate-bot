import { EdgeFunctionError } from "./error";
export function edgeFunctionUrl(
  name: string,
  baseUrl = import.meta.env.VITE_SUPABASE_URL,
): string {
  if (!baseUrl?.trim())
    throw new EdgeFunctionError("VITE_SUPABASE_URL is not configured");
  return `${baseUrl.replace(/\/$/, "")}/functions/v1/${name}`;
}
export async function getEdgeFunction<T>(name: string): Promise<T> {
  const response = await fetch(edgeFunctionUrl(name));
  if (!response.ok)
    throw new EdgeFunctionError(`Request failed (${response.status})`);
  try {
    return (await response.json()) as T;
  } catch {
    throw new EdgeFunctionError("Response is not valid JSON");
  }
}
