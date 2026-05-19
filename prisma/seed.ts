import { PrismaClient } from "@prisma/client";
import { seedDays } from "./seed/plan";
import { seedRecurring } from "./seed/recurring";
import { seedKpis } from "./seed/kpis";
import { seedScripts } from "./seed/scripts";
import { seedChannels } from "./seed/channels";
import { seedTools } from "./seed/tools";
import { seedPersonas } from "./seed/personas";
import { seedCompliance } from "./seed/compliance";
import { seedWarnings } from "./seed/warnings";
import { seedDecisions } from "./seed/decisions";
import { seedMonths } from "./seed/months";
import { seedAds } from "./seed/ads";
import { seedContent } from "./seed/content";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Logistics Command Center...");

  // Reset everything (idempotent re-seed)
  await db.adMetric.deleteMany();
  await db.adCreative.deleteMany();
  await db.adCampaign.deleteMany();
  await db.kpiLog.deleteMany();
  await db.recurringLog.deleteMany();
  await db.scoreSnapshot.deleteMany();
  await db.dailyTask.deleteMany();
  await db.day.deleteMany();
  await db.month.deleteMany();
  await db.recurringTask.deleteMany();
  await db.kpiDefinition.deleteMany();
  await db.referral.deleteMany();
  await db.pastClient.deleteMany();
  await db.lead.deleteMany();
  await db.script.deleteMany();
  await db.channel.deleteMany();
  await db.tool.deleteMany();
  await db.contentItem.deleteMany();
  await db.objectionHandler.deleteMany();
  await db.persona.deleteMany();
  await db.complianceRule.deleteMany();
  await db.timedWarning.deleteMany();
  await db.decisionRule.deleteMany();
  await db.appState.deleteMany();

  // App state — start today (2026-05-20)
  await db.appState.create({
    data: {
      id: 1,
      startDate: new Date("2026-05-20T00:00:00.000Z"),
      founderName: "Yasir Bashir",
      agencyName: "Logistics Solutions",
      northStarTarget: 8,
      mrrTarget: 10000,
    },
  });

  await seedMonths(db);
  await seedDays(db);
  await seedRecurring(db);
  await seedKpis(db);
  await seedScripts(db);
  await seedChannels(db);
  await seedTools(db);
  await seedPersonas(db);
  await seedCompliance(db);
  await seedWarnings(db);
  await seedDecisions(db);
  await seedAds(db);
  await seedContent(db);

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
