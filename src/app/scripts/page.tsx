import { db } from "@/lib/db";
import ScriptsSearch from "@/components/scripts-search";

export const dynamic = "force-dynamic";

export default async function ScriptsPage() {
  const scripts = await db.script.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }] });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Scripts & Templates</h1>
        <p className="text-fg-muted text-sm mt-1">
          {scripts.length} paste-ready templates · search by keyword, filter by category/persona, one-click copy.
        </p>
      </div>
      <ScriptsSearch scripts={scripts} />
    </div>
  );
}
