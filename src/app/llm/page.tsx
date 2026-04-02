import { createClient, createAdminClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/AdminShell";
import { LlmTabs } from "./LlmTabs";

export default async function LlmPage() {
  const sessionClient = await createClient();
  const {
    data: { user: currentUser },
  } = await sessionClient.auth.getUser();

  const supabase = createAdminClient();
  const [
    { data: providers },
    { data: models },
    { data: chains },
    { count: chainsTotal },
    { data: llmResponses },
    { count: responsesTotal },
  ] = await Promise.all([
    (supabase as any)
      .from("llm_providers")
      .select("id, name, created_datetime_utc")
      .order("id", { ascending: true }),
    (supabase as any)
      .from("llm_models")
      .select("id, name, provider_model_id, is_temperature_supported, created_datetime_utc, llm_providers(name)")
      .order("id", { ascending: true }),
    supabase
      .from("llm_prompt_chains")
      .select("id, created_datetime_utc, caption_request_id")
      .order("created_datetime_utc", { ascending: false })
      .limit(50),
    supabase.from("llm_prompt_chains").select("*", { count: "exact", head: true }),
    (supabase as any)
      .from("llm_model_responses")
      .select("id, created_datetime_utc, processing_time_seconds, llm_temperature, llm_model_response, llm_models!llm_model_id(name), profiles!profile_id(email), humor_flavors!humor_flavor_id(slug)")
      .order("created_datetime_utc", { ascending: false })
      .limit(50),
    supabase.from("llm_model_responses").select("*", { count: "exact", head: true }),
  ]);

  // Fetch prompt responses grouped by chain id separately
  const chainIds = ((chains ?? []) as { id: number }[]).map((c) => c.id);
  const { data: chainResponses } = chainIds.length > 0
    ? await (supabase as any)
        .from("llm_model_responses")
        .select("id, llm_prompt_chain_id, llm_system_prompt, llm_user_prompt, llm_models!llm_model_id(name)")
        .in("llm_prompt_chain_id", chainIds)
        .order("created_datetime_utc", { ascending: true })
    : { data: [] };

  const responsesByChain: Record<number, any[]> = {};
  for (const r of chainResponses ?? []) {
    if (!responsesByChain[r.llm_prompt_chain_id]) responsesByChain[r.llm_prompt_chain_id] = [];
    responsesByChain[r.llm_prompt_chain_id].push(r);
  }

  return (
    <AdminShell user={{ email: currentUser?.email }}>
      <div className="p-8 space-y-6">
        <div>
          <p className="cyber-label tracking-[0.2em]">{`// LLM CONFIGURATION`}</p>
          <h1 className="cyber-text font-mono text-3xl font-bold mt-1">LLM</h1>
        </div>

        <LlmTabs
          providers={providers ?? []}
          models={models ?? []}
          chains={chains ?? []}
          responsesByChain={responsesByChain}
          chainsTotal={chainsTotal ?? 0}
          responses={llmResponses ?? []}
          responsesTotal={responsesTotal ?? 0}
        />
      </div>
    </AdminShell>
  );
}
