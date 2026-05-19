"use client";

import { useState, useTransition } from "react";
import { Copy, Check, ExternalLink, Edit3, Save, X, Eye, EyeOff } from "lucide-react";
import { updateContentDetails, logContentEngagement } from "@/lib/actions";
import { cn, fmtDate } from "@/lib/utils";
import type { ContentItem } from "@prisma/client";

const PLATFORM_INTENTS: Record<string, { name: string; url: string }> = {
  linkedin: { name: "LinkedIn", url: "https://www.linkedin.com/feed/?shareActive=true" },
  tiktok: { name: "TikTok", url: "https://www.tiktok.com/upload?lang=en" },
  facebook: { name: "Facebook", url: "https://www.facebook.com/" },
  instagram: { name: "Instagram", url: "https://www.instagram.com/" },
  twitter: { name: "X (Twitter)", url: "https://x.com/compose/post" },
  youtube: { name: "YouTube", url: "https://www.youtube.com/upload" },
  beehiiv: { name: "Beehiiv", url: "https://app.beehiiv.com/" },
  landing_page: { name: "Landing Page", url: "https://framer.com" },
};

const STATUSES = [
  { key: "idea", label: "💡 Idea", pill: "pill" },
  { key: "draft", label: "✏️ Draft", pill: "pill-info" },
  { key: "scheduled", label: "🗓 Scheduled", pill: "pill-warn" },
  { key: "published", label: "✅ Published", pill: "pill-success" },
];

