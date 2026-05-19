import { db } from "@/lib/db";
import ToolRow from "@/components/tool-row";
import { Wallet, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ToolsPage() {
  const tools = await db.tool.findMany({ orderBy: { sortOrder: "asc" } });
  const active = tools.filter((t) => t.status === "active");
  const totalActive = active.reduce((s, t) => s + t.costPerMonth, 0);
  const holding = tools.filter((t) => t.status === "holding");
  const withWarning = tools.filter((t) => t.warning).length;

  // Group by category
  const byCategory: Record<string, typeof tools> = {};
  for (const t of tools) {
    if (!byCategory[t.category]) byCategory[t.category] = [];
    byCategory[t.category].push(t);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Tools Stack</h1>
          <p className="text-fg-muted text-sm mt-1">{tools.length} tools from PLAN §4 + RESEARCH §5. Active M1 cost: ~$264/mo.</p>
        </div>
        <div className="flex gap-3 text-xs">
          <div className="card p-3 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-brand" />
            <div>
              <div className="text-fg-muted text-[10px]">Active monthly</div>
              <div className="font-bold text-lg">${totalActive}</div>
            </div>
          </div>
          <div className="card p-3 flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-success/30 flex items-center justify-center text-[10px] font-bold text-success">{active.length}</div>
            <div>
              <div className="text-fg-muted text-[10px]">Active</div>
              <div className="font-semibold text-sm">/ {tools.length}</div>
            </div>
          </div>
          <div className="card p-3 flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-info/30 flex items-center justify-center text-[10px] font-bold text-info">{holding.length}</div>
            <div>
              <div className="text-fg-muted text-[10px]">Holding</div>
              <div className="font-semibold text-sm">M2 candidates</div>
            </div>
          </div>
          {withWarning > 0 && (
            <div className="card p-3 flex items-center gap-2 border-warn/40">
              <AlertTriangle className="w-4 h-4 text-warn" />
              <div>
                <div className="text-fg-muted text-[10px]">Warnings</div>
                <div className="font-semibold text-sm">{withWarning}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {Object.entries(byCategory).map(([cat, items]) => (
        <section key={cat}>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted mb-2">{cat}</h2>
          <div className="space-y-2">
            {items.map((t) => <ToolRow key={t.id} tool={t} />)}
          </div>
        </section>
      ))}
    </div>
  );
}
