"use server";

import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { getCurrentDayNumber, getTodayScore, getHealthChecks, getNorthStarWeek, getWeeklyScore, getMonthlyScore, getMonthNumberFromDay } from "@/lib/scoring";
import { dashboardSearch } from "@/lib/search";

const MODEL = "claude-haiku-4-5-20251001";

const SYSTEM_PROMPT = `You are the assistant for Yasir Bashir's "Logistics Command Center" — a personal operations dashboard for his Logistics Solutions agency (US trucking/freight/moving websites, 800+ portfolio, targeting $10K MRR in 6 months).

The dashboard has 11 modules: Today, 30-Day Plan, KPIs, Pipeline, Scripts, Past Clients, Channels, Tools, Content, Ads, Compliance & Brain, plus Settings/Connections.

Your job is to be a fast, helpful assistant that:
1. Answers questions about Yasir's dashboard data (his leads, scripts, KPIs, ads, content, past clients, etc.).
2. Helps him navigate the dashboard ("open the facebook ads module" → return the URL).
3. Looks up specific entities by name (a lead, a past client, a script, a tool).
4. Gives him quick situational summaries ("how am I doing today?", "what's my score?", "what should I work on?").

You have these tools available — use them when relevant; don't make up data. After tool results, give a concise, friendly answer. Default to brevity. When you find specific items, include them as clickable links by giving the path (/pipeline, /scripts#key, etc.) so the UI can render them as cards.

Voice: brief, action-oriented, slightly informal. Yasir is busy executing — don't waste his time with long preambles. Lead with the answer.`;

// Tool schemas — only kept as types, not exposed to Anthropic directly (we'll inline as JSON)
const TOOLS: Anthropic.Tool[] = [
  {
    name: "search_dashboard",
    description: "Search across ALL dashboard data: leads, past clients, scripts, channels, tools, plan days, content posts, ad campaigns, personas, and compliance rules. Returns a list of matching items with their hrefs (URLs).",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "The search query. Can be a keyword, a name, a company, a topic." },
      },
      required: ["query"],
    },
  },
  {
    name: "get_today_status",
    description: "Returns today's current state: day number, today's score (% of points hit), tasks completed vs total, weekly north-star (booked calls), and what's planned for today.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_health_checks",
    description: "Returns the 6 weekly KPI health-check ratios (cold email reply rate, cold call connect rate, LinkedIn acceptance, discovery show rate, close rate, LP conversion, Loom SLA) with current values, targets, and pass/warn/fail status.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_pipeline_summary",
    description: "Returns pipeline counts and total value by stage (new, audit_sent, discovery_booked, discovery_completed, proposal_sent, won, lost, nurture).",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_ads_summary",
    description: "Returns ad campaigns with status, daily budget, total spend, CTR, CPL, and booked calls. Useful for 'how are ads doing'.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_past_clients_summary",
    description: "Returns past client outreach progress: total list, contacted, replied, booked, closed. Plus A-tier Loom queue status.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_revenue_outlook",
    description: "Returns this month's revenue/MRR targets vs progress, and the path to $10K MRR. Useful for 'how's revenue this month'.",
    input_schema: { type: "object", properties: {} },
  },
];

