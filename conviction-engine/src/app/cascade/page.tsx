import { prisma } from "@/lib/db";
import { getCurrentTeam } from "@/lib/team";
import {
  OBJECTIVE_VALIDATION_LABELS,
  PROXY_DIRECTION_LABELS,
  type ObjectiveValidationStatus,
  type ProxyDirection,
} from "@/lib/enums";
import {
  AddStrategyForm,
  AddBusinessOutcomeForm,
  AddCustomerOutcomeForm,
} from "./cascade-forms";

// Step 1 surface: the cascade is mostly-static config — the context everything
// downstream reasons against. Nothing ladders without it, so it is built first.

export const dynamic = "force-dynamic";

function fmt(n: number | null, unit?: string | null): string {
  if (n === null || n === undefined) return "—";
  const s = n.toLocaleString("en-US");
  return unit ? `${s} ${unit}` : s;
}

function StatusBadge({ status }: { status: string }) {
  const known = status as ObjectiveValidationStatus;
  const styles: Record<ObjectiveValidationStatus, string> = {
    assumption: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    validated: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    invalidated: "border-zinc-500/40 bg-zinc-500/10 text-zinc-400",
  };
  const label = OBJECTIVE_VALIDATION_LABELS[known] ?? status;
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-xs ${
        styles[known] ?? styles.assumption
      }`}
    >
      objective: {label}
    </span>
  );
}

export default async function CascadePage() {
  const team = await getCurrentTeam();

  const strategies = await prisma.strategy.findMany({
    where: { teamId: team.id },
    orderBy: { createdAt: "asc" },
    include: {
      businessOutcomes: {
        orderBy: { createdAt: "asc" },
        include: {
          customerOutcomes: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
          Conviction Engine · Step 1
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Cascade setup</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          Strategy → Business Outcome (lagging OKR) → Customer Outcome (with a
          leading proxy). This is the context every opportunity must ladder up
          to. Team: <span className="text-[var(--foreground)]">{team.name}</span>
        </p>
      </header>

      <div className="mb-6">
        <AddStrategyForm />
      </div>

      {strategies.length === 0 ? (
        <p className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
          No strategies yet. Add one above to begin the cascade.
        </p>
      ) : (
        <div className="space-y-6">
          {strategies.map((strategy) => (
            <section
              key={strategy.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <div className="mb-1 text-xs uppercase tracking-wider text-[var(--muted)]">
                Strategy
              </div>
              <h2 className="text-lg font-semibold">{strategy.title}</h2>
              {strategy.description && (
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {strategy.description}
                </p>
              )}

              <div className="mt-4 space-y-4 border-l border-[var(--border)] pl-4">
                {strategy.businessOutcomes.map((bo) => (
                  <div
                    key={bo.id}
                    className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-4"
                  >
                    <div className="mb-1 text-xs uppercase tracking-wider text-[var(--muted)]">
                      Business Outcome · {bo.metricType}
                    </div>
                    <h3 className="font-medium">{bo.okrStatement}</h3>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {fmt(bo.currentValue)} → {fmt(bo.targetValue, bo.unit)}
                      {bo.timeframe ? ` · ${bo.timeframe}` : ""}
                    </p>

                    <div className="mt-3 space-y-3 border-l border-[var(--border)] pl-4">
                      {bo.customerOutcomes.map((co) => {
                        const dir = PROXY_DIRECTION_LABELS[
                          co.proxyDirection as ProxyDirection
                        ] ?? co.proxyDirection;
                        return (
                          <div
                            key={co.id}
                            className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-4"
                          >
                            <div className="mb-1 flex items-center justify-between gap-2">
                              <span className="text-xs uppercase tracking-wider text-[var(--muted)]">
                                Customer Outcome
                              </span>
                              <StatusBadge status={co.objectiveValidationStatus} />
                            </div>
                            <h4 className="font-medium">{co.title}</h4>
                            {co.description && (
                              <p className="mt-1 text-sm text-[var(--muted)]">
                                {co.description}
                              </p>
                            )}

                            <div className="mt-3 rounded border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs">
                              <span className="font-semibold text-[var(--accent)]">
                                Leading proxy:
                              </span>{" "}
                              {co.proxyMetricName} · {fmt(co.proxyCurrent)} →{" "}
                              {fmt(co.proxyTarget, co.proxyUnit)} · {dir}
                            </div>

                            {co.earnsNarrative && (
                              <p className="mt-2 text-xs text-[var(--muted)]">
                                <span className="font-semibold text-[var(--foreground)]">
                                  Earns:
                                </span>{" "}
                                {co.earnsNarrative}
                              </p>
                            )}
                          </div>
                        );
                      })}

                      <AddCustomerOutcomeForm businessOutcomeId={bo.id} />
                    </div>
                  </div>
                ))}

                <AddBusinessOutcomeForm strategyId={strategy.id} />
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
