import { db } from "@/lib/db";
import PastClientRow from "@/components/past-client-row";
import NewPastClientForm from "@/components/new-past-client-form";
import { Star } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PastClientsPage() {
  const clients = await db.pastClient.findMany({ orderBy: [{ segment: "asc" }, { name: "asc" }], include: { referrals: true } });
  const a = clients.filter((c) => c.segment === "A");
  const b = clients.filter((c) => c.segment === "B");
  const c = clients.filter((c) => c.segment === "C");

  const stats = {
    total: clients.length,
    contacted: clients.filter((c) => c.status !== "not_contacted").length,
    replied: clients.filter((c) => c.status === "replied" || c.status === "booked" || c.status === "closed").length,
    booked: clients.filter((c) => c.status === "booked" || c.status === "closed").length,
    closed: clients.filter((c) => c.status === "closed").length,
    loomQueueCount: a.filter((c) => !c.loomRecorded && c.status !== "not_contacted").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">Past Clients <Star className="w-5 h-5 text-warn" /></h1>
        <p className="text-fg-muted text-sm mt-1">#1 highest-ROI activity per RESEARCH. Target: 100+ contacted Week 1 → 2-3 closes + 5-10 referrals in M1.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        <Stat label="Total list" value={stats.total} />
        <Stat label="Contacted" value={stats.contacted} sub={`/ ${stats.total}`} />
        <Stat label="Replied" value={stats.replied} pct={stats.contacted > 0 ? (stats.replied / stats.contacted) * 100 : 0} />
        <Stat label="Booked" value={stats.booked} />
        <Stat label="Closed" value={stats.closed} />
        <Stat label="A-tier Loom queue" value={stats.loomQueueCount} sub="pending" tone={stats.loomQueueCount > 0 ? "warn" : "success"} />
      </div>

      <NewPastClientForm />

      {/* Empty state */}
      {clients.length === 0 && (
        <div className="card p-6 text-center">
          <p className="text-fg-muted mb-4">Empty — start by importing 100-300 contacts from your 4 Fiverr + 2 Upwork accounts (Day 5 task).</p>
          <ol className="text-sm text-fg-muted text-left max-w-md mx-auto space-y-1.5">
            <li>1. Export all-time buyers from each Fiverr / Upwork account</li>
            <li>2. Filter US-based + logistics-related + 4★+</li>
            <li>3. Segment: <span className="pill-success">A</span> repeat 5★ / <span className="pill-info">B</span> single 5★ / <span className="pill">C</span> single ≤4★ (skip)</li>
            <li>4. Add A & B tier here. Skip C.</li>
          </ol>
        </div>
      )}

      {/* By segment */}
      {a.length > 0 && (
        <Section title={`A-tier — repeat 5★ (${a.length})`} subtitle="HIGHEST PRIORITY. Custom 60-90s Loom within 14 days.">
          {a.map((c) => <PastClientRow key={c.id} client={c} />)}
        </Section>
      )}
      {b.length > 0 && (
        <Section title={`B-tier — single 5★ (${b.length})`} subtitle="Personal re-engagement email Week 1.">
          {b.map((c) => <PastClientRow key={c.id} client={c} />)}
        </Section>
      )}
      {c.length > 0 && (
        <Section title={`C-tier — single ≤4★ (${c.length})`} subtitle="Skip in M1. Quarterly value drop only.">
          {c.map((cc) => <PastClientRow key={cc.id} client={cc} />)}
        </Section>
      )}
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3">
        <h2 className="text-base font-semibold">{title}</h2>
        {subtitle && <div className="text-xs text-fg-muted mt-0.5">{subtitle}</div>}
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Stat({ label, value, sub, pct, tone }: { label: string; value: number; sub?: string; pct?: number; tone?: "warn" | "success" }) {
  const border = tone === "warn" ? "border-l-warn" : tone === "success" ? "border-l-success" : "border-l-info";
  return (
    <div className={`card p-3 border-l-4 ${border}`}>
      <div className="text-[10px] uppercase tracking-wider text-fg-muted">{label}</div>
      <div className="text-xl font-bold mt-0.5">{value}{sub && <span className="text-xs text-fg-muted ml-1">{sub}</span>}</div>
      {pct !== undefined && <div className="text-[10px] text-fg-subtle">{pct.toFixed(0)}%</div>}
    </div>
  );
}
