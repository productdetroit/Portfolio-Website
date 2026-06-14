"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentTeamId } from "@/lib/team";
import {
  METRIC_TYPES,
  PROXY_DIRECTIONS,
  isOneOf,
} from "@/lib/enums";

// Server actions for Step 1 (Cascade setup). Each validates the spine's
// load-bearing rules before writing: the "earns" edge must point at a real
// parent, and every Customer Outcome must carry a leading proxy (metric name +
// direction) — no proxy, no save.

export type ActionResult = { ok: true } | { ok: false; error: string };

function str(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function optionalNumber(
  form: FormData,
  key: string,
): { ok: true; value: number | null } | { ok: false } {
  const raw = str(form, key);
  if (raw === "") return { ok: true, value: null };
  const n = Number(raw);
  if (Number.isNaN(n)) return { ok: false };
  return { ok: true, value: n };
}

export async function createStrategy(form: FormData): Promise<ActionResult> {
  const title = str(form, "title");
  if (!title) return { ok: false, error: "Strategy title is required." };

  const teamId = await getCurrentTeamId();
  await prisma.strategy.create({
    data: {
      teamId,
      title,
      description: str(form, "description") || null,
    },
  });

  revalidatePath("/cascade");
  return { ok: true };
}

export async function createBusinessOutcome(
  form: FormData,
): Promise<ActionResult> {
  const strategyId = str(form, "strategyId");
  const okrStatement = str(form, "okrStatement");
  if (!strategyId) return { ok: false, error: "Missing parent strategy." };
  if (!okrStatement) return { ok: false, error: "OKR statement is required." };

  const metricType = str(form, "metricType") || "lagging";
  if (!isOneOf(METRIC_TYPES, metricType)) {
    return { ok: false, error: "Invalid metric type." };
  }

  const target = optionalNumber(form, "targetValue");
  const current = optionalNumber(form, "currentValue");
  if (!target.ok || !current.ok) {
    return { ok: false, error: "Target and current must be numbers." };
  }

  // Verify the parent belongs to the current team — the cascade scope seam.
  const teamId = await getCurrentTeamId();
  const strategy = await prisma.strategy.findFirst({
    where: { id: strategyId, teamId },
    select: { id: true },
  });
  if (!strategy) return { ok: false, error: "Strategy not found for this team." };

  await prisma.businessOutcome.create({
    data: {
      strategyId,
      okrStatement,
      targetValue: target.value,
      currentValue: current.value,
      unit: str(form, "unit") || null,
      metricType,
      timeframe: str(form, "timeframe") || null,
    },
  });

  revalidatePath("/cascade");
  return { ok: true };
}

export async function createCustomerOutcome(
  form: FormData,
): Promise<ActionResult> {
  const businessOutcomeId = str(form, "businessOutcomeId");
  const title = str(form, "title");
  const proxyMetricName = str(form, "proxyMetricName");

  if (!businessOutcomeId) {
    return { ok: false, error: "Missing parent business outcome." };
  }
  if (!title) return { ok: false, error: "Customer outcome title is required." };

  // Non-negotiable: every lagging OKR needs a leading proxy. No proxy metric,
  // no save — this keeps "outcome focus" from decaying into vibes (spec §2).
  if (!proxyMetricName) {
    return {
      ok: false,
      error:
        "A leading proxy metric is required — every customer outcome must be steerable.",
    };
  }

  const proxyDirection = str(form, "proxyDirection") || "increase";
  if (!isOneOf(PROXY_DIRECTIONS, proxyDirection)) {
    return { ok: false, error: "Invalid proxy direction." };
  }

  const proxyCurrent = optionalNumber(form, "proxyCurrent");
  const proxyTarget = optionalNumber(form, "proxyTarget");
  if (!proxyCurrent.ok || !proxyTarget.ok) {
    return { ok: false, error: "Proxy current/target must be numbers." };
  }

  // Verify the parent ladders up to the current team.
  const teamId = await getCurrentTeamId();
  const parent = await prisma.businessOutcome.findFirst({
    where: { id: businessOutcomeId, strategy: { teamId } },
    select: { id: true },
  });
  if (!parent) {
    return { ok: false, error: "Business outcome not found for this team." };
  }

  await prisma.customerOutcome.create({
    data: {
      businessOutcomeId,
      title,
      description: str(form, "description") || null,
      proxyMetricName,
      proxyCurrent: proxyCurrent.value,
      proxyTarget: proxyTarget.value,
      proxyUnit: str(form, "proxyUnit") || null,
      proxyDirection,
      earnsNarrative: str(form, "earnsNarrative") || null,
      // objectiveValidationStatus stays at its default "assumption" — it is
      // only ever flipped by the structurally-enforced validation gate (Step 3).
    },
  });

  revalidatePath("/cascade");
  return { ok: true };
}
