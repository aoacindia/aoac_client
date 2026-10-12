export function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_BASE_URL?.trim() || "https://www.aoac.in";
  return raw.replace(/\/+$/, "");
}

export function absoluteUrl(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalized}`;
}
