import type { PrismaClient } from "@prisma/client";

// 6 buyer personas from RESEARCH.md §6 (02-buyer-deep-dive.md).
// Plus shared objection handlers.

const personas = [
  {
    key: "small-carrier",
    name: "Small Carrier (5–50 trucks)",
    decisionMaker: "Owner (medium tech literacy)",
    secondaryInfluencer: "Office manager / dispatcher / spouse — WIN HER and you win the deal",
    topPains: "Dispatchers spend 30 min finding driver for 30-sec task | Tool sprawl (4–5 disconnected systems) | PODs stuck in cabs | No owner visibility into dispatch board | CSA scores + insurance rising | Driver recruiting funnel broken",
    websiteAngle: "Driver recruiting funnel + unified dispatch dashboard + dashboard for owner visibility",
    budgetRange: "$3–8K build + $300–$1,500/mo retainer",
    salesCycle: "2-4 weeks from call to contract",
    priorityQuarter: "Q2 2026 — biggest tool-sprawl pain + highest budget",
    techLiteracy: "Medium",
    notes: "Win the office manager. Owner buys, but office runs daily."
  },
  {
    key: "freight-broker",
    name: "Freight Broker (1–10 agents)",
    decisionMaker: "Owner/founder OR ops manager (medium-high tech literacy)",
    secondaryInfluencer: "Lead broker on ops side",
    topPains: "Margin compression (-$16/load avg) | Bond enforcement Jan 2026 (dip <$75K = 7-day suspension) | Carrier vetting + double-broker fraud | Manual carrier onboarding | No real CRM | Shipper-facing site is generic",
    websiteAngle: "Carrier portal + shipper-facing site + CRM integration + bond-monitoring dashboard",
    budgetRange: "$4–10K build + $500–$1,500/mo retainer",
    salesCycle: "3-5 weeks (multiple stakeholders)",
    priorityQuarter: "Q4 2026 — regulatory tailwind + fresh bond enforcement trauma",
    techLiteracy: "Medium-High",
    notes: "FMCSA Jan 16, 2026 bond rule is the fresh angle. Lead with it in cold email."
  },
  {
    key: "owner-operator",
    name: "Owner-Operator (1–3 trucks)",
    decisionMaker: "Owner-op (low-medium tech literacy); spouse often co-decides",
    secondaryInfluencer: "Spouse if involved in business",
    topPains: "'Will I get paid?' (broker bankruptcies — R&R $65M, AGX, Helix) | Fuel vs rate gap | Race-to-bottom load board | Ghost loads | ELD compliance (May 4 2026 deadline — 14 ELD models revoked) | Factoring fees | Insurance rising",
    websiteAngle: "Direct-shipper positioning + load board workaround (own freight network)",
    budgetRange: "$1–3K build; retainer <$300/mo only",
    salesCycle: "1-2 weeks (owner decides alone)",
    priorityQuarter: "Q3 2026 — pair with broker outreach (different segment, same lane)",
    techLiteracy: "Low-Medium",
    notes: "Cheap clients but fast cycles. Volume play, not premium."
  },
  {
    key: "moving-company",
    name: "Local Moving Company (3–20 crews)",
    decisionMaker: "Owner (low-medium tech); wife often runs office/marketing",
    secondaryInfluencer: "Office staff / scheduling coordinator",
    topPains: "Lead-gen tax ($25/lead Thumbtack/Yelp = $208-$250 CAC) | Booking flow friction | Crew no-shows | Seasonal cash-flow whiplash | Reputation fragility (one bad Yelp sinks month) | Lead response time (losing leads at 3 PM because office loading)",
    websiteAngle: "Lead-funnel website REPLACING Thumbtack/Yelp + mobile booking widget + auto-estimator",
    budgetRange: "$2–5K build + $300–$800/mo retainer",
    salesCycle: "2-3 weeks (owner + office staff)",
    priorityQuarter: "Q3 2026 — biggest CAC pain + easy message fit",
    techLiteracy: "Low-Medium",
    notes: "Easiest message fit per research. Run mover outreach 2nd-priority after carriers."
  },
  {
    key: "car-hauler",
    name: "Car Hauler / Auto Transport (1–10 trucks)",
    decisionMaker: "Owner-op (low tech literacy)",
    secondaryInfluencer: "Dispatcher if one exists",
    topPains: "Central Dispatch race-to-bottom | Brokers lie about rates | Fake MC accounts | Payment delays | Damage claims | DOT/permit complexity | Insurance ($250K+ cargo premium)",
    websiteAngle: "Custom load board alternative + carrier vetting + damage-claim portal",
    budgetRange: "$2–4K build",
    salesCycle: "2 weeks (owner decides)",
    priorityQuarter: "Q1 2027 — expansion segment",
    techLiteracy: "Low",
    notes: "Defer to M4+ unless inbound. Niche specialty."
  },
  {
    key: "last-mile-courier",
    name: "Last-Mile Courier (1–20 operators)",
    decisionMaker: "Founder / operator (low-medium)",
    secondaryInfluencer: "Dispatcher if multi-stop",
    topPains: "App-economy squeeze | Route chaos (Bringg/Onfleet poor UX) | POD friction | Customer 'where's my driver?' calls | Failed deliveries ($17/redelivery) | Worker classification risk | Vehicle wear",
    websiteAngle: "Dispatch portal + POD/photo capture UI + customer-facing ETA tracker",
    budgetRange: "$2–4K build",
    salesCycle: "2 weeks",
    priorityQuarter: "Q1 2027 — expansion segment",
    techLiteracy: "Low-Medium",
    notes: "Pair with mover outreach M2+ — similar audience."
  },
];

