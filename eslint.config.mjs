import { defineConfig, globalIgnores } from "eslint/config";
import next from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/** Flat config: `next lint` was removed in Next 16, so `npm run lint` calls
 *  the ESLint CLI directly and the rule set lives here rather than being
 *  assembled by Next.
 *
 *  .claude/worktrees holds detached working copies of this same app — linting
 *  them would double every finding and report them against paths that aren't
 *  the source of truth. */
export default defineConfig([
  globalIgnores([
    ".next/**",
    "next-env.d.ts",
    ".claude/worktrees/**",
  ]),
  ...next,
  ...nextTypescript,
]);
