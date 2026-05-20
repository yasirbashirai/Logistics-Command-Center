"use server";

import { db } from "@/lib/db";

export type SearchHit = {
  id: string;
  group: "module" | "lead" | "past-client" | "script" | "channel" | "tool" | "day" | "content" | "ad-campaign" | "persona" | "rule";
  title: string;
  subtitle?: string;
  meta?: string;
  href: string;
  icon?: string;
};

const MODULES: SearchHit[] = [
  { id: "m-today", group: "module", title: "Today", subtitle: "Daily command center", href: "/today", icon: "LayoutDashboard" },
  { id: "m-plan", group: "module", title: "30-Day Plan", subtitle: "Calendar + drill-in", href: "/plan", icon: "CalendarDays" },
  { id: "m-kpis", group: "module", title: "KPIs", subtitle: "Health checks + north star", href: "/kpis", icon: "Target" },
  { id: "m-pipeline", group: "module", title: "Pipeline", subtitle: "8-stage Kanban", href: "/pipeline", icon: "Kanban" },
  { id: "m-scripts", group: "module", title: "Scripts", subtitle: "Paste-ready templates", href: "/scripts", icon: "FileText" },
  { id: "m-past-clients", group: "module", title: "Past Clients", subtitle: "Re-engagement tracker", href: "/past-clients", icon: "Users" },
  { id: "m-channels", group: "module", title: "Channels", subtitle: "15 outreach channels", href: "/channels", icon: "Radio" },
  { id: "m-tools", group: "module", title: "Tools", subtitle: "Stack + costs", href: "/tools", icon: "Wrench" },
  { id: "m-content", group: "module", title: "Content Engine", subtitle: "Posts + Looms + scheduling", href: "/content", icon: "Sparkles" },
  { id: "m-ads", group: "module", title: "Paid Ads", subtitle: "Meta · TikTok · CTWA · campaigns", href: "/ads", icon: "Megaphone" },
  { id: "m-brain", group: "module", title: "Compliance & Brain", subtitle: "Rules · personas · warnings", href: "/brain", icon: "ShieldAlert" },
  { id: "m-connections", group: "module", title: "Connections", subtitle: "Link Facebook / LinkedIn / Instagram", href: "/settings/connections", icon: "Link" },
];

// Keyword expansions — let user type "facebook ad" and find /ads
const KEYWORD_ALIASES: Record<string, string[]> = {
  facebook: ["ads", "ad", "meta"],
  fb: ["ads"],
  instagram: ["content", "social", "ads"],
  ig: ["content", "social"],
  linkedin: ["content", "scripts", "outreach"],
  twitter: ["content"],
  x: ["content"],
  tiktok: ["ads", "content"],
  whatsapp: ["ads", "channels"],
  ctwa: ["ads"],
  email: ["scripts", "channels"],
  cold: ["scripts", "channels"],
  call: ["scripts", "channels", "pipeline"],
  loom: ["scripts", "content"],
  teardown: ["content"],
  proposal: ["pipeline", "scripts"],
  invoice: ["tools", "pipeline"],
  retainer: ["pipeline", "kpis"],
  mrr: ["kpis"],
  revenue: ["kpis"],
  budget: ["ads", "tools"],
  ghl: ["tools"],
  smartlead: ["tools", "channels"],
  framer: ["tools"],
  carrier: ["scripts", "past-clients", "pipeline"],
  broker: ["scripts", "past-clients", "pipeline"],
  mover: ["scripts", "past-clients", "pipeline"],
  fmcsa: ["brain", "channels"],
  bond: ["brain"],
  compliance: ["brain"],
};

function fuzzy(haystack: string, needle: string): boolean {
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase();
  if (h.includes(n)) return true;
  // Token search — every token in needle must appear in haystack
  const tokens = n.split(/\s+/).filter(Boolean);
  return tokens.every((t) => h.includes(t));
}

