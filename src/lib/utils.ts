export { cn } from "cn"



export function buildUrl(
  baseUrl: string,
  params?: Record<string, string | number | undefined | null | boolean>,
): string {
  const query = new URLSearchParams();

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value));
      }
    }
  }

  const queryString = query.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}
