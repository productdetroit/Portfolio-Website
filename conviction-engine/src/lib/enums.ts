// Enum-typed values for the cascade.
//
// SQLite (via Prisma) does not support native enums, so these fields are stored
// as String columns and validated here, in the app layer. This module is the
// single source of truth for the allowed values and their human labels.

export const METRIC_TYPES = ["lagging", "leading"] as const;
export type MetricType = (typeof METRIC_TYPES)[number];

export const PROXY_DIRECTIONS = ["increase", "decrease"] as const;
export type ProxyDirection = (typeof PROXY_DIRECTIONS)[number];

// "Is this genuinely the customer's OKR, or our projection onto them?"
// Starts as `assumption`; promotion to `validated` is the structurally-enforced
// gate built in Step 3 (validation). Never set to `validated` here.
export const OBJECTIVE_VALIDATION_STATUSES = [
  "assumption",
  "validated",
  "invalidated",
] as const;
export type ObjectiveValidationStatus =
  (typeof OBJECTIVE_VALIDATION_STATUSES)[number];

export const PROXY_DIRECTION_LABELS: Record<ProxyDirection, string> = {
  increase: "↑ increase",
  decrease: "↓ decrease",
};

export const OBJECTIVE_VALIDATION_LABELS: Record<
  ObjectiveValidationStatus,
  string
> = {
  assumption: "Assumption",
  validated: "Validated",
  invalidated: "Invalidated",
};

export function isOneOf<T extends readonly string[]>(
  allowed: T,
  value: unknown,
): value is T[number] {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}