export default function ContentEditor({ item }: { item: ContentItem }) {
  const [editing, setEditing] = useState(false);
  const [showEng, setShowEng] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const [form, setForm] = useState({
    title: item.title,
    hookText: item.hookText ?? "",
    body: item.body ?? "",
    postUrl: item.postUrl ?? "",
    imageUrl: item.imageUrl ?? "",
    videoUrl: item.videoUrl ?? "",
    platform: item.platform,
    status: item.status,
    dayOfWeek: item.dayOfWeek ?? "",
    weekNumber: item.weekNumber ?? null,
    likes: item.likes,
    comments: item.comments,
    reach: item.reach,
    shares: item.shares,
    inboundDms: item.inboundDms,
  });

  const save = () => {
    startTransition(() => {
      updateContentDetails(item.id, {
        title: form.title,
        hookText: form.hookText || undefined,
        body: form.body || undefined,
        postUrl: form.postUrl || undefined,
        imageUrl: form.imageUrl || undefined,
        videoUrl: form.videoUrl || undefined,
        platform: form.platform,
        status: form.status,
        dayOfWeek: form.dayOfWeek || null,
        weekNumber: form.weekNumber,
      });
      setEditing(false);
    });
  };

  const saveEngagement = () => {
    startTransition(() => {
      logContentEngagement(item.id, {
        likes: form.likes,
        comments: form.comments,
        reach: form.reach,
        shares: form.shares,
        inboundDms: form.inboundDms,
      });
      setShowEng(false);
    });
  };

  const copyContent = async () => {
    const text = [form.hookText, "", form.body].filter(Boolean).join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const setStatus = (s: string) => {
    setForm({ ...form, status: s });
    startTransition(() => updateContentDetails(item.id, { status: s }));
  };

  const platformInfo = PLATFORM_INTENTS[item.platform] ?? PLATFORM_INTENTS.linkedin;
  const statusInfo = STATUSES.find((s) => s.key === form.status);

  return (
    <div className={cn("card p-4", form.status === "published" && "border-success/30")}>
      {/* Header — always visible */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className={cn("pill text-[10px]", statusInfo?.pill)}>{statusInfo?.label}</span>
            <span className="pill text-[10px]">{platformInfo.name}</span>
            <span className="pill text-[10px]">{item.type.replace("_", " ")}</span>
            {item.dayOfWeek && <span className="pill text-[10px]">{item.dayOfWeek}</span>}
            {item.weekNumber && <span className="pill text-[10px]">Wk {item.weekNumber}</span>}
            {item.publishedAt && (
              <span className="pill-success text-[10px]">📅 {fmtDate(item.publishedAt)}</span>
            )}
          </div>
          {editing ? (
            <input className="input text-sm font-semibold" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          ) : (
            <h3 className="text-sm font-semibold leading-tight">{item.title}</h3>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!editing && (
            <>
              <button onClick={copyContent} className={copied ? "btn-brand text-[10px] py-1" : "btn text-[10px] py-1"}>
                {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
              </button>
              <a href={platformInfo.url} target="_blank" rel="noopener noreferrer" className="btn text-[10px] py-1">
                <ExternalLink className="w-3 h-3" /> {platformInfo.name}
              </a>
              <button onClick={() => setEditing(true)} className="btn-ghost text-[10px] py-1">
                <Edit3 className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hook + body */}
      {editing ? (
        <div className="mt-3 space-y-2">
          <textarea className="input text-xs font-mono" rows={2} placeholder="Hook (first line of the post — must hook in 8 sec)" value={form.hookText} onChange={(e) => setForm({ ...form, hookText: e.target.value })} />
          <textarea className="input text-xs font-mono" rows={8} placeholder="Full body of the post" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <select className="input text-xs py-1" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
              <option value="linkedin">LinkedIn</option>
              <option value="tiktok">TikTok</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="twitter">X (Twitter)</option>
              <option value="youtube">YouTube</option>
              <option value="beehiiv">Beehiiv</option>
              <option value="landing_page">Landing Page</option>
            </select>
            <select className="input text-xs py-1" value={form.dayOfWeek} onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}>
              <option value="">no day slot</option>
              <option value="Mon">Mon</option>
              <option value="Tue">Tue</option>
              <option value="Wed">Wed</option>
              <option value="Thu">Thu</option>
              <option value="Fri">Fri</option>
              <option value="Sat">Sat</option>
              <option value="Sun">Sun</option>
            </select>
            <input type="number" className="input text-xs py-1" placeholder="Wk #" value={form.weekNumber ?? ""} onChange={(e) => setForm({ ...form, weekNumber: e.target.value ? parseInt(e.target.value) : null })} />
            <input className="input text-xs py-1" placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
            <input className="input text-xs py-1" placeholder="Video URL" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} />
            <input className="input text-xs py-1 md:col-span-3" placeholder="Published post URL" value={form.postUrl} onChange={(e) => setForm({ ...form, postUrl: e.target.value })} />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={save} disabled={pending} className="btn-brand text-xs"><Save className="w-3 h-3" /> Save</button>
            <button onClick={() => setEditing(false)} className="btn-ghost text-xs"><X className="w-3 h-3" /> Cancel</button>
          </div>
        </div>
      ) : (
        <>
          {form.hookText && (
            <div className="mt-2 text-xs italic text-fg-muted leading-snug">"{form.hookText}"</div>
          )}
          {form.body && (
            <pre className="mt-2 text-xs font-mono whitespace-pre-wrap bg-bg-sub border border-border rounded-md p-2 max-h-48 overflow-y-auto scrollbar-thin leading-relaxed">{form.body}</pre>
          )}
        </>
      )}

      {/* Status workflow bar */}
      {!editing && (
        <div className="mt-3 pt-3 border-t border-border flex items-center gap-1 flex-wrap">
          {STATUSES.map((s) => (
            <button
              key={s.key}
              onClick={() => setStatus(s.key)}
              className={cn(
                "pill text-[10px] py-1 px-2 transition",
                form.status === s.key ? s.pill : "opacity-30 hover:opacity-100"
              )}
            >
              {s.label}
            </button>
          ))}
          {item.postUrl && (
            <a href={item.postUrl} target="_blank" rel="noopener noreferrer" className="pill-info text-[10px] py-1 px-2 ml-auto">
              <ExternalLink className="w-2.5 h-2.5" /> view live
            </a>
          )}
          {form.status === "published" && (
            <button onClick={() => setShowEng((s) => !s)} className="btn-ghost text-[10px] py-1">
              {showEng ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />} engagement
            </button>
          )}
        </div>
      )}

      {/* Engagement tracker (post-publish) */}
      {showEng && form.status === "published" && (
        <div className="mt-3 grid grid-cols-5 gap-2 p-3 bg-bg-sub rounded-md border border-border">
          {[
            { k: "likes" as const, l: "👍 Likes" },
            { k: "comments" as const, l: "💬 Comments" },
            { k: "reach" as const, l: "👀 Reach" },
            { k: "shares" as const, l: "🔁 Shares" },
            { k: "inboundDms" as const, l: "📩 Inbound DMs" },
          ].map((m) => (
            <label key={m.k} className="text-[10px] uppercase tracking-wider text-fg-muted">
              {m.l}
              <input
                type="number"
                className="input text-xs py-1 mt-0.5"
                value={form[m.k]}
                onChange={(e) => setForm({ ...form, [m.k]: parseInt(e.target.value) || 0 })}
              />
            </label>
          ))}
          <div className="col-span-5 flex items-center gap-2">
            <button onClick={saveEngagement} disabled={pending} className="btn-brand text-xs"><Save className="w-3 h-3" /> Save metrics</button>
          </div>
        </div>
      )}

      {/* Published metrics display (compact) */}
      {form.status === "published" && !showEng && (form.likes + form.comments + form.reach + form.shares + form.inboundDms) > 0 && (
        <div className="mt-2 flex items-center gap-3 text-[10px] text-fg-muted">
          {form.likes > 0 && <span>👍 {form.likes}</span>}
          {form.comments > 0 && <span>💬 {form.comments}</span>}
          {form.reach > 0 && <span>👀 {form.reach.toLocaleString()}</span>}
          {form.shares > 0 && <span>🔁 {form.shares}</span>}
          {form.inboundDms > 0 && <span className="text-success font-semibold">📩 {form.inboundDms} DM{form.inboundDms === 1 ? "" : "s"}</span>}
        </div>
      )}
    </div>
  );
}