async function runTool(name: string, input: Record<string, unknown>): Promise<unknown> {
  const now = new Date();
  const app = await db.appState.findUnique({ where: { id: 1 } });
  const dayN = app ? getCurrentDayNumber(app.startDate, now) : 1;

  if (name === "search_dashboard") {
    const q = String(input.query ?? "");
    const hits = await dashboardSearch(q);
    return { results: hits.slice(0, 20) };
  }

  if (name === "get_today_status") {
    const monthN = getMonthNumberFromDay(dayN);
    const day = dayN > 0 ? await db.day.findUnique({ where: { dayNumber: dayN }, include: { tasks: true } }) : null;
    const { score, points, maxPoints } = await getTodayScore(now);
    const northStar = await getNorthStarWeek(now);
    const tasksCompleted = day?.tasks.filter((t) => t.status === "completed").length ?? 0;
    return {
      dayNumber: dayN,
      monthNumber: monthN,
      dayLabel: day?.label,
      focusArea: day?.focusArea,
      hoursEstimated: day?.hoursEstimated,
      taskCount: day?.tasks.length ?? 0,
      tasksCompleted,
      todayScorePct: Math.round(score),
      pointsEarned: Math.round(points),
      pointsMax: maxPoints,
      bookedCallsThisWeek: northStar.value,
      bookedCallsTarget: northStar.target,
    };
  }

  if (name === "get_health_checks") {
    const checks = await getHealthChecks(now);
    return checks.map((h) => ({
      name: h.name,
      unit: h.unit,
      value: Math.round(h.value * 10) / 10,
      target: h.target,
      thresholdMin: h.thresholdMin,
      status: h.status,
      failureMode: h.status === "fail" ? h.failureMode : null,
    }));
  }

  if (name === "get_pipeline_summary") {
    const leads = await db.lead.findMany();
    const stages: Record<string, { count: number; value: number; mrr: number }> = {};
    for (const l of leads) {
      const s = l.stage;
      if (!stages[s]) stages[s] = { count: 0, value: 0, mrr: 0 };
      stages[s].count++;
      stages[s].value += l.estimatedValue;
      stages[s].mrr += l.retainerValue;
    }
    return { totalLeads: leads.length, stages };
  }

  if (name === "get_ads_summary") {
    const camps = await db.adCampaign.findMany({ include: { metrics: true } });
    return camps.map((c) => {
      const spend = c.metrics.reduce((s, m) => s + m.spend, 0);
      const impr = c.metrics.reduce((s, m) => s + m.impressions, 0);
      const clicks = c.metrics.reduce((s, m) => s + m.clicks, 0);
      const leads = c.metrics.reduce((s, m) => s + m.leads, 0);
      const booked = c.metrics.reduce((s, m) => s + m.bookedCalls, 0);
      return {
        name: c.name,
        platform: c.platform,
        status: c.status,
        dailyBudget: c.dailyBudget,
        monthlyBudget: c.monthlyBudget,
        spend, leads, bookedCalls: booked,
        ctr: impr > 0 ? Math.round((clicks / impr) * 1000) / 10 : 0,
        cpl: leads > 0 ? Math.round(spend / leads) : null,
      };
    });
  }

  if (name === "get_past_clients_summary") {
    const all = await db.pastClient.findMany();
    return {
      total: all.length,
      bySegment: {
        A: all.filter((p) => p.segment === "A").length,
        B: all.filter((p) => p.segment === "B").length,
        C: all.filter((p) => p.segment === "C").length,
      },
      byStatus: {
        not_contacted: all.filter((p) => p.status === "not_contacted").length,
        emailed: all.filter((p) => p.status === "emailed").length,
        replied: all.filter((p) => p.status === "replied").length,
        booked: all.filter((p) => p.status === "booked").length,
        closed: all.filter((p) => p.status === "closed").length,
      },
      aTierLoomPending: all.filter((p) => p.segment === "A" && !p.loomRecorded && p.status !== "not_contacted").length,
    };
  }

  if (name === "get_revenue_outlook") {
    const monthN = getMonthNumberFromDay(dayN);
    const month = await db.month.findUnique({ where: { monthNumber: monthN } });
    const wonLeads = await db.lead.findMany({ where: { stage: "won" } });
    const projectRevenue = wonLeads.reduce((s, l) => s + l.estimatedValue, 0);
    const currentMrr = wonLeads.reduce((s, l) => s + l.retainerValue, 0);
    return {
      currentMonth: monthN,
      monthTheme: month?.theme,
      revenueTarget: month?.revenueTarget,
      mrrTarget: month?.mrrTarget,
      adBudget: month?.adBudget,
      objectives: month?.objectives,
      currentProjectRevenue: projectRevenue,
      currentMrr,
      pathTo10kMrr: "8 × $497 (Care) + 4 × $997 (Growth) + 1 × $1,997 (Scale) = $9,929",
    };
  }

  return { error: `Unknown tool: ${name}` };
}

export type ChatMessage = { role: "user" | "assistant"; content: string };

export async function chatWithAssistant(history: ChatMessage[]): Promise<{ reply: string; toolCalls?: Array<{ tool: string; input: Record<string, unknown>; result: unknown }>; error?: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      reply: "",
      error: "no_api_key",
    };
  }

  const client = new Anthropic({ apiKey });
  const messages: Anthropic.MessageParam[] = history.map((m) => ({ role: m.role, content: m.content }));

  const toolCalls: Array<{ tool: string; input: Record<string, unknown>; result: unknown }> = [];
  const MAX_ITER = 5;

  let response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools: TOOLS,
    messages,
  });

  for (let i = 0; i < MAX_ITER && response.stop_reason === "tool_use"; i++) {
    const toolUseBlocks = response.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const tu of toolUseBlocks) {
      const result = await runTool(tu.name, tu.input as Record<string, unknown>);
      toolCalls.push({ tool: tu.name, input: tu.input as Record<string, unknown>, result });
      toolResults.push({
        type: "tool_result",
        tool_use_id: tu.id,
        content: JSON.stringify(result),
      });
    }
    messages.push({ role: "assistant", content: response.content });
    messages.push({ role: "user", content: toolResults });

    response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages,
    });
  }

  const textBlocks = response.content.filter((b): b is Anthropic.TextBlock => b.type === "text");
  const reply = textBlocks.map((b) => b.text).join("\n").trim();
  return { reply, toolCalls };
}
