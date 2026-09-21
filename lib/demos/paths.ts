/** Where to send someone after they sign in. Only paths inside the space —
 *  an open redirect through the sign-in email would be a phishing gift. */
export function safeNext(raw: unknown): string {
  return typeof raw === "string" && /^\/demos(\/[a-z0-9-]+)?$/.test(raw) ? raw : "/demos";
}
