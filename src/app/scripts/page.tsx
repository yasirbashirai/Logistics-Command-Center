import { db } from "@/lib/db";
import ScriptCard from "@/components/script-card";

export const dynamic = "force-dynamic";

const CATEGORIES: { key: string; label: string }[] = [
  { key: "email", label: "Email" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "call", label: "Cold Call" },
  { key: "loom", label: "Loom" },
  { key: "discovery", label: "Discovery Call" },
  { key: "referral", label: "Referral" },
  { key: "ad", label: "Paid Ad" },
  { key: "lp", label: "Landing Page" },
];

export default async function ScriptsPage() {
  const scripts = await db.script.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }] });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Scripts & Templates</h1>
        <p className="text-fg-muted text-sm mt-1">
          {scripts.length} paste-ready templates from PLAN §5–9, §12. One-click copy.
        </p>
      </div>

      {/* Jump nav */}
      <nav className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => {
          const count = scripts.filter((s) => s.category === c.key).length;
          if (count === 0) return null;
          return (
            <a key={c.key} href={`#cat-${c.key}`} className="pill hover:bg-brand/10 hover:text-brand hover:border-brand/40">
              {c.label} ({count})
            </a>
          );
        })}
      </nav>

      {CATEGORIES.map((c) => {
        const inCat = scripts.filter((s) => s.category === c.key);
        if (inCat.length === 0) return null;
        return (
          <section key={c.key} id={`cat-${c.key}`}>
            <h2 className="text-base font-semibold uppercase tracking-wider text-fg-muted mb-3">
              {c.label}
            </h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {inCat.map((s) => (
                <ScriptCard
                  key={s.id}
                  scriptKey={s.key}
                  title={s.title}
                  category={s.category}
                  persona={s.persona}
                  subject={s.subject}
                  body={s.body}
                  variables={s.variables}
                  notes={s.notes}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
