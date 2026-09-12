const localHosts = new Set(['127.0.0.1', 'localhost', '::1']);

export function assertAllowedUrl(rawUrl: string, allowedUrls: string[]): URL {
  const url = new URL(rawUrl);
  const configured = allowedUrls.some((allowed) => new URL(allowed).origin === url.origin);
  if (!configured && !localHosts.has(url.hostname)) throw new Error(`Network destination is not allowlisted: ${url.origin}`);
  return url;
}
