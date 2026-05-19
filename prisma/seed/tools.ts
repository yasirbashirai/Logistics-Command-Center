import type { PrismaClient } from "@prisma/client";

// Full M1 stack from PLAN §4 + RESEARCH §5.
// Status: active | cancelled | holding (not yet bought) | upgrade-planned

export const tools = [
  { name: "Framer", category: "Landing Page", role: "yasirbashir.com landing page + future client marketing sites", plan: "Basic", costPerMonth: 25, status: "active", loginUrl: "https://framer.com", alternativesRuledOut: "Webflow ($29+) slower to ship; Next.js + Vercel — migrate at scale Phase 2", sortOrder: 1 },
  { name: "GoHighLevel", category: "CRM / Pipeline", role: "8-stage pipeline + 7 automations + email/SMS + scheduler + Stripe + white-label", plan: "Starter", costPerMonth: 97, status: "active", loginUrl: "https://app.gohighlevel.com", alternativesRuledOut: "HubSpot Free (caps fast, no white-label); Pipedrive (no multi-client); Salesforce (overkill)", sortOrder: 2 },
  { name: "Smartlead", category: "Cold Email", role: "8 mailboxes + warmup + 160M contact DB + reply detection", plan: "Pro (8 mailboxes)", costPerMonth: 94, status: "active", loginUrl: "https://app.smartlead.ai", alternativesRuledOut: "Instantly similar price; lemlist ($39+) multi-channel overkill; Apollo (sourcing only); Salesforge unproven", sortOrder: 3 },
  { name: "OpenPhone", category: "Phone", role: "US phone number — calls + SMS + WhatsApp Business app", plan: "Starter", costPerMonth: 19, status: "active", loginUrl: "https://my.openphone.com", alternativesRuledOut: "JustCall ($29+); CloseCRM ($49+/seat) — upgrade only at 3+ inside-sales", sortOrder: 4 },
  { name: "Runway", category: "Video AI", role: "Multi-model (Gen-4.5, Veo 3.1, Kling) for ad creative + hero videos", plan: "Standard (annual)", costPerMonth: 12, status: "active", loginUrl: "https://runwayml.com", warning: "Sora 2 sunset Sept 24 2026 — do NOT use Sora; Runway is safe alternative", alternativesRuledOut: "Sora 2 (API sunset Sept 2026); Synthesia ($89+) enterprise overkill", sortOrder: 5 },
  { name: "HeyGen", category: "Avatar Video", role: "Founder avatar for sales videos + multilingual dubbing", plan: "Creator", costPerMonth: 24, status: "active", loginUrl: "https://heygen.com", alternativesRuledOut: "Synthesia enterprise overkill; D-ID weaker quality", sortOrder: 6 },
  { name: "Submagic", category: "Short-Form Video", role: "Auto captions + clip-edit for TikTok/LinkedIn/Reels", plan: "Starter", costPerMonth: 16, status: "active", loginUrl: "https://submagic.co", alternativesRuledOut: "Captions.ai ($10); Opus Clip ($15) — both work; Submagic edits feel cleanest for B2B", sortOrder: 7 },
  { name: "Midjourney", category: "Image AI", role: "Hero brand imagery + ad graphics + case study visuals", plan: "Basic", costPerMonth: 10, status: "active", loginUrl: "https://midjourney.com", alternativesRuledOut: "Stable Diffusion local (slower workflow)", sortOrder: 8 },
  { name: "ElevenLabs", category: "Voice AI", role: "Voice clone for IVR + voiceovers", plan: "Starter", costPerMonth: 5, status: "active", loginUrl: "https://elevenlabs.io", alternativesRuledOut: "Descript Overdub (less natural)", sortOrder: 9 },
  { name: "Canva Pro", category: "Design", role: "Static ads + LinkedIn carousels + decks + quick assets", plan: "Solo", costPerMonth: 15, status: "active", loginUrl: "https://canva.com", alternativesRuledOut: "Figma free for UI mockups (use both)", sortOrder: 10 },
  { name: "n8n (self-host)", category: "Automation", role: "Workflow automation + native LangChain — alternative to Zapier", plan: "Self-host VPS", costPerMonth: 5, status: "active", loginUrl: "https://n8n.io", alternativesRuledOut: "Zapier (cost spirals at volume); Make (cost); Integromat (n8n is open-source alt)", sortOrder: 11 },
  { name: "Chatbase", category: "AI Chatbot", role: "Site chatbot — resell to clients at $99/mo (margin)", plan: "Hobby", costPerMonth: 40, status: "active", loginUrl: "https://chatbase.co", alternativesRuledOut: "ManyChat (social only); Voiceflow (steep curve); Tidio (weak AI); Intercom Fin overkill", sortOrder: 12 },
  { name: "Loom", category: "Async Video", role: "Lead-magnet 4-min audits + client comms — 25 vids/mo free, upgrade Business if cap hit", plan: "Free → Business", costPerMonth: 0, status: "active", loginUrl: "https://loom.com", alternativesRuledOut: "Vidyard; Wistia — similar but paid", sortOrder: 13 },
  { name: "Notion", category: "Docs / PM", role: "4 workspaces: Prospects, Audit Loom Queue, Content Calendar, SOPs", plan: "Free", costPerMonth: 0, status: "active", loginUrl: "https://notion.so", alternativesRuledOut: "ClickUp (overkill); Linear (engineering-only); Asana (overkill)", sortOrder: 14 },
  { name: "Fathom", category: "Meeting Recorder", role: "Call recording + AI transcript + GHL sync — discovery call ingestion", plan: "Free", costPerMonth: 0, status: "active", loginUrl: "https://fathom.video", alternativesRuledOut: "otter.ai paid; tl;dv; Tactiq — Fathom free tier sufficient M1-M3", sortOrder: 15 },
  { name: "Microsoft Clarity", category: "Analytics", role: "Session recordings + heatmaps on yasirbashir.com", plan: "Free", costPerMonth: 0, status: "active", loginUrl: "https://clarity.microsoft.com", alternativesRuledOut: "Hotjar paid (Clarity is free with parity)", sortOrder: 16 },
  { name: "GA4 + Google Tag Manager", category: "Analytics", role: "Site analytics + central tag hub", plan: "Free", costPerMonth: 0, status: "active", loginUrl: "https://analytics.google.com", alternativesRuledOut: "Segment ($120+) enterprise; Mixpanel product-only", sortOrder: 17 },
  { name: "Apollo", category: "Lead Enrichment", role: "Enrich FMCSA bulk lists with email + LinkedIn + tech stack", plan: "Free 60/mo → Basic $49", costPerMonth: 0, status: "active", loginUrl: "https://apollo.io", alternativesRuledOut: "Clay ($149+) — upgrade M2 for gold-tier enrichment; ZoomInfo enterprise overkill", sortOrder: 18 },
  { name: "Cloudflare", category: "DNS", role: "DNS for sending domains + SPF/DKIM/DMARC management", plan: "Free", costPerMonth: 0, status: "active", loginUrl: "https://cloudflare.com", alternativesRuledOut: "Namecheap DNS (clunkier UX)", sortOrder: 19 },
  { name: "Stripe", category: "Payments", role: "Invoice + retainer billing — integrated with GHL", plan: "Standard (% per txn)", costPerMonth: 0, status: "active", loginUrl: "https://dashboard.stripe.com", alternativesRuledOut: "Wise/PayPal — Stripe is the standard for service invoicing", sortOrder: 20 },
  { name: "Meta Business Manager", category: "Ads", role: "Ad account + pixel + CAPI + domain verify", plan: "Free", costPerMonth: 0, status: "active", loginUrl: "https://business.facebook.com", sortOrder: 21 },
  { name: "TikTok Business Center", category: "Ads", role: "Ad account + organic posting + Spark Ads", plan: "Free", costPerMonth: 0, status: "active", loginUrl: "https://business.tiktok.com", sortOrder: 22 },
  { name: "Claude Pro", category: "Writing AI", role: "Long-form writing + strategy + cold email personalization", plan: "Pro", costPerMonth: 20, status: "active", loginUrl: "https://claude.ai", alternativesRuledOut: "Jasper; ChatGPT Plus redundant; Gemini redundant", sortOrder: 23 },
  { name: "Perplexity Pro", category: "Research", role: "Sourced research + fact-check (M2 prospect research, market intel)", plan: "Pro", costPerMonth: 20, status: "holding", loginUrl: "https://perplexity.ai", alternativesRuledOut: "Google Search (less sourced); Claude web search (redundant)", sortOrder: 24 },
  { name: "Claude Code", category: "Coding AI", role: "Terminal dev assist — builds features + automations + this dashboard", plan: "Max plan", costPerMonth: 0, status: "active", loginUrl: "https://claude.com/claude-code", alternativesRuledOut: "Cursor ($20) redundant; GitHub Copilot redundant; v0 redundant", sortOrder: 25 },

  // Phase 2 / hold tier
  { name: "Clay", category: "Lead Enrichment (M2+)", role: "Gold-tier list enrichment — upgrade M2 when Apollo free tier exhausted", plan: "Pro", costPerMonth: 149, status: "holding", warning: "M2 upgrade only — don't buy M1", sortOrder: 26 },
  { name: "BuiltWith", category: "Tech Stack Lookup (M2+)", role: "Find 'broken website' targets by detected tech (Divi 2017, etc.)", plan: "Pro", costPerMonth: 295, status: "holding", warning: "M2+ only — defer M1 per RESEARCH §1 (use Apollo + FMCSA first)", sortOrder: 27 },
  { name: "Outscraper / Apify", category: "List Sourcing (movers/couriers)", role: "Google Maps scrape — movers + couriers with <3.5 stars (pain signal)", plan: "Starter", costPerMonth: 49, status: "holding", warning: "Add Week 2-3 if mover/courier outreach added", sortOrder: 28 },
  { name: "Beehiiv", category: "Newsletter (M2)", role: "Weekly logistics teardown newsletter — owned audience moat", plan: "Free", costPerMonth: 0, status: "holding", warning: "M2 launch — don't start M1 (focus on outbound first)", sortOrder: 29 },
];

export async function seedTools(db: PrismaClient) {
  for (const t of tools) {
    await db.tool.create({
      data: {
        name: t.name,
        category: t.category,
        role: t.role,
        plan: t.plan,
        costPerMonth: t.costPerMonth,
        status: t.status,
        loginUrl: t.loginUrl,
        warning: t.warning,
        alternativesRuledOut: t.alternativesRuledOut,
        sortOrder: t.sortOrder,
      },
    });
  }
  console.log(`  ✓ Seeded ${tools.length} tools`);
}
