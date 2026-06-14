import { prisma } from "@/lib/db";

// MVP scope (spec §6): the data layer is org-wide, but the UI ships for a
// single team. Every cascade query is scoped through this helper. When
// multi-team support is built later, this is the seam that changes — the
// schema already carries the Organization/Team FKs.

const SINGLE_TEAM_ORG_NAME = "Acme (single-team MVP)";
const SINGLE_TEAM_NAME = "Product Team";

/**
 * Returns the one Team the MVP operates as, creating the Organization + Team
 * on first call so the app works on a fresh database without a seed step.
 */
export async function getCurrentTeam() {
  const existing = await prisma.team.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing;

  const org = await prisma.organization.create({
    data: {
      name: SINGLE_TEAM_ORG_NAME,
      teams: { create: { name: SINGLE_TEAM_NAME } },
    },
    include: { teams: true },
  });
  return org.teams[0];
}

export async function getCurrentTeamId(): Promise<string> {
  return (await getCurrentTeam()).id;
}
