import { db } from "@/lib/db";
import { ShieldAlert, AlertTriangle, Calendar, Users, Lightbulb, XCircle } from "lucide-react";
import { fmtDate, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BrainPage() {
  const [rules, personas, warnings, decisions] = await Promise.all([
    db.complianceRule.findMany({ orderBy: { sortOrder: "asc" } }),
    db.persona.findMany({ include: { objections: true }, orderBy: { id: "asc" } }),
    db.timedWarning.findMany({ orderBy: { eventDate: "asc" } }),
    db.decisionRule.findMany({ orderBy: { id: "asc" } }),
  ]);

  const mandatoryRules = rules.filter((r) => r.severity === "mandatory");
  const recommendedRules = rules.filter((r) => r.severity === "recommended");

  const now = new Date();
  const upcoming = warnings.filter((w) => w.eventDate.getTime() >= now.getTime());
  const past = warnings.filter((w) => w.eventDate.getTime() < now.getTime());

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><ShieldAlert className="w-6 h-6" /> Compliance & Brain</h1>
        <p className="text-fg-muted text-sm mt-1">Hard rules · personas · objection handlers · regulatory warnings · decision matrices</p>
      </div>

      {/* Tab nav (anchor links) */}
      <nav className="flex gap-2 flex-wrap">
        <a href="#rules" className="pill hover:bg-brand/10 hover:text-brand">🚫 Rules ({rules.length})</a>
        <a href="#warnings" className="pill hover:bg-brand/10 hover:text-brand">⚠ Warnings ({warnings.length})</a>
        <a href="#personas" className="pill hover:bg-brand/10 hover:text-brand">👤 Personas ({personas.length})</a>
        <a href="#decisions" className="pill hover:bg-brand/10 hover:text-brand">⚙ Decision rules ({decisions.length})</a>
      </nav>

      {/* Rules */}
      <section id="rules" className="space-y-3 scroll-mt-20">
        <h2 className="text-base font-semibold flex items-center gap-2"><XCircle className="w-4 h-4 text-danger" /> What NOT to Do</h2>
        <div className="space-y-2">
          {mandatoryRules.map((r) => (
            <div key={r.id} className="card p-4 border-l-4 border-l-danger">
              <div className="flex items-start gap-2 mb-1">
                <span className="pill-danger text-[10px]">mandatory</span>
                <span className="pill text-[10px]">{r.category}</span>
              </div>
              <div className="text-sm font-semibold leading-tight">{r.rule}</div>
              <div className="text-xs text-fg-muted mt-1.5 leading-snug">{r.reason}</div>
              {r.source && <div className="text-[10px] text-fg-subtle mt-1">Source: {r.source}</div>}
            </div>
          ))}
          {recommendedRules.map((r) => (
            <div key={r.id} className="card p-3 border-l-4 border-l-warn">
              <div className="flex items-start gap-2 mb-1">
                <span className="pill-warn text-[10px]">recommended</span>
                <span className="pill text-[10px]">{r.category}</span>
              </div>
              <div className="text-sm font-medium leading-tight">{r.rule}</div>
              <div className="text-xs text-fg-muted mt-1 leading-snug">{r.reason}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Warnings */}
      <section id="warnings" className="space-y-3 scroll-mt-20">
        <h2 className="text-base font-semibold flex items-center gap-2"><Calendar className="w-4 h-4 text-warn" /> Dated Warnings</h2>
        {upcoming.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-wider text-fg-muted">Upcoming</h3>
            {upcoming.map((w) => <WarningCard key={w.id} w={w} />)}
          </div>
        )}
        {past.length > 0 && (
          <div className="space-y-2 opacity-70">
            <h3 className="text-xs uppercase tracking-wider text-fg-muted">Already passed (still rules)</h3>
            {past.map((w) => <WarningCard key={w.id} w={w} />)}
          </div>
        )}
      </section>

      {/* Personas */}
      <section id="personas" className="space-y-3 scroll-mt-20">
        <h2 className="text-base font-semibold flex items-center gap-2"><Users className="w-4 h-4" /> Buyer Personas</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {personas.map((p) => (
            <div key={p.id} className="card p-5">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-base font-semibold">{p.name}</h3>
                {p.priorityQuarter && <span className="pill-brand text-[10px]">{p.priorityQuarter}</span>}
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                <Field label="Decision maker" v={p.decisionMaker} />
                <Field label="Influencer" v={p.secondaryInfluencer ?? "—"} />
                <Field label="Budget" v={p.budgetRange} />
                <Field label="Sales cycle" v={p.salesCycle} />
                <Field label="Tech literacy" v={p.techLiteracy ?? "—"} />
                <Field label="Website angle" v={p.websiteAngle} />
              </div>
              <div className="mt-3 border-t border-border pt-3">
                <div className="text-[10px] uppercase tracking-wider text-fg-muted mb-1">Top pains</div>
                <div className="text-[11px] text-fg-muted leading-snug">{p.topPains}</div>
              </div>
              {p.notes && <div className="mt-2 text-[11px] text-fg-muted italic">{p.notes}</div>}
              <details className="mt-3 border-t border-border pt-3">
                <summary className="text-xs font-semibold cursor-pointer hover:text-brand">Objection handlers ({p.objections.length})</summary>
                <div className="mt-2 space-y-2">
                  {p.objections.map((o) => (
                    <div key={o.id} className="text-xs bg-bg-sub border border-border rounded-md p-2">
                      <div className="font-medium">{o.objection}</div>
                      <div className="text-fg-muted italic mt-0.5">↳ Real meaning: {o.realMeaning}</div>
                      <div className="text-fg mt-1 leading-snug">{o.counter}</div>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          ))}
        </div>
      </section>

      {/* Decision rules */}
      <section id="decisions" className="space-y-3 scroll-mt-20">
        <h2 className="text-base font-semibold flex items-center gap-2"><Lightbulb className="w-4 h-4 text-info" /> Decision Rules — If / Then</h2>
        <div className="space-y-2">
          {decisions.map((d) => (
            <div key={d.id} className="card p-3 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-start">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-fg-subtle mb-0.5">IF</div>
                <div className="text-sm font-medium leading-snug">{d.trigger}</div>
              </div>
              <div className="text-fg-subtle hidden md:block self-center">→</div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-fg-subtle mb-0.5">THEN</div>
                <div className="text-sm leading-snug">{d.action}</div>
                <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                  <span className="pill">{d.sourceModule}</span>
                  <span className={cn(
                    "pill",
                    d.severity === "auto-execute" && "pill-success",
                    d.severity === "alert" && "pill-warn",
                    d.severity === "log" && "pill-info"
                  )}>{d.severity}</span>
                  {d.notes && <span className="text-fg-subtle italic">{d.notes}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function WarningCard({ w }: { w: { id: number; title: string; eventDate: Date; type: string; description: string; affectedAreas: string | null; action: string | null } }) {
  const toneIcon = w.type === "opportunity" ? "text-success" : w.type === "regulatory" ? "text-info" : w.type === "sunset" || w.type === "banned" ? "text-danger" : "text-warn";
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <AlertTriangle className={cn("w-4 h-4", toneIcon)} />
            <span className="text-xs font-bold uppercase tracking-wider text-fg-muted">{w.type}</span>
            <span className="pill text-[10px]">{fmtDate(w.eventDate, { month: "short", day: "numeric", year: "numeric" })}</span>
          </div>
          <div className="text-sm font-semibold">{w.title}</div>
          <div className="text-xs text-fg-muted mt-1 leading-snug">{w.description}</div>
          {w.affectedAreas && <div className="text-[11px] text-fg-subtle mt-1">Affects: {w.affectedAreas}</div>}
          {w.action && <div className="text-[11px] text-brand mt-1.5 font-medium leading-snug">→ {w.action}</div>}
        </div>
      </div>
    </div>
  );
}

function Field({ label, v }: { label: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-fg-subtle">{label}</div>
      <div className="text-xs leading-snug">{v}</div>
    </div>
  );
}
