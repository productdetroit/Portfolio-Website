import { PrismaClient } from "@prisma/client";

// Seeds the single-team org and one worked-example cascade (spec §7) so the
// cascade view has something real to render. Idempotent: if a Strategy already
// exists, it does nothing.

const prisma = new PrismaClient();

async function main() {
  const existingStrategy = await prisma.strategy.findFirst();
  if (existingStrategy) {
    console.log("Cascade already seeded — skipping.");
    return;
  }

  let team = await prisma.team.findFirst({ orderBy: { createdAt: "asc" } });
  if (!team) {
    const org = await prisma.organization.create({
      data: {
        name: "Acme (single-team MVP)",
        teams: { create: { name: "Product Team" } },
      },
      include: { teams: true },
    });
    team = org.teams[0];
  }

  await prisma.strategy.create({
    data: {
      teamId: team.id,
      title: "Grow the base by becoming the system customers expand within",
      description:
        "Win by deepening usage inside existing accounts rather than chasing net-new logos. The more critical workflows run on us, the more customers expand.",
      businessOutcomes: {
        create: [
          {
            okrStatement: "+$5M incremental cross-sell ARR / year",
            targetValue: 5_000_000,
            currentValue: 0,
            unit: "USD ARR",
            metricType: "lagging",
            timeframe: "FY2026",
            customerOutcomes: {
              create: [
                {
                  title: "Reduce costly payroll errors",
                  description:
                    "Payroll managers avoid the overpayments, penalties, rework, and lost trust that follow a bad payroll run.",
                  proxyMetricName: "$ of errors caught pre-payment",
                  proxyCurrent: 0,
                  proxyTarget: 250_000,
                  proxyUnit: "USD / quarter",
                  proxyDirection: "increase",
                  earnsNarrative:
                    "Catching costly errors makes us the system of record customers trust with risk-bearing work, unlocking the compliance add-on that drives cross-sell ARR.",
                  objectiveValidationStatus: "assumption",
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Seeded worked-example cascade.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
