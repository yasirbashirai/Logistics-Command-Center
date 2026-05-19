import type { PrismaClient } from "@prisma/client";

// Pre-seeded ad plan from PLAN §9 — Week 4 launch, $300/mo split across 4 buckets.
// User can edit / pause / kill these as actuals come in.

export const adCampaigns = [
  {
    name: "Meta — Lead Form (Carriers)",
    platform: "meta",
    campaignType: "lead_form",
    status: "planned",
    monthNumber: 1,
    dailyBudget: 5,
    monthlyBudget: 150,
    audience: "US · M/F 28-58 · 'owner trucking company' / 'freight broker' / 'fleet manager' interests · exclude Big-3 enterprise titles",
    objective: "Lead form CPL target $8-25. Volume play. Lead Connector form fields: company website, role, bottleneck.",
    notes: "PRIMARY M1 PAID CHANNEL — 50% of budget. Launch Day 23. Pause if CTR <0.5% by Day 3 OR CPL >3× target.",
    creatives: [
      { name: "AD 1 — Founder selfie 18s", format: "video", scriptKeyRef: "ad-1-founder-selfie", status: "ready" },
      { name: "AD 2 — Dispatch screen-record 22s", format: "video", scriptKeyRef: "ad-2-screen-record", status: "ready" },
      { name: "AD 3 — Static stat image", format: "image", scriptKeyRef: "ad-3-static-image", status: "ready" },
    ],
  },
  {
    name: "Meta — Click-to-WhatsApp",
    platform: "meta",
    campaignType: "ctwa",
    status: "planned",
    monthNumber: 1,
    dailyBudget: 3,
    monthlyBudget: 90,
    audience: "Same as Lead Form. CTWA opens 72hr free-messaging window — async OK across time zones.",
    objective: "Drive chat opens. Manual qualify via OpenPhone WhatsApp app. Phase 1 (no automation Month 1).",
    notes: "Unique offshore unlock — async replies from Pakistan time look 'fast' to US prospects (overnight reply lands at 9am their time).",
    creatives: [
      { name: "CTWA AD 1 — Question hook", format: "video", hook: "Is your dispatch board broken? Tap to chat — I'll show you in 2 min.", cta: "Send WhatsApp message", status: "draft" },
    ],
  },
  {
    name: "Meta — Retargeting (LP visitors)",
    platform: "meta",
    campaignType: "retargeting",
    status: "planned",
    monthNumber: 1,
    dailyBudget: 1,
    monthlyBudget: 30,
    audience: "Pixel: yasirbashir.com visitors last 30 days + LP scrollers >50%",
    objective: "Re-warm visitors who didn't book. Show testimonial + case-study creative.",
    notes: "Tiny budget M1 (pool is small). Will scale meaningfully Month 2-3.",
    creatives: [
      { name: "RT AD 1 — Testimonial video", format: "video", hook: "Don't take my word — hear from a 12-truck carrier we just launched.", status: "draft" },
    ],
  },
  {
    name: "TikTok — Spark Ad",
    platform: "tiktok",
    campaignType: "spark",
    status: "planned",
    monthNumber: 1,
    dailyBudget: 1,
    monthlyBudget: 30,
    audience: "US · 25-55 · #trucking #freight #fleet hashtag affinity",
    objective: "Boost ONE organic post that crossed 1K views. Spark Ads get 134% higher completion vs cold paid.",
    notes: "Only run if a TikTok organic post crosses 1K views. Otherwise skip and reallocate to Meta Lead Form.",
    creatives: [
      { name: "Spark organic post", format: "video", status: "draft" },
    ],
  },
];

export async function seedAds(db: PrismaClient) {
  for (const camp of adCampaigns) {
    const { creatives, ...campData } = camp;
    const created = await db.adCampaign.create({ data: campData });
    for (const c of creatives) {
      await db.adCreative.create({
        data: { ...c, campaignId: created.id },
      });
    }
  }
  console.log(`  ✓ Seeded ${adCampaigns.length} ad campaigns with ${adCampaigns.reduce((s, c) => s + c.creatives.length, 0)} creatives`);
}