export async function dashboardSearch(query: string): Promise<SearchHit[]> {
  const q = query.trim();
  if (!q) return MODULES.slice(0, 8);

  const hits: SearchHit[] = [];

  // Modules + aliases
  const moduleMatches = MODULES.filter((m) => fuzzy(`${m.title} ${m.subtitle ?? ""}`, q));
  // Alias expansion
  const aliasModules: SearchHit[] = [];
  for (const [alias, modSlugs] of Object.entries(KEYWORD_ALIASES)) {
    if (q.toLowerCase().includes(alias)) {
      for (const slug of modSlugs) {
        const m = MODULES.find((mm) => mm.href.endsWith(`/${slug}`) || mm.id.endsWith(`-${slug}`));
        if (m && !moduleMatches.find((mm) => mm.id === m.id)) {
          aliasModules.push(m);
        }
      }
    }
  }
  hits.push(...moduleMatches, ...aliasModules);

  // Leads
  const leads = await db.lead.findMany({
    where: {
      OR: [
        { name: { contains: q } },
        { company: { contains: q } },
        { email: { contains: q } },
        { painPoint: { contains: q } },
      ],
    },
    take: 8,
  });
  for (const l of leads) {
    hits.push({
      id: `lead-${l.id}`,
      group: "lead",
      title: l.name,
      subtitle: l.company ?? "—",
      meta: `${l.stage} · ${l.source}`,
      href: `/pipeline#lead-${l.id}`,
      icon: "Kanban",
    });
  }

  // Past clients
  const past = await db.pastClient.findMany({
    where: {
      OR: [
        { name: { contains: q } },
        { company: { contains: q } },
        { email: { contains: q } },
        { originalProjectSummary: { contains: q } },
      ],
    },
    take: 8,
  });
  for (const p of past) {
    hits.push({
      id: `past-${p.id}`,
      group: "past-client",
      title: p.name,
      subtitle: p.company ?? p.platform,
      meta: `Segment ${p.segment} · ${p.status.replace("_", " ")}`,
      href: `/past-clients`,
      icon: "Users",
    });
  }

  // Scripts
  const scripts = await db.script.findMany({
    where: {
      OR: [
        { title: { contains: q } },
        { body: { contains: q } },
        { subject: { contains: q } },
        { category: { contains: q } },
        { persona: { contains: q } },
      ],
    },
    take: 8,
  });
  for (const s of scripts) {
    hits.push({
      id: `script-${s.id}`,
      group: "script",
      title: s.title,
      subtitle: s.subject ?? `${s.category} · ${s.persona}`,
      meta: s.category,
      href: `/scripts#${s.key}`,
      icon: "FileText",
    });
  }

  // Channels
  const channels = await db.channel.findMany({
    where: { OR: [{ name: { contains: q } }, { role: { contains: q } }, { bestPractice: { contains: q } }] },
    take: 5,
  });
  for (const c of channels) {
    hits.push({
      id: `chan-${c.id}`,
      group: "channel",
      title: c.name,
      subtitle: c.role.slice(0, 80),
      meta: `${c.priority} · ${c.status}`,
      href: `/channels`,
      icon: "Radio",
    });
  }

  // Tools
  const tools = await db.tool.findMany({
    where: { OR: [{ name: { contains: q } }, { role: { contains: q } }, { category: { contains: q } }] },
    take: 5,
  });
  for (const t of tools) {
    hits.push({
      id: `tool-${t.id}`,
      group: "tool",
      title: t.name,
      subtitle: t.role.slice(0, 80),
      meta: `$${t.costPerMonth}/mo · ${t.status}`,
      href: `/tools`,
      icon: "Wrench",
    });
  }

  // Days
  const days = await db.day.findMany({
    where: { OR: [{ label: { contains: q } }, { focusArea: { contains: q } }] },
    take: 5,
  });
  for (const d of days) {
    hits.push({
      id: `day-${d.id}`,
      group: "day",
      title: `Day ${d.dayNumber} · ${d.label}`,
      subtitle: `Month ${d.monthNumber} · ${d.weekday} · ${d.focusArea}`,
      href: `/plan/${d.dayNumber}`,
      icon: "CalendarDays",
    });
  }

  // Content
  const content = await db.contentItem.findMany({
    where: { OR: [{ title: { contains: q } }, { hookText: { contains: q } }, { body: { contains: q } }] },
    take: 5,
  });
  for (const c of content) {
    hits.push({
      id: `content-${c.id}`,
      group: "content",
      title: c.title,
      subtitle: c.hookText?.slice(0, 80) ?? c.type,
      meta: `${c.platform} · ${c.status}`,
      href: `/content#item-${c.id}`,
      icon: "Sparkles",
    });
  }

  // Ad campaigns
  const ads = await db.adCampaign.findMany({
    where: { OR: [{ name: { contains: q } }, { platform: { contains: q } }, { campaignType: { contains: q } }, { objective: { contains: q } }] },
    take: 5,
  });
  for (const a of ads) {
    hits.push({
      id: `ad-${a.id}`,
      group: "ad-campaign",
      title: a.name,
      subtitle: `${a.platform} · ${a.campaignType.replace("_", " ")}`,
      meta: `${a.status} · $${a.dailyBudget}/day`,
      href: `/ads`,
      icon: "Megaphone",
    });
  }

  // Personas
  const personas = await db.persona.findMany({
    where: { OR: [{ name: { contains: q } }, { topPains: { contains: q } }, { websiteAngle: { contains: q } }] },
    take: 4,
  });
  for (const p of personas) {
    hits.push({
      id: `persona-${p.id}`,
      group: "persona",
      title: p.name,
      subtitle: p.websiteAngle.slice(0, 80),
      meta: p.priorityQuarter ?? "",
      href: `/brain#personas`,
      icon: "Users",
    });
  }

  // Rules
  const rules = await db.complianceRule.findMany({
    where: { OR: [{ rule: { contains: q } }, { reason: { contains: q } }, { category: { contains: q } }] },
    take: 4,
  });
  for (const r of rules) {
    hits.push({
      id: `rule-${r.id}`,
      group: "rule",
      title: r.rule,
      subtitle: r.reason.slice(0, 80),
      meta: `${r.severity} · ${r.category}`,
      href: `/brain#rules`,
      icon: "ShieldAlert",
    });
  }

  return hits;
}
