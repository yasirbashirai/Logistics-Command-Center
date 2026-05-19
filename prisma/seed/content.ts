import type { PrismaClient } from "@prisma/client";

// Pre-seed the 4-post weekly LinkedIn cadence (Mon/Wed/Fri/Sun) for Weeks 1-4
// + Loom teardown placeholders + ad creative trackers + case studies.
// User edits body content as they create each piece.

const POST_PLAN: Array<{ week: number; day: string; title: string; hook: string; type: string; platform: string }> = [
  // Week 1 — too early for posts, profile rewrite only
  // Week 2
  { week: 2, day: "Mon", title: "Week 2 carousel — 5 broken things on a moving-co site", hook: "I broke down 100 moving-company websites. Same 5 mistakes every time.", type: "linkedin_post", platform: "linkedin" },
  { week: 2, day: "Wed", title: "Week 2 short video — overflow lead capture", hook: "Your dispatch is overwhelmed at 3pm. Your website is sending leads to a Gmail address. Here's the 2-hr fix.", type: "linkedin_post", platform: "linkedin" },
  { week: 2, day: "Fri", title: "Week 2 contrarian text — 'Stop calling it AI'", hook: "Logistics buyers don't want AI. They want their evenings back. Here's the language shift that books 3× more calls.", type: "linkedin_post", platform: "linkedin" },
  { week: 2, day: "Sun", title: "Week 2 case study carousel — first build before/after", hook: "Site before: 2017 Wix template, 8-second load. Site after: 14 days, $1,500. Driver applications +30%.", type: "linkedin_post", platform: "linkedin" },
  // Week 3
  { week: 3, day: "Mon", title: "Week 3 carousel — broker carrier-vetting checklist (FMCSA Jan 16 rule)", hook: "Single-day dip below $75K bond = 7-day suspension. Here's the 6-point carrier vetting flow every broker needs by Q3.", type: "linkedin_post", platform: "linkedin" },
  { week: 3, day: "Wed", title: "Week 3 short video — Loom teardown excerpt", hook: "Here's a 60-sec teardown of a 5-truck carrier site. Three fixes that took me 90 minutes.", type: "linkedin_post", platform: "linkedin" },
  { week: 3, day: "Fri", title: "Week 3 contrarian text — 'Stop hiring designers'", hook: "Hiring a designer for your trucking website is the most expensive mistake in logistics tech right now. Here's why.", type: "linkedin_post", platform: "linkedin" },
  { week: 3, day: "Sun", title: "Week 3 case study — broker portal", hook: "I built a carrier-onboarding portal for a 4-agent freight broker in 21 days. Now they onboard 12 carriers per week instead of 2.", type: "linkedin_post", platform: "linkedin" },
  // Week 4
  { week: 4, day: "Mon", title: "Week 4 carousel — '12 things every trucking site should have'", hook: "After building 800+ logistics sites, here are 12 things the best 1% all have. Save this carousel.", type: "linkedin_post", platform: "linkedin" },
  { week: 4, day: "Wed", title: "Week 4 short video — TikTok crossover (founder selfie)", hook: "Your trucking website is 7 years old. Here's what changes when you rebuild it in 14 days.", type: "linkedin_post", platform: "linkedin" },
  { week: 4, day: "Fri", title: "Week 4 contrarian text — 'Stop chasing PODs at 9pm'", hook: "If you're chasing PODs at 9pm, your dispatch board is broken. Not your drivers. The board.", type: "linkedin_post", platform: "linkedin" },
  { week: 4, day: "Sun", title: "Week 4 case study — full ops stack", hook: "$7,500 Ops Stack — 30 days to launch. Custom dispatch dashboard + driver app + broker portal. Here's exactly what I built.", type: "linkedin_post", platform: "linkedin" },
];

const LOOM_TEARDOWNS = [
  { week: 2, title: "Teardown #1 — Moving company site", hook: "I broke down this moving company's site in 4 minutes. Here's what's costing them leads.", platform: "linkedin" },
  { week: 3, title: "Teardown #2 — Small freight broker site", hook: "This 4-agent broker is leaking carriers because of one missing form field.", platform: "linkedin" },
  { week: 4, title: "Teardown #3 — 5-truck carrier site", hook: "Owner-op with 5 trucks. Three site fixes that would 2× his driver-app rate.", platform: "linkedin" },
];

const TIKTOK_POSTS = [
  { week: 4, title: "TikTok #1 — Founder selfie 18s", hook: "Your trucking website is costing you 2 loads a week. Here's why.", platform: "tiktok" },
];

const CASE_STUDIES = [
  { week: 3, title: "Case Study #1 — Best past project (800 words + before/after)", hook: "Carrier doubled driver applications in 30 days with one site rebuild.", platform: "landing_page" },
];

export async function seedContent(db: PrismaClient) {
  for (const p of POST_PLAN) {
    await db.contentItem.create({
      data: {
        type: p.type,
        platform: p.platform,
        title: p.title,
        hookText: p.hook,
        dayOfWeek: p.day,
        weekNumber: p.week,
        monthNumber: 1,
        status: "idea",
      },
    });
  }
  for (const t of LOOM_TEARDOWNS) {
    await db.contentItem.create({
      data: {
        type: "loom_teardown",
        platform: t.platform,
        title: t.title,
        hookText: t.hook,
        weekNumber: t.week,
        monthNumber: 1,
        status: "idea",
      },
    });
  }
  for (const k of TIKTOK_POSTS) {
    await db.contentItem.create({
      data: {
        type: "tiktok",
        platform: k.platform,
        title: k.title,
        hookText: k.hook,
        weekNumber: k.week,
        monthNumber: 1,
        status: "idea",
      },
    });
  }
  for (const c of CASE_STUDIES) {
    await db.contentItem.create({
      data: {
        type: "case_study",
        platform: c.platform,
        title: c.title,
        hookText: c.hook,
        weekNumber: c.week,
        monthNumber: 1,
        status: "idea",
      },
    });
  }
  console.log(`  ✓ Seeded ${POST_PLAN.length + LOOM_TEARDOWNS.length + TIKTOK_POSTS.length + CASE_STUDIES.length} content items`);
}
