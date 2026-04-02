import { createClient, createAdminClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/AdminShell";
import { PromptChainRow, type Chain } from "./PromptChainRow";

export default async function LlmPromptChainsPage() {
  const sessionClient = await createClient();
  const {
    data: { user: currentUser },
  } = await sessionClient.auth.getUser();

  const supabase = createAdminClient();
  const [{ data: chains }, { count: totalCount }] = await Promise.all([
    supabase
      .from("llm_prompt_chains")
      .select("id, created_datetime_utc, caption_request_id")
      .order("created_datetime_utc", { ascending: false })
      .limit(100),
    supabase.from("llm_prompt_chains").select("*", { count: "exact", head: true }),
  ]);

  // Fetch responses for these chains separately to avoid nested join issues
  const chainIds = ((chains ?? []) as { id: number }[]).map((c) => c.id);
  const { data: responses } = chainIds.length > 0
    ? await (supabase as any)
        .from("llm_model_responses")
        .select("id, llm_prompt_chain_id, llm_system_prompt, llm_user_prompt, llm_models!llm_model_id(name)")
        .in("llm_prompt_chain_id", chainIds)
        .order("created_datetime_utc", { ascending: true })
    : { data: [] };

  // Group responses by chain id
  const responsesByChain: Record<number, any[]> = {};
  for (const r of responses ?? []) {
    if (!responsesByChain[r.llm_prompt_chain_id]) responsesByChain[r.llm_prompt_chain_id] = [];
    responsesByChain[r.llm_prompt_chain_id].push(r);
  }

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
                  {["ID", "CAPTION REQUEST ID", "STEPS", "CREATED", ""].map((h) => (
                    <th key={h} className="cyber-label px-4 py-3 text-left font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {((chains ?? []) as Chain[]).map((chain) => (
                  <PromptChainRow
                    key={chain.id}
                    chain={chain}
                    responses={responsesByChain[chain.id] ?? []}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
