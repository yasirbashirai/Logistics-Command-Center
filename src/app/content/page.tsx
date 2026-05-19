import { db } from "@/lib/db";
import { getCurrentDayNumber } from "@/lib/scoring";
import ContentEditor from "@/components/content-editor";
import NewContentForm from "@/components/new-content-form";
import { Sparkles, TrendingUp, MessageCircle, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  linkedin_post: "LinkedIn Posts (4/wk)",
  loom_teardown: "Loom Teardowns (1/wk = 12 in 90d)",
  case_study: "Case Studies",
  ad_creative: "Ad Creatives",
  tiktok: "TikTok Posts",
  newsletter: "Newsletter Issues",
};

const POST_SLOTS: { day: string; topic: string; color: string }[] = [
  { day: "Mon", topic: "Carousel — '5 things broken on this {persona} site'", color: "border-l-info" },
  { day: "Wed", topic: "Short video — 60-90s tactical tip", color: "border-l-warn" },
  { day: "Fri", topic: "Contrarian text — 1 hot take", color: "border-l-danger" },
  { day: "Sun", topic: "Case study carousel — before/after", color: "border-l-success" },
];

export default async function ContentPage() {
  const app = await db.appState.findUnique({ where: { id: 1 } });
  const dayN = app ? getCurrentDayNumber(app.startDate, new Date()) : 1;
  const currentWeek = Math.ceil(dayN / 7);

  const items = await db.contentItem.findMany({ orderBy: [{ weekNumber: "asc" }, { id: "asc" }] });
  const byType: Record<string, typeof items> = {};
  for (const i of items) {
    if (!byType[i.type]) byType[i.type] = [];
    byType[i.type].push(i);
  }

  // Weekly grid — show this week's planned posts
  const thisWeekPosts = items.filter((i) => i.weekNumber === currentWeek && i.type === "linkedin_post");
  const postBySlot: Record<string, typeof items[number] | undefined> = {};
  for (const slot of POST_SLOTS) {
    postBySlot[slot.day] = thisWeekPosts.find((p) => p.dayOfWeek === slot.day);
  }

  // Engagement stats (lifetime)
  const totalReach = items.reduce((s, i) => s + i.reach, 0);
  const totalDms = items.reduce((s, i) => s + i.inboundDms, 0);
  const totalEng = items.reduce((s, i) => s + i.likes + i.comments + i.shares, 0);
  const published = items.filter((i) => i.status === "published").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Sparkles className="w-6 h-6 text-brand" /> Content Engine</h1>
        <p className="text-fg-muted text-sm mt-1">
          Cadence: 4 LinkedIn posts/wk (Mon/Wed/Fri/Sun) · 1 Loom teardown/wk · 1-click copy + publish to any platform.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat label="Published" value={`${published}`} sub={`/ ${items.length} total`} tone="success" icon={<Sparkles className="w-3.5 h-3.5" />} />
        <Stat label="This week" value={`${thisWeekPosts.filter(p => p.status === "published").length}/4`} sub={`Week ${currentWeek}`} tone="info" />
        <Stat label="Total reach" value={totalReach > 0 ? totalReach.toLocaleString() : "—"} sub="across all posts" tone="info" icon={<Eye className="w-3.5 h-3.5" />} />
        <Stat label="Engagements" value={totalEng > 0 ? totalEng.toString() : "—"} sub="likes + comments + shares" tone="info" icon={<TrendingUp className="w-3.5 h-3.5" />} />
        <Stat label="Inbound DMs" value={totalDms.toString()} sub="from content" tone={totalDms > 5 ? "success" : "info"} icon={<MessageCircle className="w-3.5 h-3.5" />} />
      </div>

      {/* THIS WEEK's slots — visual weekly calendar */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">This Week (Week {currentWeek}) — LinkedIn slots</h2>
          <span className="text-[11px] text-fg-subtle">Click slot to view/edit post</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {POST_SLOTS.map((slot) => {
            const post = postBySlot[slot.day];
            return (
              <div key={slot.day} className={cn(`card p-3 border-l-4 ${slot.color}`, post?.status === "published" && "ring-2 ring-success/40")}>
                <div className="text-xs font-bold uppercase tracking-wider mb-1">{slot.day}</div>
                <div className="text-[10px] text-fg-muted leading-snug mb-2">{slot.topic}</div>
                {post ? (
                  <a href={`#item-${post.id}`} className="block text-[11px] hover:text-brand">
                    <div className={cn(
                      "pill text-[9px]",
                      post.status === "published" && "pill-success",
                      post.status === "scheduled" && "pill-warn",
                      post.status === "draft" && "pill-info",
                    )}>{post.status}</div>
                    <div className="mt-1 font-medium line-clamp-2 leading-snug">{post.title}</div>
                  </a>
                ) : (
                  <div className="text-[11px] text-fg-subtle italic">empty slot</div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <NewContentForm />

      {/* All items by type */}
      {Object.keys(TYPE_LABELS).map((type) => {
        const list = byType[type] ?? [];
        if (list.length === 0) return null;
        return (
          <section key={type}>
            <h2 className="text-base font-semibold uppercase tracking-wider text-fg-muted mb-3">
              {TYPE_LABELS[type]} <span className="text-fg-subtle text-sm font-normal">({list.length})</span>
            </h2>
            <div className="space-y-3" id={`type-${type}`}>
              {list.map((i) => <div key={i.id} id={`item-${i.id}`} className="scroll-mt-20"><ContentEditor item={i} /></div>)}
            </div>
          </section>
        );
      })}

      {items.length === 0 && (
        <div className="card p-6 text-center text-fg-muted">
          No content yet. Hit "Add content" to log your first LinkedIn post / Loom teardown.
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, sub, tone, icon }: { label: string; value: string; sub: string; tone: "success" | "info" | "warn" | "danger"; icon?: React.ReactNode }) {
  const c = tone === "success" ? "border-l-success" : tone === "warn" ? "border-l-warn" : tone === "danger" ? "border-l-danger" : "border-l-info";
  return (
    <div className={`card p-3 border-l-4 ${c}`}>
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-fg-muted">
        <span>{label}</span>
        {icon && <span className="text-fg-subtle">{icon}</span>}
      </div>
      <div className="text-xl font-bold mt-1">{value}</div>
      <div className="text-[10px] text-fg-subtle">{sub}</div>
    </div>
  );
}
