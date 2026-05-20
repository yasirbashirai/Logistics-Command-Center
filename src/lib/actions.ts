"use server";

import { db } from "@/lib/db";
import { snapshotToday } from "@/lib/scoring";
import { revalidatePath } from "next/cache";
import { startOfDay } from "@/lib/dates";

export async function toggleTaskStatus(taskId: number) {
  const t = await db.dailyTask.findUnique({ where: { id: taskId } });
  if (!t) return;
  const next = t.status === "completed" ? "pending" : "completed";
  await db.dailyTask.update({
    where: { id: taskId },
    data: {
      status: next,
      completedAt: next === "completed" ? new Date() : null,
    },
  });
  await snapshotToday(new Date());
  revalidatePath("/today");
  revalidatePath("/plan");
}

export async function logRecurring(recurringTaskId: number, count: number, notes?: string) {
  const today = startOfDay(new Date());
  // Find existing log for today
  const existing = await db.recurringLog.findFirst({
    where: { recurringTaskId, date: today },
  });
  if (existing) {
    await db.recurringLog.update({
      where: { id: existing.id },
      data: { actualCount: existing.actualCount + count, notes: notes ?? existing.notes },
    });
  } else {
    await db.recurringLog.create({
      data: { recurringTaskId, date: today, actualCount: count, notes },
    });
  }
  await snapshotToday(new Date());
  revalidatePath("/today");
  revalidatePath("/kpis");
}

export async function logKpi(kpiId: number, value: number, notes?: string) {
  const today = startOfDay(new Date());
  await db.kpiLog.create({
    data: { kpiId, date: today, value, notes },
  });
  await snapshotToday(new Date());
  revalidatePath("/kpis");
}

export async function updateLeadStage(leadId: number, stage: string) {
  await db.lead.update({
    where: { id: leadId },
    data: {
      stage,
      stageEnteredAt: new Date(),
      lastActivityAt: new Date(),
      closedAt: stage === "won" || stage === "lost" ? new Date() : null,
    },
  });
  revalidatePath("/pipeline");
}

export async function createLead(data: {
  name: string;
  company?: string;
  source: string;
  persona?: string;
  estimatedValue?: number;
  painPoint?: string;
}) {
  await db.lead.create({ data });
  revalidatePath("/pipeline");
}

export async function updatePastClient(id: number, status: string) {
  await db.pastClient.update({
    where: { id },
    data: {
      status,
      lastContactedAt: status !== "not_contacted" ? new Date() : null,
      repliedAt: status === "replied" ? new Date() : undefined,
      bookedAt: status === "booked" ? new Date() : undefined,
      closedAt: status === "closed" ? new Date() : undefined,
    },
  });
  revalidatePath("/past-clients");
}

export async function createPastClient(data: {
  name: string;
  company?: string;
  email?: string;
  platform: string;
  segment: string;
  originalProjectYear?: number;
  originalProjectSummary?: string;
}) {
  await db.pastClient.create({ data });
  revalidatePath("/past-clients");
}

export async function toggleToolStatus(id: number, status: string) {
  await db.tool.update({ where: { id }, data: { status } });
  revalidatePath("/tools");
}

export async function toggleChannelStatus(id: number, status: string) {
  await db.channel.update({ where: { id }, data: { status } });
  revalidatePath("/channels");
}

export async function updateContentItem(id: number, status: string) {
  await db.contentItem.update({
    where: { id },
    data: {
      status,
      publishedAt: status === "published" ? new Date() : undefined,
    },
  });
  revalidatePath("/content");
}

export async function createContentItem(data: {
  type: string;
  title: string;
  dayOfWeek?: string;
  weekNumber?: number;
  hookText?: string;
}) {
  await db.contentItem.create({ data });
  revalidatePath("/content");
}

export async function updateStartDate(date: Date) {
  await db.appState.update({
    where: { id: 1 },
    data: { startDate: date },
  });
  revalidatePath("/", "layout");
}

// ─── Ads ───
export async function updateAdCampaignStatus(id: number, status: string) {
  await db.adCampaign.update({
    where: { id },
    data: {
      status,
      startDate: status === "active" ? new Date() : undefined,
      endDate: status === "killed" || status === "paused" ? new Date() : undefined,
    },
  });
  revalidatePath("/ads");
}

export async function updateAdCampaignBudget(id: number, dailyBudget: number) {
  const monthly = dailyBudget * 30;
  await db.adCampaign.update({
    where: { id },
    data: { dailyBudget, monthlyBudget: monthly },
  });
  revalidatePath("/ads");
}

