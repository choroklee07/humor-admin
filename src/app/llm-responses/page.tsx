import { createClient, createAdminClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/AdminShell";

export default async function LlmResponsesPage() {
  const sessionClient = await createClient();
  const {
    data: { user: currentUser },
  } = await sessionClient.auth.getUser();

  const supabase = createAdminClient();
  const [{ data: responses }, { count: totalCount }] = await Promise.all([
    (supabase as any)
      .from("llm_model_responses")
      .select(
        "id, created_datetime_utc, processing_time_seconds, llm_temperature, llm_model_response, llm_models!llm_model_id(name), profiles!profile_id(email), humor_flavors!humor_flavor_id(slug)"
      )
      .order("created_datetime_utc", { ascending: false })
      .limit(100),
    supabase.from("llm_model_responses").select("*", { count: "exact", head: true }),
  ]);

  return (
    <AdminShell user={{ email: currentUser?.email }}>
      <div className="p-8 space-y-6">
        <div>
          <p className="cyber-label tracking-[0.2em]">{`// AI CONFIGURATION`}</p>
          <h1 className="cyber-text font-mono text-3xl font-bold mt-1">LLM RESPONSES</h1>
          <p className="cyber-label mt-1">{totalCount ?? 0} TOTAL · SHOWING LATEST 100</p>
        </div>

        <div className="cyber-card rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-table">
                  {["USER", "MODEL", "FLAVOR", "TEMP", "TIME (s)", "RESPONSE", "CREATED"].map((h) => (
                    <th key={h} className="cyber-label px-4 py-3 text-left font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {responses?.map((r: any) => (
                  <tr
                    key={r.id}
                    className="border-b border-row-divider hover-row transition-colors"
                  >
                    <td className="px-4 py-3 t-body">
                      {r.profiles?.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 t-body">
                      {r.llm_models?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[#00d4ff]">{r.humor_flavors?.slug ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3 t-dim">
                      {r.llm_temperature ?? "—"}
                    </td>
                    <td className="px-4 py-3 cyber-value">{r.processing_time_seconds}</td>
                    <td className="px-4 py-3 max-w-[280px]">
                      <span
                        className="t-body block truncate"
                        title={r.llm_model_response ?? ""}
                      >
                        {r.llm_model_response ?? <span className="opacity-30">—</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3 t-muted">
                      {new Date(r.created_datetime_utc).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
