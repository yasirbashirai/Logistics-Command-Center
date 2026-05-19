import type { PrismaClient } from "@prisma/client";

// Dated regulatory / platform / opportunity warnings from RESEARCH §8.
// type: sunset | regulatory | banned | opportunity

export const warnings = [
  {
    title: "Sora 2 API shut-down",
    eventDate: new Date("2026-09-24T00:00:00Z"),
    type: "sunset",
    description: "OpenAI Sora 2 API discontinued Sept 24 2026. Web/app already discontinued April 26 2026.",
    affectedAreas: "Video creative pipeline",
    action: "Do NOT use Sora for production. Use Runway (Gen-4.5 / Veo) + HeyGen avatar.",
  },
  {
    title: "FMCSA broker bond enforcement tightened",
    eventDate: new Date("2026-01-16T00:00:00Z"),
    type: "regulatory",
    description: "Single-day dip below $75K bond = 7-day suspension for freight brokers.",
    affectedAreas: "Broker outreach + pitch positioning",
    action: "PITCH ANGLE: Bond monitoring dashboard / carrier vetting for brokers. Fresh trauma = sellable.",
  },
  {
    title: "Non-domiciled CDL final rule",
    eventDate: new Date("2026-03-16T00:00:00Z"),
    type: "regulatory",
    description: "194K non-domiciled CDL drivers may exit over 24 months (esp. drayage).",
    affectedAreas: "Carrier outreach",
    action: "Compliance positioning angle for scaling carriers — driver-recruiting funnel becomes more urgent.",
  },
  {
    title: "ELD replacement deadline (14 models revoked)",
    eventDate: new Date("2026-05-04T00:00:00Z"),
    type: "regulatory",
    description: "ELDs revoked: Club, SAFERLOGS, Gorilla + 11 others. Owner-ops need $400-600 replacement.",
    affectedAreas: "Owner-op + carrier outreach",
    action: "OPPORTUNITY: 'ELD integration dashboard' pitch during renewal chaos. Reference May 4 deadline in cold email.",
  },
  {
    title: "Motus registration transition",
    eventDate: new Date("2026-05-14T00:00:00Z"),
    type: "regulatory",
    description: "No PO Box; Login.gov required; physical address producing records in 48h. Targets chameleon carriers.",
    affectedAreas: "Small carrier outreach",
    action: "Compliance angle for small ops without offices.",
  },
  {
    title: "HeyReach LinkedIn ban",
    eventDate: new Date("2025-02-15T00:00:00Z"),
    type: "banned",
    description: "HeyReach banned by LinkedIn Feb 2025; ~40% of users restricted Q1 2026.",
    affectedAreas: "LinkedIn outreach tooling",
    action: "DO NOT USE HEYREACH. Manual + Sales Nav only. Dripify <25/day if any automation.",
  },
  {
    title: "Meta granular interests retired",
    eventDate: new Date("2025-06-01T00:00:00Z"),
    type: "banned",
    description: "Meta retired many granular targeting interests June 2025 (esp. 'trucking' sub-interests).",
    affectedAreas: "Meta ads targeting",
    action: "Verify each interest in Ads Manager before launching campaign — old guides reference dead interests.",
  },
  {
    title: "Google/Yahoo email auth fully enforced",
    eventDate: new Date("2025-11-01T00:00:00Z"),
    type: "regulatory",
    description: "Bulk sender requirements enforced: SPF + DKIM 1024-bit + DMARC p=quarantine minimum + <0.3% spam complaint rate.",
    affectedAreas: "Cold email sending",
    action: "MANDATORY: Configure SPF/DKIM/DMARC on all 3 sending domains Day 2. Validate via MXToolbox.",
  },
];

export async function seedWarnings(db: PrismaClient) {
  for (const w of warnings) {
    await db.timedWarning.create({ data: w });
  }
  console.log(`  ✓ Seeded ${warnings.length} timed warnings`);
}
