import { db } from "@/lib/db";
import ChannelCard from "@/components/channel-card";

export const dynamic = "force-dynamic";

export default async function ChannelsPage() {
  const channels = await db.channel.findMany({ orderBy: { sortOrder: "asc" } });
  const active = channels.filter((c) => c.status === "active");
  const totalActiveCost = active.reduce((s, c) => s + c.costPerMonth, 0);
  const primary = channels.filter((c) => c.priority === "primary");
  const secondary = channels.filter((c) => c.priority === "secondary");

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Channels</h1>
          <p className="text-fg-muted text-sm mt-1">15 outreach channels from RESEARCH §4. Toggle active / paused / hold.</p>
        </div>
        <div className="flex gap-3 text-xs">
          <div className="text-right">
            <div className="text-fg-muted">Active</div>
            <div className="font-semibold text-base">{active.length} / {channels.length}</div>
          </div>
          <div className="text-right">
            <div className="text-fg-muted">Active monthly cost</div>
            <div className="font-semibold text-base">${totalActiveCost}/mo</div>
          </div>
        </div>
      </div>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted mb-3">Primary channels — daily allocation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {primary.map((c) => <ChannelCard key={c.id} channel={c} />)}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted mb-3">Secondary channels — Phase 2 / opportunistic</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {secondary.map((c) => <ChannelCard key={c.id} channel={c} />)}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted mb-3">Hold / Avoid — M3+ or never</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {channels.filter((c) => c.priority === "hold" || c.priority === "avoid").map((c) => <ChannelCard key={c.id} channel={c} />)}
        </div>
      </section>
    </div>
  );
}
