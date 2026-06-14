"use client";

import { useActionState, useRef, useEffect } from "react";
import {
  createStrategy,
  createBusinessOutcome,
  createCustomerOutcome,
  type ActionResult,
} from "./actions";
import {
  METRIC_TYPES,
  PROXY_DIRECTIONS,
  PROXY_DIRECTION_LABELS,
} from "@/lib/enums";

type Action = (form: FormData) => Promise<ActionResult>;

function useFormAction(action: Action) {
  return useActionState<ActionResult | null, FormData>(
    async (_prev, formData) => action(formData),
    null,
  );
}

function FieldError({ state }: { state: ActionResult | null }) {
  if (!state || state.ok) return null;
  return (
    <p className="mt-2 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
      {state.error}
    </p>
  );
}

const inputClass =
  "w-full rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none";
const labelClass = "block text-xs font-medium text-[var(--muted)] mb-1";

function Collapsible({
  summary,
  children,
}: {
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group rounded-md border border-dashed border-[var(--border)] bg-[var(--surface)]/40">
      <summary className="cursor-pointer list-none px-3 py-2 text-sm text-[var(--accent)] hover:underline">
        + {summary}
      </summary>
      <div className="border-t border-[var(--border)] p-3">{children}</div>
    </details>
  );
}

/** Resets the form on a successful submit so the inputs clear. */
function useResetOnSuccess(state: ActionResult | null) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return ref;
}

export function AddStrategyForm() {
  const [state, action, pending] = useFormAction(createStrategy);
  const ref = useResetOnSuccess(state);
  return (
    <Collapsible summary="Add a strategy">
      <form ref={ref} action={action} className="space-y-3">
        <div>
          <label className={labelClass}>Title *</label>
          <input
            name="title"
            required
            className={inputClass}
            placeholder="Grow the base by becoming the system customers expand within"
          />
        </div>
        <div>
          <label className={labelClass}>Description — how we intend to win</label>
          <textarea name="description" rows={2} className={inputClass} />
        </div>
        <FieldError state={state} />
        <SubmitButton pending={pending}>Add strategy</SubmitButton>
      </form>
    </Collapsible>
  );
}

export function AddBusinessOutcomeForm({ strategyId }: { strategyId: string }) {
  const [state, action, pending] = useFormAction(createBusinessOutcome);
  const ref = useResetOnSuccess(state);
  return (
    <Collapsible summary="Add a business outcome (OKR)">
      <form ref={ref} action={action} className="space-y-3">
        <input type="hidden" name="strategyId" value={strategyId} />
        <div>
          <label className={labelClass}>OKR statement *</label>
          <input
            name="okrStatement"
            required
            className={inputClass}
            placeholder="+$5M incremental cross-sell ARR / year"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Target</label>
            <input name="targetValue" inputMode="decimal" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Current</label>
            <input name="currentValue" inputMode="decimal" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Unit</label>
            <input name="unit" className={inputClass} placeholder="USD ARR" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Metric type</label>
            <select name="metricType" defaultValue="lagging" className={inputClass}>
              {METRIC_TYPES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Timeframe</label>
            <input name="timeframe" className={inputClass} placeholder="FY2026" />
          </div>
        </div>
        <FieldError state={state} />
        <SubmitButton pending={pending}>Add business outcome</SubmitButton>
      </form>
    </Collapsible>
  );
}

export function AddCustomerOutcomeForm({
  businessOutcomeId,
}: {
  businessOutcomeId: string;
}) {
  const [state, action, pending] = useFormAction(createCustomerOutcome);
  const ref = useResetOnSuccess(state);
  return (
    <Collapsible summary="Add a customer outcome (+ leading proxy)">
      <form ref={ref} action={action} className="space-y-3">
        <input type="hidden" name="businessOutcomeId" value={businessOutcomeId} />
        <div>
          <label className={labelClass}>Title *</label>
          <input
            name="title"
            required
            className={inputClass}
            placeholder="Reduce costly payroll errors"
          />
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea name="description" rows={2} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>
            How this <em>earns</em> the business outcome
          </label>
          <textarea
            name="earnsNarrative"
            rows={2}
            className={inputClass}
            placeholder="The customer outcome is the engine; the business outcome is the result."
          />
        </div>

        <fieldset className="rounded-md border border-[var(--border)] p-3">
          <legend className="px-1 text-xs font-semibold text-[var(--accent)]">
            Leading proxy — required (teams steer on this weekly)
          </legend>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Proxy metric name *</label>
              <input
                name="proxyMetricName"
                required
                className={inputClass}
                placeholder="$ of errors caught pre-payment"
              />
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className={labelClass}>Current</label>
                <input name="proxyCurrent" inputMode="decimal" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Target</label>
                <input name="proxyTarget" inputMode="decimal" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Unit</label>
                <input name="proxyUnit" className={inputClass} placeholder="USD / qtr" />
              </div>
              <div>
                <label className={labelClass}>Direction</label>
                <select
                  name="proxyDirection"
                  defaultValue="increase"
                  className={inputClass}
                >
                  {PROXY_DIRECTIONS.map((d) => (
                    <option key={d} value={d}>
                      {PROXY_DIRECTION_LABELS[d]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </fieldset>

        <FieldError state={state} />
        <SubmitButton pending={pending}>Add customer outcome</SubmitButton>
      </form>
    </Collapsible>
  );
}

function SubmitButton({
  pending,
  children,
}: {
  pending: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[#0b0d12] disabled:opacity-50"
    >
      {pending ? "Saving…" : children}
    </button>
  );
}