export async function createAdCampaign(data: {
  name: string;
  platform: string;
  campaignType: string;
  monthNumber: number;
  dailyBudget: number;
  audience?: string;
  objective?: string;
}) {
  await db.adCampaign.create({
    data: { ...data, monthlyBudget: data.dailyBudget * 30 },
  });
  revalidatePath("/ads");
}

export async function updateCreativeStatus(id: number, status: string) {
  await db.adCreative.update({ where: { id }, data: { status } });
  revalidatePath("/ads");
}

export async function createAdCreative(data: {
  campaignId: number;
  name: string;
  format: string;
  hook?: string;
  body?: string;
  cta?: string;
  scriptKeyRef?: string;
}) {
  await db.adCreative.create({ data });
  revalidatePath("/ads");
}

export async function logAdMetric(data: {
  campaignId: number;
  spend: number;
  impressions?: number;
  clicks?: number;
  leads?: number;
  bookedCalls?: number;
  notes?: string;
}) {
  await db.adMetric.create({
    data: {
      campaignId: data.campaignId,
      date: new Date(),
      spend: data.spend,
      impressions: data.impressions ?? 0,
      clicks: data.clicks ?? 0,
      leads: data.leads ?? 0,
      bookedCalls: data.bookedCalls ?? 0,
      notes: data.notes,
    },
  });
  revalidatePath("/ads");
}

// ─── Content enhancements ───
export async function updateContentDetails(
  id: number,
  data: { title?: string; hookText?: string; body?: string; postUrl?: string; imageUrl?: string; videoUrl?: string; scheduledFor?: Date | null; platform?: string; dayOfWeek?: string | null; weekNumber?: number | null; status?: string; }
) {
  await db.contentItem.update({ where: { id }, data });
  revalidatePath("/content");
}

export async function logContentEngagement(id: number, data: { likes?: number; comments?: number; reach?: number; shares?: number; inboundDms?: number; }) {
  await db.contentItem.update({ where: { id }, data });
  revalidatePath("/content");
}

// ─── Social Accounts & Scheduled Posts ───
export async function connectSocialAccount(data: {
  platform: string;
  accountName?: string;
  accountUrl?: string;
  apiKey?: string;
  accessToken?: string;
}) {
  await db.socialAccount.upsert({
    where: { platform: data.platform },
    create: {
      platform: data.platform,
      accountName: data.accountName,
      accountUrl: data.accountUrl,
      apiKey: data.apiKey,
      accessToken: data.accessToken,
      connectedAt: new Date(),
      status: "connected",
    },
    update: {
      accountName: data.accountName,
      accountUrl: data.accountUrl,
      apiKey: data.apiKey,
      accessToken: data.accessToken,
      connectedAt: new Date(),
      status: "connected",
    },
  });
  revalidatePath("/settings/connections");
}

export async function disconnectSocialAccount(platform: string) {
  await db.socialAccount.update({
    where: { platform },
    data: { status: "disconnected", accessToken: null, apiKey: null, refreshToken: null },
  });
  revalidatePath("/settings/connections");
}

export async function schedulePost(data: {
  contentItemId?: number;
  platform: string;
  body: string;
  mediaUrl?: string;
  scheduledFor: Date;
}) {
  await db.scheduledPost.create({
    data: { ...data, status: "queued" },
  });
  if (data.contentItemId) {
    await db.contentItem.update({
      where: { id: data.contentItemId },
      data: { status: "scheduled", scheduledFor: data.scheduledFor, platform: data.platform },
    });
  }
  revalidatePath("/content");
  revalidatePath("/settings/connections");
}

export async function cancelScheduledPost(id: number) {
  await db.scheduledPost.update({ where: { id }, data: { status: "cancelled" } });
  revalidatePath("/settings/connections");
}

// ─── Scripts CRUD ───
export async function createScript(data: {
  key: string;
  title: string;
  category: string;
  persona?: string;
  funnelStage?: string;
  subject?: string;
  body: string;
  variables?: string;
  notes?: string;
}) {
  await db.script.create({ data: { ...data, persona: data.persona ?? "general" } });
  revalidatePath("/scripts");
}

export async function updateScript(id: number, data: {
  title?: string;
  category?: string;
  persona?: string;
  subject?: string | null;
  body?: string;
  variables?: string | null;
  notes?: string | null;
}) {
  await db.script.update({ where: { id }, data });
  revalidatePath("/scripts");
}

export async function deleteScript(id: number) {
  await db.script.delete({ where: { id } });
  revalidatePath("/scripts");
}

// ─── Tools CRUD ───
export async function updateTool(id: number, data: {
  name?: string;
  role?: string;
  category?: string;
  plan?: string | null;
  costPerMonth?: number;
  loginUrl?: string | null;
  warning?: string | null;
  alternativesRuledOut?: string | null;
}) {
  await db.tool.update({ where: { id }, data });
  revalidatePath("/tools");
}

