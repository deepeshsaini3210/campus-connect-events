/** Prevent open redirects — only same-app paths */
export function safeRedirectPath(path: string | undefined): string {
  if (!path || typeof path !== "string") return "/dashboard";
  const trimmed = path.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return "/dashboard";
  return trimmed;
}
