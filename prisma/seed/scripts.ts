import type { PrismaClient } from "@prisma/client";

// 25+ paste-ready scripts from PLAN §5, §6, §7, §8, §9, §12, §2.3
// Variables in {curly_braces} are personalisation tokens

export const scripts = [
  // ─── Past-client re-engagement (Week 1 priority) ───
  {
    key: "past-client-reengagement",
    title: "Past-client re-engagement email (Week 1 priority #1)",
    category: "email",
    persona: "general",
    funnelStage: "warm_outreach",
    subject: "Quick update from Yasir — and a 30-sec ask",
    body: `Hey {first_name},

Yasir here. We worked together on {project_short_description} back in {year}. Hope {company} has been doing well.

Two reasons I'm writing:

1. I'm building a direct agency now, just for US trucking/freight/logistics businesses. Full website + dispatch portal + driver recruiting flow — the works. If anything on your end has broken, needs a refresh, or you've outgrown the original build, just hit reply.

2. The 30-sec ask: if you know any other carrier/broker/mover running an outdated website, I'm offering past clients $500 credit (or cash) for any referral that signs. Just forward this email or hit reply with their name.

Either way — thank you for trusting me on the original build. None of this exists without clients like you.

— Yasir`,
    variables: "first_name, project_short_description, year, company",
    notes: "Use Day 6-8. A+B tier only. Expected 15% reply, 30% to call, 40-50% close.",
    dayAppliedFrom: 6,
    sortOrder: 1,
  },

  // ─── Cold email Sequence A: Carrier ───
  {
    key: "cold-email-seq-a-carrier",
    title: "Cold Email A1 (Carrier) — Day 0",
    category: "email",
    persona: "carrier",
    funnelStage: "cold_outreach",
    subject: "Your DOT {usdot} site",
    body: `Hi {first_name},

Looked at {company_website} this morning — your DOT {usdot} listing pointed me there.

One thing jumped out: {specific_issue} (took me ~3 sec to find on mobile).

I've built 800+ websites just for US trucking/freight/moving companies. Quick fix for the above would take ~2 hours; I'd happily do it free as an audit so you can see what we'd actually change.

Want me to send a 4-min Loom showing exactly what I'd fix?

— Yasir`,
    variables: "first_name, usdot, company_website, specific_issue",
    notes: "Surface 'AI bros from Pakistan' objection NOT in line 4 here — defer until reply. Line 4 here lists the credential (800+). Personalize specific_issue (60–90 sec): broken CTA, slow load, no mobile, generic Gmail contact, outdated copyright.",
    sortOrder: 2,
  },
  {
    key: "cold-email-seq-a-carrier-2",
    title: "Cold Email A2 (Carrier) — Day 3 bump",
    category: "email",
    persona: "carrier",
    funnelStage: "cold_outreach",
    subject: "re: Your DOT site",
    body: `Hi {first_name},

Bumping this up — I recorded that 4-min Loom anyway showing the {specific_issue} fix plus 2 more I found. No catch.

Want me to send the link?

— Yasir`,
    variables: "first_name, specific_issue",
    sortOrder: 3,
  },
  {
    key: "cold-email-seq-a-carrier-3",
    title: "Cold Email A3 (Carrier) — Day 7 breakup",
    category: "email",
    persona: "carrier",
    funnelStage: "cold_outreach",
    subject: "Last note re: {company}",
    body: `Hi {first_name},

Last one — Loom is here if useful: {loom_url}

If now's not the time, totally get it. Pin this for whenever your site annoys you next.

We do this for ~$1.5K (sprint) up to $7.5K (full ops stack). 800+ logistics builds in 5 years; my entire portfolio is US trucking/freight/moving.

Hope the lanes are good this month.

— Yasir`,
    variables: "first_name, company, loom_url",
    sortOrder: 4,
  },

  // ─── Cold email Sequence B: Broker ───
  {
    key: "cold-email-seq-b-broker",
    title: "Cold Email B1 (Broker) — Day 0",
    category: "email",
    persona: "broker",
    funnelStage: "cold_outreach",
    subject: "{company} carrier portal",
    body: `Hi {first_name},

Saw {company} on FMCSA — MC# {mc_number}, looks like ~{agent_count} agents.

Question: how are you onboarding carriers right now? Most brokers your size hand-enter W-9s + COIs into a spreadsheet. With the Jan 2026 bond enforcement (single-day dip below $75K = 7-day suspension), I've been building carrier vetting + bond monitoring portals — saves 30 min per new carrier and you get a defensible audit log.

I've built 800+ logistics websites — entirely US trucking/freight/moving. Want a 4-min Loom of one I built for a 6-agent shop in Texas?

— Yasir`,
    variables: "first_name, company, mc_number, agent_count",
    notes: "Lead with the FMCSA Jan 16 2026 bond rule — fresh pain. Reference research §8 timed warnings.",
    sortOrder: 5,
  },

  // ─── Cold email Sequence C: Mover ───
  {
    key: "cold-email-seq-c-mover",
    title: "Cold Email C1 (Mover) — Day 0",
    category: "email",
    persona: "mover",
    funnelStage: "cold_outreach",
    subject: "{company} on Google",
    body: `Hi {first_name},

Looked up {company} — you're paying Thumbtack/Yelp $25/lead (and CAC's pushing $250 in your zip).

Most moving companies I work with run a 6-page site + 2-step booking widget + estimator, and stop paying for lead-gen entirely within 90 days. Built 800+ logistics sites — moving companies are the easiest wins.

4-min Loom of a moving co I built? No catch.

— Yasir`,
    variables: "first_name, company",
    notes: "Translates research finding: Thumbtack/Yelp CAC $208–$250 is the mover's #1 pain.",
    sortOrder: 6,
  },

  // ─── LinkedIn ───
  {
    key: "linkedin-profile-rewrite",
    title: "LinkedIn profile rewrite spec",
    category: "linkedin",
    persona: "general",
    funnelStage: "passive_proof",
    subject: "Headline + Banner + About + Featured spec",
    body: `HEADLINE (220 chars):
US Logistics Websites + Dispatch Portals + AI Booking Stacks | 800+ Builds for Carriers, Brokers, Movers | Free Loom Audit at yasirbashir.com

BANNER:
Single-line: "Logistics Solutions, Engineered Like Software." 7 industry icons. cal.yasirbashir.com/audit URL bottom-right.

ABOUT (2,600 char max — use 1,800):
Paragraph 1: Position — "I build websites + dispatch portals for US logistics companies. Trucking, freight brokerage, moving, dispatching, owner-ops, couriers, car haulers."
Paragraph 2: Moat — "800+ logistics builds in 5 years. My entire portfolio is this niche."
Paragraph 3: The two-camp gap — marketing-fluent agencies don't ship software, software shops don't do marketing. I do both.
Paragraph 4: 3 service tiers ($1.5K / $3.5K / $7.5K) + flagship AI Dispatcher Agent ($9.5K).
Paragraph 5: Free 10-min Loom audit CTA → cal.yasirbashir.com/audit

FEATURED (3 items):
1. Case study #1 (best past project) — link to LP
2. Loom teardown #1 (moving company) — direct Loom link
3. Audit CTA — link to cal.yasirbashir.com/audit`,
    notes: "Day 4 task. Profile is passive proof — must read 'US trucking specialist' in <5 sec.",
    dayAppliedFrom: 4,
    sortOrder: 10,
  },
  {
    key: "linkedin-connection-carrier",
    title: "LinkedIn CR — Carrier",
    category: "linkedin",
    persona: "carrier",
    funnelStage: "cold_outreach",
    body: `Hey {first_name}, saw {company} on FMCSA — {n_trucks} trucks. Build websites + dispatch portals for US carriers; just connecting, no pitch. — Yasir`,
    variables: "first_name, company, n_trucks",
    sortOrder: 11,
  },
  {
    key: "linkedin-connection-broker",
    title: "LinkedIn CR — Broker",
    category: "linkedin",
    persona: "broker",
    funnelStage: "cold_outreach",
    body: `Hi {first_name}, fellow TIA-adjacent — I build carrier portals + shipper-facing sites for small freight brokerages. Connecting, no pitch. — Yasir`,
    variables: "first_name",
    sortOrder: 12,
  },
  {
    key: "linkedin-connection-mover",
    title: "LinkedIn CR — Mover",
    category: "linkedin",
    persona: "mover",
    funnelStage: "cold_outreach",
    body: `Hi {first_name}, came across {company} — I build booking funnels for moving companies (replaces Thumbtack/Yelp lead-gen). Connecting, no pitch. — Yasir`,
    variables: "first_name, company",
    sortOrder: 13,
  },
  {
    key: "linkedin-dm-day1",
    title: "LinkedIn DM 1 — Day 1 (post-accept)",
    category: "linkedin",
    persona: "general",
    funnelStage: "warm_outreach",
    body: `Thanks for connecting {first_name}. Quick context — I work specifically with US {persona_segment} businesses, built 800+ logistics sites in 5 years. Mind if I send you a 60-sec voice note about something I noticed on {company}'s site? Won't pitch.`,
    variables: "first_name, persona_segment, company",
    sortOrder: 14,
  },
  {
    key: "linkedin-dm-day3",
    title: "LinkedIn DM 2 — Day 3 (no-reply bump)",
    category: "linkedin",
    persona: "general",
    funnelStage: "warm_outreach",
    body: `Hey {first_name} — voice note still on offer. Or I can just text the 2-3 things I noticed. Whatever's easier.`,
    variables: "first_name",
    sortOrder: 15,
  },
  {
    key: "linkedin-dm-day7-loom",
    title: "LinkedIn DM 3 — Day 7 (unprompted Loom)",
    category: "linkedin",
    persona: "general",
    funnelStage: "warm_outreach",
    body: `{first_name} — made you the Loom anyway. 4 min, no pitch, here: {loom_url}. If anything in it's useful, you know where to find me.`,
    variables: "first_name, loom_url",
    notes: "Unprompted Loom is the unlock. It's the #1 trust signal — they didn't ask, you delivered.",
    sortOrder: 16,
  },
  {
    key: "linkedin-dm-day14",
    title: "LinkedIn DM 4 — Day 14 soft CTA",
    category: "linkedin",
    persona: "general",
    funnelStage: "warm_outreach",
    body: `Loom hopefully landed. If you ever want a 15-min call to dig into any of it: cal.yasirbashir.com/audit. No follow-up after this — pinging you would be annoying.`,
    notes: "Last touch. After this, move to nurture; quarterly value drop only.",
    sortOrder: 17,
  },

  // ─── Cold call ───
  {
    key: "cold-call-30-second-opener",
    title: "Cold call 30-sec opener",
    category: "call",
    persona: "general",
    funnelStage: "cold_outreach",
    body: `Hi {first_name}, this is Yasir Bashir.

I'm not a load-board salesperson and I'm not selling factoring. I build websites and dispatch portals — only for US trucking, freight, and moving companies. Done 800+ in five years.

I looked at {company}'s site this morning. One thing I'd fix in about two minutes. Worth 90 seconds for me to show you, or do you want me to send a 4-minute Loom instead?

[Pause. Let them answer.]`,
    variables: "first_name, company",
    notes: "ALWAYS announce who you are NOT first (defuses 'AI bros from Pakistan' implicit objection). Then credential. Then specific. Then choice (call vs Loom).",
    sortOrder: 20,
  },

  // ─── Loom audit ───
  {
    key: "loom-audit-opening",
    title: "Loom audit opening (customizable)",
    category: "loom",
    persona: "general",
    funnelStage: "lead_magnet",
    body: `Hey {name} — Yasir here. Got your request through {source}.

Couple things before we dive in:
- I'm in Pakistan, my agency builds for US logistics companies. ~800 sites in 5 years.
- I'm going to look at {company_website} for the next 8 minutes, ignore me if I miss context.
- If anything I say lands wrong, hit reply on the email — happy to redo.

OK, three things stood out:
1. {issue_1}
2. {issue_2}
3. {issue_3}

End card: If you want me to build a fix for any of these (the full Sprint is $1,500, 14 days), book a 15-min discovery at cal.yasirbashir.com/audit. If not — pin this Loom, share it with anyone who's about to spend money on a new site. Thanks {name}.`,
    variables: "name, source, company_website, issue_1, issue_2, issue_3",
    notes: "ALWAYS surface 'Pakistan' early (sentence 3). Three specific issues. End card with explicit price + CTA. <90 sec intro, 8 min audit body.",
    sortOrder: 25,
  },
  {
    key: "loom-teardown-script",
    title: "Weekly Loom teardown (public content)",
    category: "loom",
    persona: "general",
    funnelStage: "passive_proof",
    body: `Title: "I broke down this {persona_segment}'s site in 4 minutes. Here's what's costing them leads."

Structure (4 min total):
0:00-0:15 — Hook ("This {persona_segment} is paying $200/lead on Thumbtack. Here's why their site is the reason.")
0:15-1:00 — Show the site. Pan around. Don't comment yet.
1:00-3:00 — Three specific failures. Be concrete. ("Mobile CTA isn't tappable." "Load app goes to a Gmail address." "Hero copy is 'About Us'.")
3:00-3:30 — Show what good looks like (case study from your portfolio).
3:30-4:00 — End card. "If your site has any of these, free 4-min audit at cal.yasirbashir.com/audit. — Yasir"

DO post to: LinkedIn (native upload as doc + Loom link), 3 Facebook groups (Truckers/Movers/Freight Brokers), Beehiiv newsletter (Month 2+).
DO NOT post to: Reddit (permaban risk per RESEARCH §1).`,
    variables: "persona_segment",
    notes: "1 per week, 12 in 90 days = compounding lead-magnet library. THE moat.",
    sortOrder: 26,
  },

  // ─── Discovery call ───
  {
    key: "discovery-call-script",
    title: "Discovery call — 15-min structured (6 phases)",
    category: "discovery",
    persona: "general",
    funnelStage: "discovery",
    body: `PHASE 1 — Rapport (2 min)
"Thanks for jumping on. Before we dive in — how's your week going? Any fires?" (Genuine. Mirror their energy.)

PHASE 2 — Pain (4 min)
"Tell me what made you book this call. What's broken about your current site/funnel/pipeline?" (Shut up. Let them talk. Take notes — verbatim phrases for your proposal.)
Probe: "What does that cost you per week — hours or dollars?" "What have you tried so far?" "If it stayed broken for 6 months, what happens?"

PHASE 3 — Gap (2 min)
"OK so [restate their pain in their own words]. And ideally — what's the picture if this is fixed?" (Get them to articulate the gap.)

PHASE 4 — Show (3 min)
"Quick — let me show you what we'd actually build." Screen-share. Show ONE relevant case study. Show ONE specific feature that maps to their stated pain.

PHASE 5 — Pricing (2 min)
"We have three tiers — Sprint at $1,500, Pro Stack at $3,500, Premium at $7,500. Based on what you described, I'd recommend [tier]. Here's why: [map to their pain]. Want me to send a proposal today?"

PHASE 6 — Handle (2 min)
Common objections:
- "Too expensive" → "Payback at $X/month is Y weeks. Want me to walk the math?"
- "Need to think" → "Totally. What specifically — price, timing, scope?"
- "Overseas?" → SURFACE IT: "Yes, my team is in Pakistan. Here's three US references + 14-day launch guarantee."
- "We're busy" → "Async demo via Loom + reply on your time."
- "Tried before" → "What broke last time? Let me show you our case study with the same issue."

CLOSE: "Cool — proposal in your inbox in 10 min. Talk in 48 hrs?"`,
    notes: "Day 17+. Record via Fathom for transcript + auto-summary into GHL.",
    sortOrder: 30,
  },

  // ─── Voice DM ───
  {
    key: "voice-dm-template",
    title: "Voice DM template (LinkedIn / WhatsApp)",
    category: "linkedin",
    persona: "general",
    funnelStage: "warm_outreach",
    body: `[Record on phone, 45 sec max]

"Hey {name}, Yasir here — saw {company} on FMCSA / LinkedIn. I run an agency that builds logistics websites exclusively, about 800 of them in five years. Took a quick look at your site — saw one thing I'd fix in maybe two minutes that's probably costing you {specific_outcome}. Want me to record a 4-min Loom showing exactly what I'd change? No pitch, no cost. Reply yes and I'll send tonight. Thanks {name}."`,
    variables: "name, company, specific_outcome",
    notes: "Voice > text DM 3-5× reply rate on LinkedIn. Use mobile LinkedIn app voice note feature.",
    sortOrder: 31,
  },

  // ─── Referral ───
  {
    key: "past-client-referral-ask",
    title: "Past-client referral ask script (90-day check-in)",
    category: "referral",
    persona: "general",
    funnelStage: "retention",
    body: `Hey {name} — quick favor. I'm focusing this quarter on US trucking/freight/moving companies that have outgrown their website.

Anyone you know fit that description?

$500 cash to you if a referral signs (or $500 off their first project — your call).

Just hit reply with a name + intro. No pressure.

— Yasir`,
    variables: "name",
    notes: "Send 90 days after delivery, NOT at project start. Highest yield when after a measurable win ('your driver apps went up 30%').",
    sortOrder: 35,
  },

  // ─── Email signature ───
  {
    key: "email-signature",
    title: "Email signature standard",
    category: "email",
    persona: "general",
    body: `Yasir Bashir
Founder · Logistics Solutions — Engineered Like Software
800+ logistics websites built · 14-day launch guarantee
📍 US: +1-XXX-XXX-XXXX | yasirbashir.com | cal.yasirbashir.com/audit
LinkedIn · Loom audit · Case studies`,
    notes: "Append to every outbound email. Forces re-credentialing + audit CTA on every touch.",
    sortOrder: 40,
  },

  // ─── Ad scripts ───
  {
    key: "ad-1-founder-selfie",
    title: "AD 1 — Founder selfie video (18 sec)",
    category: "ad",
    persona: "general",
    funnelStage: "paid",
    body: `[Selfie, founder talking to camera. Burn-in captions via Submagic.]

0:00-0:03 HOOK: "Your trucking company's website is probably losing you 2 loads a week. Here's why."

0:03-0:13 BODY: "Three things kill freight company sites: (1) load apps go to a Gmail address — broker emails them but never hears back. (2) Mobile CTA isn't tappable — drivers bounce. (3) No way to capture overflow leads when dispatch is busy. I've fixed 800 of these."

0:13-0:18 CTA: "Free 4-min Loom audit at the link — I'll show you exactly what to fix on YOUR site. — Yasir"

Audience: US, M/F 28-58, "owner trucking company" / "freight broker" interests + behaviors. Exclude Big-3 enterprise titles.`,
    notes: "Day 22-23. ABO setup, $20/day. Day-3 pause if CTR <0.5%. Day-5 refresh if CPL >3× target.",
    sortOrder: 50,
  },
  {
    key: "ad-2-screen-record",
    title: "AD 2 — Screen recording dispatch portal (22 sec)",
    category: "ad",
    persona: "general",
    funnelStage: "paid",
    body: `[Screen recording. Voiceover.]

0:00-0:04 HOOK: "This is the dashboard I built for a 12-truck carrier last month. Watch what it does."

0:04-0:18 BODY: [Click through portal] "One — driver app submissions flow into the CRM, auto-tagged. Two — overflow leads route to WhatsApp where you can reply when convenient. Three — broker portal lets your shippers upload BOLs without emailing."

0:18-0:22 CTA: "If your site does none of this, free 4-min Loom audit at the link. — Yasir."`,
    notes: "Show, don't tell. The dispatch portal is the wedge — competitors only do websites.",
    sortOrder: 51,
  },
  {
    key: "ad-3-static-image",
    title: "AD 3 — Static stat image",
    category: "ad",
    persona: "general",
    funnelStage: "paid",
    body: `VISUAL: Split image. LEFT = ugly 2017 trucking site screenshot. RIGHT = clean 2026 site + dispatch portal.

HEADLINE: "Your competitor just launched this. Take a look."

SUBHEAD: "800+ logistics sites built in 5 years. 14-day launch guarantee. Starting at $1,500."

PRIMARY TEXT: "Most carrier websites are stuck in 2017. We rebuild them in 14 days — full site + dispatch portal + driver-app funnel. Free 4-min audit at the link."

CTA BUTTON: "Get free audit"`,
    notes: "Lowest-risk creative. Use as control. Static is cheap to refresh.",
    sortOrder: 52,
  },

  // ─── Landing page hero ───
  {
    key: "lp-hero-copy",
    title: "LP Hero V1 (control)",
    category: "lp",
    persona: "general",
    funnelStage: "landing_page",
    subject: "Logistics Solutions, Engineered Like Software.",
    body: `H1: Logistics Solutions, Engineered Like Software.
H2: Websites + dispatch portals + AI booking stacks. Built only for US trucking, freight, moving, and dispatch companies. 800+ launched in 5 years.

PRIMARY CTA: Book a 15-min audit call →
SECONDARY CTA (subdued, single alt): Or get a free 4-min Loom audit →

TRUST LINE (below CTAs): "Built for carriers · brokers · 3PLs · dispatch · owner-ops · movers · couriers"`,
    notes: "Single primary CTA per RESEARCH §4 (single-CTA = +30%). Secondary is the lead-magnet for non-ready visitors.",
    sortOrder: 60,
  },
];

export async function seedScripts(db: PrismaClient) {
  for (const s of scripts) {
    await db.script.create({ data: s });
  }
  console.log(`  ✓ Seeded ${scripts.length} scripts/templates`);
}