// Objection handlers — applies to ALL personas
const objections = [
  { objection: "Too expensive", realMeaning: "I haven't seen ROI proof yet", counter: "Show payback in trucks-saved-empty or hours-saved-per-week. 'Sprint pays for itself in 3 weeks if you book 1 extra load.'" },
  { objection: "We tried that once", realMeaning: "Previous vendor ghosted them", counter: "Show case study + offer reference call. '14-day launch guarantee — refund deposit and keep all design files if missed.'" },
  { objection: "My nephew built our website", realMeaning: "Loyalty + sunk cost + cheap", counter: "'When your nephew gets busy, who fixes it? Show me your current load form — I'll show you a 2-min conversion fix.'" },
  { objection: "I'm too busy right now", realMeaning: "Real — they're driving / dispatching", counter: "Async demo Loom + text follow-up. 'I'll send a 4-min Loom — watch when you're parked.'" },
  { objection: "Can I see other trucking clients?", realMeaning: "Trust filter — testing your credibility", counter: "MUST have logistics-only portfolio ready. Show 3-5 case studies + offer reference call with 1 client." },
  { objection: "Do you do this from overseas?", realMeaning: "Distrust of offshore dev shops (the 'AI bros from Pakistan' objection)", counter: "SURFACE IT FIRST. 'Yes, my team is in Pakistan. Here's why that's a strength for you: (1) 3 US trucking references on the call, (2) US phone + US-hours availability, (3) 14-day launch guarantee or refund + keep files, (4) 800+ logistics builds in 5 years.'" },
  { objection: "We don't need fancy AI stuff", realMeaning: "They don't trust the hype", counter: "Translate everything to outcomes. 'No AI talk. What we'd build: a portal that books overflow leads when dispatch is busy. That's it.'" },
];

export async function seedPersonas(db: PrismaClient) {
  for (const p of personas) {
    const created = await db.persona.create({ data: p });
    // Attach all shared objections to each persona for convenience
    for (const o of objections) {
      await db.objectionHandler.create({
        data: {
          objection: o.objection,
          realMeaning: o.realMeaning,
          counter: o.counter,
          personaId: created.id,
        },
      });
    }
  }
  console.log(`  ✓ Seeded ${personas.length} personas with ${objections.length} objections each`);
}