export async function createTool(data: {
  name: string;
  role: string;
  category: string;
  plan?: string;
  costPerMonth: number;
  loginUrl?: string;
}) {
  await db.tool.create({ data });
  revalidatePath("/tools");
}

export async function deleteTool(id: number) {
  await db.tool.delete({ where: { id } });
  revalidatePath("/tools");
}

// ─── Channels CRUD ───
export async function updateChannel(id: number, data: {
  name?: string;
  role?: string;
  priority?: string;
  weeklyTarget?: number;
  unit?: string;
  costPerMonth?: number;
  benchmarks?: string | null;
  bestPractice?: string | null;
  rules?: string | null;
  notes?: string | null;
}) {
  await db.channel.update({ where: { id }, data });
  revalidatePath("/channels");
}

// ─── Compliance + decisions CRUD ───
export async function createComplianceRule(data: { rule: string; reason: string; category: string; severity: string; source?: string; }) {
  await db.complianceRule.create({ data });
  revalidatePath("/brain");
}
export async function updateComplianceRule(id: number, data: { rule?: string; reason?: string; category?: string; severity?: string; }) {
  await db.complianceRule.update({ where: { id }, data });
  revalidatePath("/brain");
}
export async function deleteComplianceRule(id: number) {
  await db.complianceRule.delete({ where: { id } });
  revalidatePath("/brain");
}
export async function createDecisionRule(data: { trigger: string; action: string; sourceModule: string; severity: string; notes?: string; }) {
  await db.decisionRule.create({ data });
  revalidatePath("/brain");
}
export async function updateDecisionRule(id: number, data: { trigger?: string; action?: string; sourceModule?: string; severity?: string; notes?: string | null; }) {
  await db.decisionRule.update({ where: { id }, data });
  revalidatePath("/brain");
}
export async function deleteDecisionRule(id: number) {
  await db.decisionRule.delete({ where: { id } });
  revalidatePath("/brain");
}

// ─── Daily tasks CRUD (add custom mid-day) ───
export async function deleteDailyTask(id: number) {
  await db.dailyTask.delete({ where: { id } });
  revalidatePath("/today");
  revalidatePath("/plan");
}
export async function updateDailyTask(id: number, data: { title?: string; description?: string | null; hoursEstimated?: number; pointsValue?: number; priority?: string; }) {
  await db.dailyTask.update({ where: { id }, data });
  revalidatePath("/today");
  revalidatePath("/plan");
}

// ─── Month + Plan extensibility ───
export async function createCustomDay(data: {
  dayNumber: number;
  monthNumber: number;
  weekNumber: number;
  weekday: string;
  label: string;
  focusArea: string;
  hoursEstimated: number;
  weeklyTheme?: string;
}) {
  await db.day.create({ data: { ...data, isCustom: true } });
  revalidatePath("/plan");
}

export async function createCustomTask(data: {
  dayId: number;
  title: string;
  category: string;
  hoursEstimated: number;
  description?: string;
  deliverable?: string;
  pointsValue: number;
}) {
  const lastTask = await db.dailyTask.findFirst({ where: { dayId: data.dayId }, orderBy: { sortOrder: "desc" } });
  await db.dailyTask.create({
    data: { ...data, sortOrder: (lastTask?.sortOrder ?? 0) + 1 },
  });
  revalidatePath("/today");
  revalidatePath("/plan");
}

export async function cloneDayTo(sourceDayNumber: number, targetDayNumber: number, targetMonth: number, targetWeek: number, targetWeekday: string) {
  const source = await db.day.findUnique({ where: { dayNumber: sourceDayNumber }, include: { tasks: true } });
  if (!source) return;
  const cloned = await db.day.create({
    data: {
      dayNumber: targetDayNumber,
      monthNumber: targetMonth,
      weekNumber: targetWeek,
      weekday: targetWeekday,
      label: `${source.label} (cloned from Day ${sourceDayNumber})`,
      focusArea: source.focusArea,
      hoursEstimated: source.hoursEstimated,
      weeklyTheme: source.weeklyTheme,
      isCustom: true,
    },
  });
  for (const t of source.tasks) {
    await db.dailyTask.create({
      data: {
        dayId: cloned.id,
        title: t.title,
        description: t.description,
        category: t.category,
        hoursEstimated: t.hoursEstimated,
        deliverable: t.deliverable,
        priority: t.priority,
        sortOrder: t.sortOrder,
        pointsValue: t.pointsValue,
        scriptRef: t.scriptRef,
        toolsNeeded: t.toolsNeeded,
      },
    });
  }
  revalidatePath("/plan");
}
