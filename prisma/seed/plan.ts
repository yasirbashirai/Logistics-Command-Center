import type { PrismaClient } from "@prisma/client";

// Days 1-30, each with the day's specific tasks (not the daily-cadence recurring tasks
// which live in seed/recurring.ts). Hours/deliverables sourced from PLAN.md §13.

type TaskSeed = {
  title: string;
  description?: string;
  category: string; // setup | outreach | build | content | admin | review
  hoursEstimated: number;
  deliverable?: string;
  pointsValue?: number;
  priority?: string;
  scriptRef?: string;
  toolsNeeded?: string;
};

type DaySeed = {
  dayNumber: number;
  weekNumber: number;
  weekday: string;
  label: string;
  focusArea: string;
  hoursEstimated: number;
  weeklyTheme?: string;
  tasks: TaskSeed[];
};

const W1 = "Week 1 — Foundation";
const W2 = "Week 2 — Outbound On";
const W3 = "Week 3 — Conversations + Proof";
const W4 = "Week 4 — Paid Traffic On";

export const planDays: DaySeed[] = [
  // ───────── WEEK 1 ─────────
  {
    dayNumber: 1, weekNumber: 1, weekday: "Sun", weeklyTheme: W1,
    label: "Tools day — buy stack, register domains, start warmup",
    focusArea: "setup", hoursEstimated: 4,
    tasks: [
      { title: "Buy all 15 tools in the M1 stack (~$264/mo)", description: "Framer, GHL, Smartlead, OpenPhone, Runway, HeyGen, Submagic, Midjourney, ElevenLabs, Canva Pro, n8n VPS, Chatbase, Loom, Notion, Fathom", category: "setup", hoursEstimated: 1.5, deliverable: "All tools active and logged in", pointsValue: 30, priority: "high", toolsNeeded: "all" },
      { title: "Register 3 lookalike sending domains", description: "getyasir.com, yasir-agency.co, yasirhq.com via Cloudflare", category: "setup", hoursEstimated: 0.5, deliverable: "3 domains registered + DNS in Cloudflare", pointsValue: 15, toolsNeeded: "Cloudflare" },
      { title: "Start Smartlead warmup on 8 mailboxes (3 across domains)", description: "Begin 14-21 day warmup BEFORE any cold sending", category: "setup", hoursEstimated: 1, deliverable: "8 mailboxes warming", pointsValue: 20, priority: "high", toolsNeeded: "Smartlead" },
      { title: "Connect Stripe to GHL", description: "Standard account, ready for invoicing", category: "setup", hoursEstimated: 0.5, deliverable: "Stripe connected", pointsValue: 10, toolsNeeded: "Stripe, GHL" },
      { title: "OpenPhone provisioned with US number", description: "Yasir's US sales line (calls + SMS)", category: "setup", hoursEstimated: 0.5, deliverable: "US phone number live", pointsValue: 10, toolsNeeded: "OpenPhone" },
    ],
  },
  {
    dayNumber: 2, weekNumber: 1, weekday: "Mon", weeklyTheme: W1,
    label: "Email auth + ad accounts + Notion workspace",
    focusArea: "setup", hoursEstimated: 4,
    tasks: [
      { title: "Configure SPF / DKIM / DMARC on all 3 domains", description: "Google/Yahoo Nov 2025 rules enforced — DMARC p=quarantine minimum", category: "setup", hoursEstimated: 1.5, deliverable: "All 3 domains pass MXToolbox", pointsValue: 25, priority: "high", toolsNeeded: "Cloudflare, Smartlead" },
      { title: "Verify Meta Business Manager", description: "NTN + CNIC + domain verification", category: "setup", hoursEstimated: 1, deliverable: "Meta BM verified", pointsValue: 15, toolsNeeded: "Meta Business Manager" },
      { title: "Verify TikTok Business Center", description: "Brand + ad account ready", category: "setup", hoursEstimated: 0.5, deliverable: "TikTok BC verified", pointsValue: 10, toolsNeeded: "TikTok Business Center" },
      { title: "Build Notion workspace", description: "4 dbs: Prospects, Audit Loom Queue, Content Calendar, SOPs", category: "setup", hoursEstimated: 1, deliverable: "Notion live + populated", pointsValue: 15, toolsNeeded: "Notion" },
    ],
  },
  {
    dayNumber: 3, weekNumber: 1, weekday: "Tue", weeklyTheme: W1,
    label: "Build the GHL machine — pipeline + 7 automations + scheduler",
    focusArea: "setup", hoursEstimated: 5,
    tasks: [
      { title: "Build 8-stage GHL pipeline", description: "New Lead → Audit Sent → Discovery Booked → Discovery Completed → Proposal Sent → Won → Lost → Nurture", category: "setup", hoursEstimated: 1.5, deliverable: "Pipeline live", pointsValue: 25, priority: "high", toolsNeeded: "GHL" },
      { title: "Build 7 core GHL automations", description: "1. Welcome on form submit. 2. Audit delivery. 3. Booking confirm. 4. No-show reactivation. 5. Post-call follow-up. 6. Onboarding on Won. 7. Stale-lead revival (14d)", category: "setup", hoursEstimated: 1.5, deliverable: "7 automations live + tested", pointsValue: 30, priority: "high", toolsNeeded: "GHL" },
      { title: "Set up scheduler at cal.yasirbashir.com/audit", description: "15-min discovery slots; 3 questions on form (company website, role, bottleneck)", category: "setup", hoursEstimated: 0.5, deliverable: "Scheduler live", pointsValue: 10, toolsNeeded: "GHL" },
      { title: "Pre-build 10 email templates in GHL", description: "Welcome, audit delivery, no-show, proposal, follow-up, onboarding, retainer pitch, kickoff, testimonial ask, quarterly value drop", category: "setup", hoursEstimated: 1, deliverable: "10 templates in GHL", pointsValue: 15, toolsNeeded: "GHL" },
      { title: "End-to-end funnel test with 1 fake lead", description: "Form submit → welcome → audit task → booking → reminders all fire correctly", category: "setup", hoursEstimated: 0.5, deliverable: "Funnel tested end-to-end", pointsValue: 15, priority: "high", toolsNeeded: "GHL" },
    ],
  },
  {
    dayNumber: 4, weekNumber: 1, weekday: "Wed", weeklyTheme: W1,
    label: "Landing page hero + first 4 sections; LinkedIn profile rewrite",
    focusArea: "build", hoursEstimated: 6,
    tasks: [
      { title: "Build Framer landing page: Hero + Pain Strip + Solution + Industries Grid", description: "Sections 1–4 of 14 on yasirbashir.com", category: "build", hoursEstimated: 3, deliverable: "LP sections 1–4 live", pointsValue: 25, priority: "high", scriptRef: "lp-hero-copy", toolsNeeded: "Framer" },
      { title: "Rewrite LinkedIn profile", description: "Headline + banner + about + featured (3 case studies + audit CTA)", category: "build", hoursEstimated: 1.5, deliverable: "LinkedIn profile updated", pointsValue: 20, scriptRef: "linkedin-profile-rewrite" },
      { title: "Build LP sections 5–6: Services Grid + Proof Block", category: "build", hoursEstimated: 1.5, deliverable: "LP sections 5–6 live", pointsValue: 15, toolsNeeded: "Framer" },
    ],
  },
  {
    dayNumber: 5, weekNumber: 1, weekday: "Thu", weeklyTheme: W1,
    label: "Past-client list pull + segment; LP sections 7-8",
    focusArea: "outreach", hoursEstimated: 5,
    tasks: [
      { title: "Export past clients from 4 Fiverr + 2 Upwork accounts", description: "Pull all-time buyers, ~800 raw contacts", category: "outreach", hoursEstimated: 1.5, deliverable: "Raw export saved", pointsValue: 20, priority: "high" },
      { title: "Filter & clean to ~100–300 US logistics + 4★+ list", description: "Drop non-US, non-logistics, ≤3★", category: "outreach", hoursEstimated: 1.5, deliverable: "Clean list saved to Past Clients module", pointsValue: 20, priority: "high" },
      { title: "Segment list A (repeat 5★) / B (single 5★) / C (≤4★, skip)", category: "outreach", hoursEstimated: 1, deliverable: "Segments tagged", pointsValue: 15 },
      { title: "Build LP sections 7–8: Process + Why-Us Differentiators", category: "build", hoursEstimated: 1, deliverable: "LP sections 7–8 live", pointsValue: 10, toolsNeeded: "Framer" },
    ],
  },
  {
    dayNumber: 6, weekNumber: 1, weekday: "Fri", weeklyTheme: W1,
    label: "First 30 past-client emails sent; LP sections 9-14",
    focusArea: "outreach", hoursEstimated: 5,
    tasks: [
      { title: "Send 30 personalized past-client emails", description: "60–90 sec each = ~30/hr. Use re-engagement template, customize per client.", category: "outreach", hoursEstimated: 1.5, deliverable: "30 emails sent", pointsValue: 30, priority: "high", scriptRef: "past-client-reengagement" },
      { title: "Build LP sections 9–14: Pricing + Guarantee + Founder + FAQ + CTA + Exit Popup", category: "build", hoursEstimated: 3.5, deliverable: "LP V1 95% complete (all 14 sections)", pointsValue: 25, toolsNeeded: "Framer" },
    ],
  },
  {
    dayNumber: 7, weekNumber: 1, weekday: "Sat", weeklyTheme: W1,
    label: "60 past-client emails total; funnel end-to-end test; hero video",
    focusArea: "outreach", hoursEstimated: 5,
    tasks: [
      { title: "Send 30 more past-client emails (target 60 total)", category: "outreach", hoursEstimated: 1.5, deliverable: "60 emails sent week-to-date", pointsValue: 30, priority: "high", scriptRef: "past-client-reengagement" },
      { title: "Run full LP → form → GHL → audit-task → calendar test", category: "review", hoursEstimated: 0.5, deliverable: "Funnel works end-to-end", pointsValue: 15 },
      { title: "Record explainer video for hero section", description: "30-sec founder explainer; render via Runway or HeyGen avatar fallback", category: "content", hoursEstimated: 2, deliverable: "Hero video embedded", pointsValue: 20, toolsNeeded: "Runway, HeyGen" },
      { title: "Catch up replies + Week 1 review", category: "review", hoursEstimated: 1, deliverable: "Inbox zero + W1 KPI snapshot", pointsValue: 15 },
    ],
  },
  // ───────── WEEK 2 ─────────
  {
    dayNumber: 8, weekNumber: 2, weekday: "Sun", weeklyTheme: W2,
    label: "Final past-client batch (100 total) + FMCSA list build (1,000+ ready)",
    focusArea: "outreach", hoursEstimated: 5,
    tasks: [
      { title: "Send final 40 past-client emails (target 100 total A+B tier)", category: "outreach", hoursEstimated: 2, deliverable: "100 past-client emails sent", pointsValue: 40, priority: "high", scriptRef: "past-client-reengagement" },
      { title: "Source FMCSA SAFER bulk list (2–50 truck filter)", description: "Free CSV download from SAFER", category: "outreach", hoursEstimated: 1, deliverable: "Raw FMCSA list", pointsValue: 15 },
      { title: "Enrich list via Apollo (email + LinkedIn URL)", category: "outreach", hoursEstimated: 1.5, deliverable: "1,000+ verified emails ready to send", pointsValue: 25, priority: "high", toolsNeeded: "Apollo" },
      { title: "Load enriched contacts into Smartlead Sequence A (carrier)", category: "outreach", hoursEstimated: 0.5, deliverable: "Sequence A staged", pointsValue: 10, toolsNeeded: "Smartlead" },
    ],
  },
  {
    dayNumber: 9, weekNumber: 2, weekday: "Mon", weeklyTheme: W2,
    label: "Outbound machine ON — LinkedIn + cold calls + first post",
    focusArea: "outreach", hoursEstimated: 4,
    tasks: [
      { title: "Send 20 LinkedIn connection requests (carriers + brokers)", category: "outreach", hoursEstimated: 0.5, deliverable: "20 connects", pointsValue: 15, scriptRef: "linkedin-connection-carrier" },
      { title: "Comment thoughtfully on 5 creator posts (carriers/freight)", category: "outreach", hoursEstimated: 0.5, deliverable: "5 comments", pointsValue: 10 },
      { title: "50 cold dials (FMCSA mobile numbers)", description: "30-sec opener; book audit Looms", category: "outreach", hoursEstimated: 1.5, deliverable: "50 dials logged", pointsValue: 25, priority: "high", scriptRef: "cold-call-30-second-opener", toolsNeeded: "OpenPhone" },
      { title: "Publish LinkedIn Post #1 (Monday carousel: 5 broken things)", category: "content", hoursEstimated: 1, deliverable: "Post #1 published", pointsValue: 20 },
      { title: "Daily review + log KPIs", category: "review", hoursEstimated: 0.5, pointsValue: 5 },
    ],
  },
  {
    dayNumber: 10, weekNumber: 2, weekday: "Tue", weeklyTheme: W2,
    label: "Smartlead Sequence A goes live — 400 emails fire today",
    focusArea: "outreach", hoursEstimated: 4,
    tasks: [
      { title: "Launch Smartlead Sequence A (carrier) — 400 sends across 8 mailboxes", category: "outreach", hoursEstimated: 0.5, deliverable: "400 cold emails sent", pointsValue: 40, priority: "high", scriptRef: "cold-email-seq-a-carrier", toolsNeeded: "Smartlead" },
      { title: "DM 5 newly-accepted LinkedIn connections", category: "outreach", hoursEstimated: 0.5, deliverable: "5 DMs", pointsValue: 10, scriptRef: "linkedin-dm-day1" },
      { title: "20 LinkedIn connects + 5 creator comments + 50 dials", category: "outreach", hoursEstimated: 2.5, deliverable: "Daily cadence met", pointsValue: 30 },
      { title: "Daily review", category: "review", hoursEstimated: 0.5, pointsValue: 5 },
    ],
  },
  {
    dayNumber: 11, weekNumber: 2, weekday: "Wed", weeklyTheme: W2,
    label: "Record Week-1 Loom teardown; Post #2",
    focusArea: "content", hoursEstimated: 5,
    tasks: [
      { title: "Full daily cadence (400 emails, 50 dials, 20 connects, 5 DMs)", category: "outreach", hoursEstimated: 3, deliverable: "Cadence met", pointsValue: 40 },
      { title: "Record 4-min Loom teardown (moving company)", description: "Real broken site, point out 3 fixes, end-card CTA", category: "content", hoursEstimated: 1, deliverable: "Teardown #1 recorded", pointsValue: 25, scriptRef: "loom-teardown-script", toolsNeeded: "Loom" },
      { title: "Publish LinkedIn Post #2 (text + image)", category: "content", hoursEstimated: 0.5, deliverable: "Post #2 live", pointsValue: 15 },
      { title: "Daily review", category: "review", hoursEstimated: 0.5, pointsValue: 5 },
    ],
  },
  {
    dayNumber: 12, weekNumber: 2, weekday: "Thu", weeklyTheme: W2,
    label: "A-tier past-client Looms — 10 custom audits",
    focusArea: "outreach", hoursEstimated: 5,
    tasks: [
      { title: "Record 10 custom A-tier Loom audits (60–90 sec each)", description: "One specific improvement per client. Send with personalized email.", category: "outreach", hoursEstimated: 3, deliverable: "10 A-tier Looms sent", pointsValue: 50, priority: "high", scriptRef: "loom-audit-opening", toolsNeeded: "Loom" },
      { title: "Continue daily cadence", category: "outreach", hoursEstimated: 1.5, pointsValue: 30 },
      { title: "Daily review", category: "review", hoursEstimated: 0.5, pointsValue: 5 },
    ],
  },
  {
    dayNumber: 13, weekNumber: 2, weekday: "Fri", weeklyTheme: W2,
    label: "Weekly KPI review + Loom teardown #1 publishes + partnership outreach",
    focusArea: "review", hoursEstimated: 3,
    tasks: [
      { title: "Weekly KPI review (emails / replies / dials / connects / calls)", description: "Compare to W1 targets. Adjust next week's allocations.", category: "review", hoursEstimated: 0.5, deliverable: "W1 KPI snapshot saved", pointsValue: 20, priority: "high" },
      { title: "Publish Teardown #1 on LinkedIn + Facebook groups (3 logistics groups)", category: "content", hoursEstimated: 1, deliverable: "Teardown #1 live", pointsValue: 25 },
      { title: "Send 5 partnership outreach emails (factors / insurance reps)", category: "outreach", hoursEstimated: 1, deliverable: "5 partnership emails sent", pointsValue: 15 },
      { title: "Daily review", category: "review", hoursEstimated: 0.5, pointsValue: 5 },
    ],
  },
  {
    dayNumber: 14, weekNumber: 2, weekday: "Sat", weeklyTheme: W2,
    label: "Catch-up + directory profiles (Clutch + DesignRush)",
    focusArea: "admin", hoursEstimated: 3,
    tasks: [
      { title: "Submit Clutch profile", category: "admin", hoursEstimated: 1, deliverable: "Clutch profile submitted", pointsValue: 15 },
      { title: "Submit DesignRush profile", category: "admin", hoursEstimated: 1, deliverable: "DesignRush profile submitted", pointsValue: 15 },
      { title: "Reply to every inbox message — inbox zero", category: "admin", hoursEstimated: 1, deliverable: "All replies sent", pointsValue: 10 },
    ],
  },
  // ───────── WEEK 3 ─────────
  {
    dayNumber: 15, weekNumber: 3, weekday: "Sun", weeklyTheme: W3,
    label: "5 more A-tier Looms; light admin",
    focusArea: "outreach", hoursEstimated: 3,
    tasks: [
      { title: "Record 5 more A-tier Loom follow-ups", category: "outreach", hoursEstimated: 1.5, deliverable: "5 more Looms sent", pointsValue: 30, scriptRef: "loom-audit-opening", toolsNeeded: "Loom" },
      { title: "Light daily cadence (smaller volume Sunday)", category: "outreach", hoursEstimated: 1, pointsValue: 15 },
      { title: "Week 3 prep", category: "admin", hoursEstimated: 0.5, pointsValue: 5 },
    ],
  },
  {
    dayNumber: 16, weekNumber: 3, weekday: "Mon", weeklyTheme: W3,
    label: "Daily cadence + Post #3 (short video)",
    focusArea: "outreach", hoursEstimated: 4,
    tasks: [
      { title: "Full daily cadence (400 emails, 50 dials, 20 connects, 5 DMs, 5 comments)", category: "outreach", hoursEstimated: 3, pointsValue: 40 },
      { title: "Publish LinkedIn Post #3 (short video, 60–90 sec, one tactical tip)", category: "content", hoursEstimated: 1, deliverable: "Post #3 live", pointsValue: 20, toolsNeeded: "Submagic" },
    ],
  },
  {
    dayNumber: 17, weekNumber: 3, weekday: "Tue", weeklyTheme: W3,
    label: "First discovery calls land — 2-3 scheduled. Record Teardown #2.",
    focusArea: "outreach", hoursEstimated: 4,
    tasks: [
      { title: "Hold first 2–3 discovery calls", description: "Use 15-min script. Record via Fathom. Move to Proposal stage if qualified.", category: "outreach", hoursEstimated: 1, deliverable: "2–3 calls completed", pointsValue: 50, priority: "high", scriptRef: "discovery-call-script", toolsNeeded: "OpenPhone, Fathom, GHL" },
      { title: "Record Teardown #2 (small freight broker)", category: "content", hoursEstimated: 1, deliverable: "Teardown #2 recorded", pointsValue: 25, toolsNeeded: "Loom" },
      { title: "Daily cadence (compressed)", category: "outreach", hoursEstimated: 2, pointsValue: 25 },
    ],
  },
  {
    dayNumber: 18, weekNumber: 3, weekday: "Wed", weeklyTheme: W3,
    label: "Request testimonial video from existing client",
    focusArea: "content", hoursEstimated: 4,
    tasks: [
      { title: "Call best existing client → request 60-sec testimonial in exchange for free hosting month", category: "content", hoursEstimated: 0.5, deliverable: "Testimonial commitment", pointsValue: 20 },
      { title: "Record + edit testimonial video, embed in LP", category: "content", hoursEstimated: 1.5, deliverable: "Testimonial live on LP", pointsValue: 25, toolsNeeded: "Loom, Framer" },
      { title: "Daily cadence", category: "outreach", hoursEstimated: 2, pointsValue: 25 },
    ],
  },
  {
    dayNumber: 19, weekNumber: 3, weekday: "Thu", weeklyTheme: W3,
    label: "Case Study #1 written + published",
    focusArea: "content", hoursEstimated: 4,
    tasks: [
      { title: "Write case study #1 — best past project (800 words + before/after screenshots)", category: "content", hoursEstimated: 2, deliverable: "Case study #1 drafted", pointsValue: 30 },
      { title: "Add case study to LP + LinkedIn featured", category: "content", hoursEstimated: 0.5, deliverable: "Case study live", pointsValue: 15 },
      { title: "Daily cadence", category: "outreach", hoursEstimated: 1.5, pointsValue: 25 },
    ],
  },
  {
    dayNumber: 20, weekNumber: 3, weekday: "Fri", weeklyTheme: W3,
    label: "Weekly KPI review + Teardown #2 publish + partnerships",
    focusArea: "review", hoursEstimated: 3,
    tasks: [
      { title: "Weekly KPI review", description: "Check 6 health-check ratios. Reply rate ≥5%? Show rate ≥70%? Adjust.", category: "review", hoursEstimated: 0.5, deliverable: "W2 KPI snapshot saved", pointsValue: 20, priority: "high" },
      { title: "Publish Teardown #2 on LinkedIn + FB groups", category: "content", hoursEstimated: 1, pointsValue: 25 },
      { title: "Send 5 more partnership outreach emails", category: "outreach", hoursEstimated: 1, pointsValue: 15 },
      { title: "Daily review", category: "review", hoursEstimated: 0.5, pointsValue: 5 },
    ],
  },
  {
    dayNumber: 21, weekNumber: 3, weekday: "Sat", weeklyTheme: W3,
    label: "First proposals sent — 1-2 from Week 2 calls",
    focusArea: "outreach", hoursEstimated: 2,
    tasks: [
      { title: "Send 1–2 proposals (use GHL proposal template, 3 tiers)", category: "outreach", hoursEstimated: 1, deliverable: "Proposals sent", pointsValue: 40, priority: "high", toolsNeeded: "GHL" },
      { title: "Document objections heard + refine pitch wording", category: "review", hoursEstimated: 1, deliverable: "Pitch v2 notes", pointsValue: 15 },
    ],
  },
  // ───────── WEEK 4 ─────────
  {
    dayNumber: 22, weekNumber: 4, weekday: "Sun", weeklyTheme: W4,
    label: "Build 3 ad creatives (founder selfie 18s, screen-record 22s, static)",
    focusArea: "content", hoursEstimated: 4,
    tasks: [
      { title: "Record AD 1: founder selfie 18-sec video", description: "Hook + body + CTA per ad script", category: "content", hoursEstimated: 1, deliverable: "AD 1 ready", pointsValue: 20, scriptRef: "ad-1-founder-selfie" },
      { title: "Record AD 2: 22-sec screen-record of dispatch portal", category: "content", hoursEstimated: 1, deliverable: "AD 2 ready", pointsValue: 20, scriptRef: "ad-2-screen-record" },
      { title: "Design AD 3: static stat image", category: "content", hoursEstimated: 1, deliverable: "AD 3 ready", pointsValue: 15, scriptRef: "ad-3-static-image", toolsNeeded: "Canva Pro, Midjourney" },
      { title: "Burn-in captions via Submagic on AD 1 + AD 2", category: "content", hoursEstimated: 1, deliverable: "Captions baked", pointsValue: 10, toolsNeeded: "Submagic" },
    ],
  },
  {
    dayNumber: 23, weekNumber: 4, weekday: "Mon", weeklyTheme: W4,
    label: "Launch Meta ads $20/day ABO; Post #4 (contrarian)",
    focusArea: "outreach", hoursEstimated: 4,
    tasks: [
      { title: "Launch Meta ads — $20/day ABO across 3 creatives", description: "Lead form $5/day + CTWA $3/day + retargeting $1/day + TikTok Spark $1/day", category: "outreach", hoursEstimated: 1.5, deliverable: "Meta ads live", pointsValue: 35, priority: "high", toolsNeeded: "Meta Business Manager" },
      { title: "Publish LinkedIn Post #4 (text-only contrarian take)", category: "content", hoursEstimated: 0.5, deliverable: "Post #4 live", pointsValue: 15 },
      { title: "Daily cadence", category: "outreach", hoursEstimated: 2, pointsValue: 30 },
    ],
  },
  {
    dayNumber: 24, weekNumber: 4, weekday: "Tue", weeklyTheme: W4,
    label: "First TikTok organic post; daily cadence",
    focusArea: "content", hoursEstimated: 3,
    tasks: [
      { title: "Publish first TikTok organic post (founder selfie 15-30s)", category: "content", hoursEstimated: 1, deliverable: "TikTok post #1 live", pointsValue: 20, toolsNeeded: "Submagic, TikTok Business Center" },
      { title: "Daily cadence (compressed)", category: "outreach", hoursEstimated: 2, pointsValue: 25 },
    ],
  },
  {
    dayNumber: 25, weekNumber: 4, weekday: "Wed", weeklyTheme: W4,
    label: "Teardown #3; review ads Day 3 — pause underperformers",
    focusArea: "review", hoursEstimated: 4,
    tasks: [
      { title: "Record Teardown #3 (5-truck carrier)", category: "content", hoursEstimated: 1, deliverable: "Teardown #3 recorded", pointsValue: 25, toolsNeeded: "Loom" },
      { title: "Review ad Day-3 metrics; pause creatives with CTR <0.5% or CPL >3x target", category: "review", hoursEstimated: 0.5, deliverable: "Ad audit logged", pointsValue: 20, priority: "high", toolsNeeded: "Meta Business Manager" },
      { title: "Publish Teardown #3 on LinkedIn + FB groups", category: "content", hoursEstimated: 0.5, pointsValue: 15 },
      { title: "Daily cadence", category: "outreach", hoursEstimated: 2, pointsValue: 25 },
    ],
  },
  {
    dayNumber: 26, weekNumber: 4, weekday: "Thu", weeklyTheme: W4,
    label: "Refresh ad creative if needed; draft quarterly value-drop email",
    focusArea: "build", hoursEstimated: 3,
    tasks: [
      { title: "Refresh ad creative (Day-5 rule) if CPL still high", category: "build", hoursEstimated: 1, deliverable: "Replacement creative live OR no-change confirmed", pointsValue: 15 },
      { title: "Draft quarterly value-drop email (1 paragraph + offer)", description: "Will send Day 90 to ALL contacts (past clients + replies + connects)", category: "content", hoursEstimated: 0.5, deliverable: "Draft saved", pointsValue: 10 },
      { title: "Daily cadence", category: "outreach", hoursEstimated: 1.5, pointsValue: 25 },
    ],
  },
  {
    dayNumber: 27, weekNumber: 4, weekday: "Fri", weeklyTheme: W4,
    label: "Weekly KPI review + lock Month 2 plan",
    focusArea: "review", hoursEstimated: 3,
    tasks: [
      { title: "Weekly KPI review (full)", description: "All 6 health checks. North-star: booked calls/week.", category: "review", hoursEstimated: 0.5, deliverable: "W3 KPI snapshot saved", pointsValue: 20, priority: "high" },
      { title: "Write Month 2 plan", description: "What worked, what to kill, $600/mo budget allocation, scale winners 20%/48h", category: "review", hoursEstimated: 2, deliverable: "M2 plan locked", pointsValue: 35, priority: "high" },
      { title: "Daily review", category: "review", hoursEstimated: 0.5, pointsValue: 5 },
    ],
  },
  {
    dayNumber: 28, weekNumber: 4, weekday: "Sat", weeklyTheme: W4,
    label: "Inbox zero — reply to ALL Week 4 replies + bookings",
    focusArea: "admin", hoursEstimated: 2,
    tasks: [
      { title: "Reply to every email + LinkedIn DM + CTWA message", category: "admin", hoursEstimated: 1.5, deliverable: "Inbox zero", pointsValue: 25 },
      { title: "Update pipeline stages for every active lead", category: "admin", hoursEstimated: 0.5, deliverable: "Pipeline current", pointsValue: 10 },
    ],
  },
  {
    dayNumber: 29, weekNumber: 4, weekday: "Mon", weeklyTheme: W4,
    label: "Month 1 retainer pitches sent to W2-3 delivered clients",
    focusArea: "outreach", hoursEstimated: 3,
    tasks: [
      { title: "Send retainer pitch to every W2-3 delivered client (Care/Growth/Scale tiers)", description: "Use GHL retainer-pitch template + pricing sheet", category: "outreach", hoursEstimated: 2, deliverable: "Retainer pitches sent", pointsValue: 40, priority: "high", toolsNeeded: "GHL" },
      { title: "Daily cadence (light)", category: "outreach", hoursEstimated: 1, pointsValue: 15 },
    ],
  },
  {
    dayNumber: 30, weekNumber: 4, weekday: "Tue", weeklyTheme: W4,
    label: "MONTH 1 CLOSE-OUT — full KPI dashboard + M2 plan finalized",
    focusArea: "review", hoursEstimated: 4,
    tasks: [
      { title: "Compile full Month 1 KPI dashboard", description: "Total emails, dials, connects, calls booked, calls held, proposals, closes, MRR, total cash", category: "review", hoursEstimated: 1.5, deliverable: "M1 dashboard saved", pointsValue: 40, priority: "high" },
      { title: "Identify what to scale (winners) + what to cut (losers)", category: "review", hoursEstimated: 1, deliverable: "Scale/Cut decisions logged", pointsValue: 25 },
      { title: "Finalize Month 2 plan (locked, ready to execute Day 31)", category: "review", hoursEstimated: 1, deliverable: "M2 plan finalized", pointsValue: 30, priority: "high" },
      { title: "Celebrate. You shipped 30 days of war machine.", category: "review", hoursEstimated: 0.5, pointsValue: 10 },
    ],
  },
];

export async function seedDays(db: PrismaClient) {
  for (const d of planDays) {
    const day = await db.day.create({
      data: {
        dayNumber: d.dayNumber,
        weekNumber: d.weekNumber,
        weekday: d.weekday,
        label: d.label,
        focusArea: d.focusArea,
        hoursEstimated: d.hoursEstimated,
        weeklyTheme: d.weeklyTheme,
      },
    });
    let order = 0;
    for (const t of d.tasks) {
      await db.dailyTask.create({
        data: {
          dayId: day.id,
          title: t.title,
          description: t.description,
          category: t.category,
          hoursEstimated: t.hoursEstimated,
          deliverable: t.deliverable,
          pointsValue: t.pointsValue ?? 10,
          priority: t.priority ?? "normal",
          scriptRef: t.scriptRef,
          toolsNeeded: t.toolsNeeded,
          sortOrder: order++,
        },
      });
    }
  }
  console.log(`  ✓ Seeded ${planDays.length} days with ${planDays.reduce((s, d) => s + d.tasks.length, 0)} tasks`);
}
