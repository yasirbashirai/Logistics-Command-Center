import { db } from "@/lib/db";
import { ShieldCheck, AlertCircle, Plug } from "lucide-react";
import ConnectionsGrid from "@/components/connections-grid";
import ScheduledPostsList from "@/components/scheduled-posts-list";

export const dynamic = "force-dynamic";

export default async function ConnectionsPage() {
  const accounts = await db.socialAccount.findMany();
  const scheduled = await db.scheduledPost.findMany({ orderBy: { scheduledFor: "asc" }, take: 50 });
  const connectedCount = accounts.filter((a) => a.status === "connected").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><Plug className="w-7 h-7 text-brand" /> Connections</h1>
        <p className="text-fg-muted mt-1">Link social accounts to schedule + auto-publish posts. Manual deep-link composer always available as fallback.</p>
      </div>

      <div className="card p-4 bg-bg-sub/40">
        <div className="flex items-center gap-3">
          <ShieldCheck className={connectedCount > 0 ? "w-5 h-5 text-success" : "w-5 h-5 text-fg-subtle"} />
          <div className="flex-1">
            <div className="text-sm font-semibold">{connectedCount} of 8 platforms connected</div>
            <div className="text-xs text-fg-muted">{connectedCount === 0 ? "Click Connect on any platform below to start. Ayrshare = single setup for all." : "Scheduled posts publish via Vercel Cron once daily (Hobby plan limit). Trigger manually any time by visiting /api/cron/publish-scheduled."}</div>
          </div>
        </div>
      </div>

      <div className="card p-4 border-warn/30">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-warn shrink-0 mt-0.5" />
          <div className="text-sm leading-relaxed">
            <div className="font-semibold mb-1">How real-time scheduling works</div>
            <div className="text-fg-muted">
              Each platform needs an API key or OAuth token. Paste via "Connect" below — stored in your dashboard DB. Scheduled posts publish via Vercel Cron (<code>/api/cron/publish-scheduled</code>) — once daily on Hobby plan, more frequent on Pro. You can also trigger the publisher manually by visiting that URL. Until then, the existing "Copy + Open Composer" workflow keeps working.
            </div>
            <div className="text-fg-muted mt-2">
              <strong>Fastest path:</strong> <a href="https://www.ayrshare.com" target="_blank" className="text-brand underline">Ayrshare</a> ($24/mo) — one key, posts to all platforms. Skip per-platform OAuth approval.
            </div>
          </div>
        </div>
      </div>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted mb-3">Platforms</h2>
        <ConnectionsGrid accounts={accounts} />
      </section>

      {scheduled.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted mb-3">Scheduled queue ({scheduled.length})</h2>
          <ScheduledPostsList posts={scheduled} />
        </section>
      )}
    </div>
  );
}
