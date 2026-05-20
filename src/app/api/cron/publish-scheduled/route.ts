import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Vercel Cron hits this every 5 min (see vercel.json).
// Picks queued posts whose scheduledFor <= now and publishes via Ayrshare (or per-platform API).
//
// To enable: set AYRSHARE_API_KEY in env, then connect any social account at /settings/connections.
// Until then this endpoint returns the queue size without publishing.

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const due = await db.scheduledPost.findMany({
    where: { status: "queued", scheduledFor: { lte: now } },
  });

  const ayrshareKey = process.env.AYRSHARE_API_KEY;
  if (!ayrshareKey) {
    return NextResponse.json({
      ok: true,
      mode: "dry-run",
      reason: "AYRSHARE_API_KEY not set — install Ayrshare or wire per-platform API and remove this guard",
      queued: due.length,
    });
  }

  const results: Array<{ id: number; status: string; postId?: string; error?: string }> = [];
  for (const p of due) {
    try {
      const res = await fetch("https://app.ayrshare.com/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${ayrshareKey}` },
        body: JSON.stringify({
          post: p.body,
          platforms: [p.platform],
          mediaUrls: p.mediaUrl ? [p.mediaUrl] : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        await db.scheduledPost.update({
          where: { id: p.id },
          data: { status: "published", publishedAt: new Date(), externalPostId: data.id ?? null },
        });
        results.push({ id: p.id, status: "published", postId: data.id });
      } else {
        await db.scheduledPost.update({
          where: { id: p.id },
          data: { status: "failed", errorMessage: JSON.stringify(data).slice(0, 500) },
        });
        results.push({ id: p.id, status: "failed", error: JSON.stringify(data).slice(0, 200) });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      await db.scheduledPost.update({
        where: { id: p.id },
        data: { status: "failed", errorMessage: msg.slice(0, 500) },
      });
      results.push({ id: p.id, status: "failed", error: msg });
    }
  }

  return NextResponse.json({ ok: true, processed: results.length, results });
}
