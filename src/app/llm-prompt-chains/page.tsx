import { createClient, createAdminClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/AdminShell";

export default async function LlmPromptChainsPage() {
  const sessionClient = await createClient();
  const {
    data: { user: currentUser },
  } = await sessionClient.auth.getUser();

  const supabase = createAdminClient();
  const [{ data: chains }, { count: totalCount }] = await Promise.all([
    (supabase as any)
      .from("llm_prompt_chains")
      .select("id, created_datetime_utc, caption_request_id")
      .order("created_datetime_utc", { ascending: false })
      .limit(100),
    supabase.from("llm_prompt_chains").select("*", { count: "exact", head: true }),
  ]);

  return (
    <AdminShell user={{ email: currentUser?.email }}>
      <div className="p-8 space-y-6">
        <div>
          <p className="cyber-label tracking-[0.2em]">{`// AI CONFIGURATION`}</p>
          <h1 className="cyber-text font-mono text-3xl font-bold mt-1">LLM PROMPT CHAINS</h1>
          <p className="cyber-label mt-1">{totalCount ?? 0} TOTAL · SHOWING LATEST 100</p>
        </div>

        <div className="cyber-card rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-[rgba(0,212,255,0.15)]">
                  {["ID", "CAPTION REQUEST ID", "CREATED"].map((h) => (
                    <th key={h} className="cyber-label px-4 py-3 text-left font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chains?.map((chain: any) => (
                  <tr
                    key={chain.id}
                    className="border-b border-[rgba(0,212,255,0.06)] hover:bg-[rgba(0,212,255,0.03)] transition-colors"
                  >
                    <td className="px-4 py-3 cyber-label">{chain.id}</td>
                    <td className="px-4 py-3 text-[rgba(200,240,255,0.7)]">{chain.caption_request_id}</td>
                    <td className="px-4 py-3 text-[rgba(200,240,255,0.4)]">
                      {new Date(chain.created_datetime_utc).toLocaleString()}
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
