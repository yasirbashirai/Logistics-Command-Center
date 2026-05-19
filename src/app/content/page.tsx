import { db } from "@/lib/db";
import ContentItemRow from "@/components/content-item-row";
import NewContentForm from "@/components/new-content-form";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  linkedin_post: "LinkedIn Posts (4/wk)",
  loom_teardown: "Loom Teardowns (1/wk = 12 in 90d)",
  case_study: "Case Studies",
  ad_creative: "Ad Creatives",
  tiktok: "TikTok Posts",
  newsletter: "Newsletter Issues",
};

const POST_SLOTS = [
  { day: "Mon", topic: "Carousel — '5 things broken on this {persona} site'", color: "border-l-info" },
  { day: "Wed", topic: "Short video — 60-90s tactical tip", color: "border-l-warn" },
  { day: "Fri", topic: "Contrarian text — 1 hot take", color: "border-l-danger" },
  { day: "Sun", topic: "Case study carousel — before/after", color: "border-l-success" },
];

export default async function ContentPage() {
  const items = await db.contentItem.findMany({ orderBy: [{ weekNumber: "asc" }, { id: "asc" }] });
  const byType: Record<string, typeof items> = {};
  for (const i of items) {
    if (!byType[i.type]) byType[i.type] = [];
    byType[i.type].push(i);
  }

  const looms = (byType.loom_teardown ?? []);
  const loomsDone = looms.filter((l) => l.status === "published").length;
  const posts = (byType.linkedin_post ?? []);
  const postsThisWeek = posts.filter((p) => p.status === "published").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Content Engine</h1>
        <p className="text-fg-muted text-sm mt-1">4 LinkedIn posts/week · 1 Loom teardown/week · Cadence from PLAN §7.5, §8.3.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="LinkedIn posts" value={`${postsThisWeek}/4`} sub="this week target 4" />
        <Stat label="Loom teardowns" value={`${loomsDone}/12`} sub="90-day target 12" />
        <Stat label="Case studies" value={`${(byType.case_study ?? []).filter(c => c.status === "published").length}`} sub="lifetime" />
        <Stat label="Ad creatives" value={`${(byType.ad_creative ?? []).length}`} sub="total" />
      </div>

      {/* 4-post weekly cadence visual */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted mb-3">LinkedIn weekly cadence (4 posts)</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {POST_SLOTS.map((s) => (
            <div key={s.day} className={`card p-3 border-l-4 ${s.color}`}>
              <div className="text-xs font-bold uppercase tracking-wider">{s.day}</div>
              <div className="text-[11px] text-fg-muted mt-1 leading-snug">{s.topic}</div>
            </div>
          ))}
        </div>
      </section>

      <NewContentForm />

      {Object.keys(TYPE_LABELS).map((type) => {
        const list = byType[type] ?? [];
        if (list.length === 0) return null;
        return (
          <section key={type}>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted mb-3">
              {TYPE_LABELS[type]} <span className="text-fg-subtle">({list.length})</span>
            </h2>
            <div className="space-y-2">
              {list.map((i) => <ContentItemRow key={i.id} item={i} />)}
            </div>
          </section>
        );
      })}

      {items.length === 0 && (
        <div className="card p-6 text-center text-fg-muted">
          No content tracked yet. Hit "Add content" above to log your first Loom teardown / LinkedIn post / case study.
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="card p-3">
      <div className="text-[10px] uppercase tracking-wider text-fg-muted">{label}</div>
      <div className="text-xl font-bold mt-0.5">{value}</div>
      <div className="text-[10px] text-fg-subtle">{sub}</div>
    </div>
  );
}
