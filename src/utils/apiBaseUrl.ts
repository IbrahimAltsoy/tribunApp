/**
 * API base URL helpers
 * Normalize trailing slashes and safely join paths.
 */

export const normalizeBaseUrl = (baseUrl: string): string =>
  baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

export const joinUrl = (baseUrl: string, path: string): string => {
  const base = normalizeBaseUrl(baseUrl);
  if (!base) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

export const getApiBaseUrl = (fallback = ""): string =>
  normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL || fallback);
