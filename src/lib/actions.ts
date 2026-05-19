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
