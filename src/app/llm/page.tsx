import { createClient, createAdminClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/AdminShell";
import { createProvider, deleteProvider } from "../llm-providers/actions";
import { createModel, deleteModel } from "../llm-models/actions";
import Link from "next/link";

const inputCls =
  "w-full bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)] rounded px-3 py-2 font-mono text-xs text-[#c8f0ff] placeholder-[rgba(0,212,255,0.2)] focus:outline-none focus:border-[rgba(0,212,255,0.6)] focus:shadow-[0_0_8px_rgba(0,212,255,0.3)]";

const SectionDivider = ({ label }: { label: string }) => (
  <div className="flex items-center gap-4 pt-4">
    <div className="h-px flex-1 bg-[rgba(0,212,255,0.1)]" />
    <p className="cyber-label tracking-[0.25em] text-[0.55rem]">{`// ${label}`}</p>
    <div className="h-px flex-1 bg-[rgba(0,212,255,0.1)]" />
  </div>
);

export default async function LlmPage() {
  const sessionClient = await createClient();
  const {
    data: { user: currentUser },
  } = await sessionClient.auth.getUser();

  const supabase = createAdminClient();
  const [{ data: providers }, { data: models }, { data: chains }, { data: responses }, { count: chainsTotal }, { count: responsesTotal }] =
    await Promise.all([
      (supabase as any)
        .from("llm_providers")
        .select("id, name, created_datetime_utc")
        .order("id", { ascending: true }),
      (supabase as any)
        .from("llm_models")
        .select("id, name, provider_model_id, is_temperature_supported, created_datetime_utc, llm_providers(name)")
        .order("id", { ascending: true }),
      (supabase as any)
        .from("llm_prompt_chains")
        .select("id, created_datetime_utc, caption_request_id")
        .order("created_datetime_utc", { ascending: false })
        .limit(50),
      (supabase as any)
        .from("llm_model_responses")
        .select("id, created_datetime_utc, processing_time_seconds, llm_temperature, llm_model_response, llm_models(name), profiles(email), humor_flavors(slug)")
        .order("created_datetime_utc", { ascending: false })
        .limit(50),
      supabase.from("llm_prompt_chains").select("*", { count: "exact", head: true }),
      supabase.from("llm_model_responses").select("*", { count: "exact", head: true }),
    ]);

  return (
    <AdminShell user={{ email: currentUser?.email }}>
      <div className="p-8 space-y-8">
        <div>
          <p className="cyber-label tracking-[0.2em]">{`// LLM CONFIGURATION`}</p>
          <h1 className="cyber-text font-mono text-3xl font-bold mt-1">LLM</h1>
        </div>

        {/* ── PROVIDERS ── */}
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <h2 className="cyber-text font-mono text-lg font-bold">PROVIDERS</h2>
            <span className="cyber-label text-[0.6rem]">{providers?.length ?? 0} RECORDS</span>
          </div>

          <div className="cyber-card cyber-corner rounded p-6">
            <p className="cyber-label mb-4 tracking-[0.15em]">{`// ADD NEW PROVIDER`}</p>
            <form action={createProvider} className="flex gap-4 items-end">
              <div className="space-y-1 flex-1">
                <label className="cyber-label text-[0.6rem]">NAME *</label>
                <input name="name" required placeholder="e.g. Anthropic" className={inputCls} />
              </div>
              <button type="submit" className="cyber-btn rounded px-5 py-2">CREATE</button>
            </form>
          </div>

          <div className="cyber-card rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-[rgba(0,212,255,0.15)]">
                    {["ID", "NAME", "CREATED", "ACTIONS"].map((h) => (
                      <th key={h} className="cyber-label px-4 py-3 text-left font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {providers?.map((p: any) => (
                    <tr key={p.id} className="border-b border-[rgba(0,212,255,0.06)] hover:bg-[rgba(0,212,255,0.03)] transition-colors">
                      <td className="px-4 py-3 cyber-label">{p.id}</td>
                      <td className="px-4 py-3 text-[#c8f0ff] font-bold">{p.name}</td>
                      <td className="px-4 py-3 text-[rgba(200,240,255,0.4)]">{new Date(p.created_datetime_utc).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link href={`/llm-providers/${p.id}/edit`} className="cyber-btn rounded px-3 py-1 text-[0.6rem] inline-block">EDIT</Link>
                          <form action={deleteProvider}>
                            <input type="hidden" name="id" value={p.id} />
                            <button type="submit" className="cyber-btn cyber-btn-danger rounded px-3 py-1 text-[0.6rem]">DELETE</button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <SectionDivider label="LLM MODELS" />

        {/* ── MODELS ── */}
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <h2 className="cyber-text font-mono text-lg font-bold">MODELS</h2>
            <span className="cyber-label text-[0.6rem]">{models?.length ?? 0} RECORDS</span>
          </div>

          <div className="cyber-card cyber-corner rounded p-6">
            <p className="cyber-label mb-4 tracking-[0.15em]">{`// ADD NEW MODEL`}</p>
            <form action={createModel} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="cyber-label text-[0.6rem]">DISPLAY NAME *</label>
                  <input name="name" required placeholder="e.g. Claude 3 Opus" className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className="cyber-label text-[0.6rem]">PROVIDER MODEL ID *</label>
                  <input name="provider_model_id" required placeholder="e.g. claude-opus-4-6" className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className="cyber-label text-[0.6rem]">PROVIDER *</label>
                  <select name="llm_provider_id" required className={inputCls}>
                    <option value="">— select provider —</option>
                    {providers?.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="is_temperature_supported" className="accent-[#00d4ff]" />
                    <span className="cyber-label text-[0.65rem]">TEMPERATURE SUPPORTED</span>
                  </label>
                </div>
              </div>
              <button type="submit" className="cyber-btn rounded px-5 py-2">CREATE</button>
            </form>
          </div>

          <div className="cyber-card rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-[rgba(0,212,255,0.15)]">
                    {["ID", "NAME", "PROVIDER MODEL ID", "PROVIDER", "TEMP", "CREATED", "ACTIONS"].map((h) => (
                      <th key={h} className="cyber-label px-4 py-3 text-left font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {models?.map((m: any) => (
                    <tr key={m.id} className="border-b border-[rgba(0,212,255,0.06)] hover:bg-[rgba(0,212,255,0.03)] transition-colors">
                      <td className="px-4 py-3 cyber-label">{m.id}</td>
                      <td className="px-4 py-3 text-[#c8f0ff] font-bold">{m.name}</td>
                      <td className="px-4 py-3 text-[rgba(200,240,255,0.6)]">{m.provider_model_id}</td>
                      <td className="px-4 py-3 text-[rgba(200,240,255,0.7)]">{m.llm_providers?.name ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[0.6rem] tracking-wider border ${m.is_temperature_supported ? "border-[#00d4ff] text-[#00d4ff] bg-[rgba(0,212,255,0.08)]" : "border-[rgba(0,212,255,0.2)] text-[rgba(0,212,255,0.3)]"}`}>{m.is_temperature_supported ? "YES" : "NO"}</span>
                      </td>
                      <td className="px-4 py-3 text-[rgba(200,240,255,0.4)]">{new Date(m.created_datetime_utc).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link href={`/llm-models/${m.id}/edit`} className="cyber-btn rounded px-3 py-1 text-[0.6rem] inline-block">EDIT</Link>
                          <form action={deleteModel}>
                            <input type="hidden" name="id" value={m.id} />
                            <button type="submit" className="cyber-btn cyber-btn-danger rounded px-3 py-1 text-[0.6rem]">DELETE</button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <SectionDivider label="PROMPT CHAINS" />

        {/* ── PROMPT CHAINS ── */}
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <h2 className="cyber-text font-mono text-lg font-bold">PROMPT CHAINS</h2>
            <span className="cyber-label text-[0.6rem]">{chainsTotal ?? 0} TOTAL · SHOWING LATEST 50</span>
          </div>
          <div className="cyber-card rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-[rgba(0,212,255,0.15)]">
                    {["ID", "CAPTION REQUEST ID", "CREATED"].map((h) => (
                      <th key={h} className="cyber-label px-4 py-3 text-left font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chains?.map((c: any) => (
                    <tr key={c.id} className="border-b border-[rgba(0,212,255,0.06)] hover:bg-[rgba(0,212,255,0.03)] transition-colors">
                      <td className="px-4 py-3 cyber-label">{c.id}</td>
                      <td className="px-4 py-3 text-[rgba(200,240,255,0.7)]">{c.caption_request_id}</td>
                      <td className="px-4 py-3 text-[rgba(200,240,255,0.4)]">{new Date(c.created_datetime_utc).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <SectionDivider label="LLM RESPONSES" />

        {/* ── LLM RESPONSES ── */}
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <h2 className="cyber-text font-mono text-lg font-bold">RESPONSES</h2>
            <span className="cyber-label text-[0.6rem]">{responsesTotal ?? 0} TOTAL · SHOWING LATEST 50</span>
          </div>
          <div className="cyber-card rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-[rgba(0,212,255,0.15)]">
                    {["USER", "MODEL", "FLAVOR", "TEMP", "TIME (s)", "RESPONSE", "CREATED"].map((h) => (
                      <th key={h} className="cyber-label px-4 py-3 text-left font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {responses?.map((r: any) => (
                    <tr key={r.id} className="border-b border-[rgba(0,212,255,0.06)] hover:bg-[rgba(0,212,255,0.03)] transition-colors">
                      <td className="px-4 py-3 text-[rgba(200,240,255,0.6)]">{r.profiles?.email ?? "—"}</td>
                      <td className="px-4 py-3 text-[rgba(200,240,255,0.8)]">{r.llm_models?.name ?? "—"}</td>
                      <td className="px-4 py-3"><span className="text-[#00d4ff]">{r.humor_flavors?.slug ?? "—"}</span></td>
                      <td className="px-4 py-3 text-[rgba(200,240,255,0.5)]">{r.llm_temperature ?? "—"}</td>
                      <td className="px-4 py-3 cyber-value">{r.processing_time_seconds}</td>
                      <td className="px-4 py-3 max-w-[240px]"><span className="text-[rgba(200,240,255,0.7)] block truncate" title={r.llm_model_response ?? ""}>{r.llm_model_response ?? <span className="opacity-30">—</span>}</span></td>
                      <td className="px-4 py-3 text-[rgba(200,240,255,0.4)]">{new Date(r.created_datetime_utc).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </div>
    </AdminShell>
  );
}
