import { db } from "@/lib/db";
import ScriptsSearch from "@/components/scripts-search";
import { NewScriptButton } from "@/components/script-editor";

export const dynamic = "force-dynamic";

export default async function ScriptsPage() {
  const scripts = await db.script.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }] });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Scripts & Templates</h1>
          <p className="text-fg-muted mt-1">
            {scripts.length} paste-ready templates · search · filter · copy · edit · delete · add your own.
          </p>
        </div>
        <NewScriptButton />
      </div>
      <ScriptsSearch scripts={scripts} />
    </div>
  );
}
