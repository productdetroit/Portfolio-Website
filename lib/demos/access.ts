/** Who may open a demo. Pure — no I/O — so the rules are unit-testable.
 *
 *  A demo's `access` list holds rules. Each is either a full address
 *  (`ana@motor.com`) or a bare domain (`@motor.com`) that admits everyone at
 *  that company. Owners (DEMO_OWNER_EMAILS) see every demo and the access log.
 *
 *  Access is evaluated on every request against the live manifest, never
 *  baked into the session — removing a rule revokes on the next page load. */

/** Lowercase, trimmed, or null when it isn't shaped like an address.
 *  Deliberately loose: the allowlist is the real gate, this just keeps
 *  garbage out of blob pathnames and email headers. */
export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (email.length > 254) return null;
  if (!/^[^\s@/\\]+@[^\s@/\\]+\.[^\s@/\\]+$/.test(email)) return null;
  return email;
}

/** `@motor.com` matches any address at motor.com; anything else must match
 *  the whole address. Both sides are compared lowercase. */
export function ruleMatches(rule: string, email: string): boolean {
  const r = rule.trim().toLowerCase();
  if (!r) return false;
  if (r.startsWith("@")) return email.endsWith(r) && email.indexOf("@") === email.length - r.length;
  return r === email;
}

export function isDomainRule(rule: string): boolean {
  return rule.trim().startsWith("@");
}

export function canView(email: string, access: readonly string[]): boolean {
  return access.some((rule) => ruleMatches(rule, email));
}

export function isOwner(email: string, owners: readonly string[]): boolean {
  return owners.some((o) => o.trim().toLowerCase() === email);
}

/** True when this address is allowed to request a sign-in link at all —
 *  an owner, on at least one demo's list, or holding an invitation. The
 *  sign-in form never reveals which, so a stranger can't probe the list. */
export function mayRequestLink(
  email: string,
  owners: readonly string[],
  demos: readonly { access: readonly string[] }[],
  invites: readonly { email: string }[] = [],
): boolean {
  return isOwner(email, owners) || demos.some((d) => canView(email, d.access)) || invites.some((i) => i.email === email);
}
