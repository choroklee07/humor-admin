import { createClient, createAdminClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/AdminShell";
import { redirect } from "next/navigation";
import { updateModel } from "../../actions";

export default async function EditModelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sessionClient = await createClient();
  const {
    data: { user: currentUser },
  } = await sessionClient.auth.getUser();

  const supabase = createAdminClient();
  const [{ data: model }, { data: providers }] = await Promise.all([
    (supabase as any)
      .from("llm_models")
      .select("id, name, provider_model_id, llm_provider_id, is_temperature_supported")
      .eq("id", id)
      .single(),
    (supabase as any).from("llm_providers").select("id, name").order("id"),
  ]);

  if (!model) redirect("/llm-models");

  const inputCls =
    "w-full bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)] rounded px-3 py-2 font-mono text-xs text-[#c8f0ff] placeholder-[rgba(0,212,255,0.2)] focus:outline-none focus:border-[rgba(0,212,255,0.6)] focus:shadow-[0_0_8px_rgba(0,212,255,0.3)]";

  return (
    <AdminShell user={{ email: currentUser?.email }}>
      <div className="p-8 space-y-6 max-w-2xl">
        <div>
          <p className="cyber-label tracking-[0.2em]">{`// AI CONFIGURATION`}</p>
          <h1 className="cyber-text font-mono text-3xl font-bold mt-1">EDIT LLM MODEL</h1>
          <p className="cyber-label mt-1 font-mono text-[0.6rem] opacity-50">{model.id}</p>
        </div>

        <div className="cyber-card cyber-corner rounded p-6">
          <form action={updateModel} className="space-y-5">
            <input type="hidden" name="id" value={model.id} />
            <div className="space-y-1">
              <label className="cyber-label text-[0.6rem]">NAME *</label>
              <input
                name="name"
                defaultValue={model.name ?? ""}
                required
                className={inputCls}
              />
            </div>
            <div className="space-y-1">
              <label className="cyber-label text-[0.6rem]">PROVIDER MODEL ID *</label>
              <input
                name="provider_model_id"
                defaultValue={model.provider_model_id ?? ""}
                required
                className={inputCls}
              />
            </div>
            <div className="space-y-1">
              <label className="cyber-label text-[0.6rem]">PROVIDER *</label>
              <select
                name="llm_provider_id"
                defaultValue={model.llm_provider_id ?? ""}
                required
                className={inputCls}
              >
                <option value="">Select provider...</option>
                {(providers ?? []).map((p: { id: number; name: string }) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_temperature_supported"
                defaultChecked={model.is_temperature_supported ?? false}
                className="accent-[#00d4ff]"
              />
              <span className="cyber-label text-[0.65rem]">TEMPERATURE SUPPORTED</span>
            </label>
            <div className="flex gap-3">
              <button type="submit" className="cyber-btn rounded px-6 py-2">
                SAVE CHANGES
              </button>
              <a href="/llm-models" className="cyber-btn cyber-btn-danger rounded px-6 py-2 inline-block text-center">
                CANCEL
              </a>
            </div>
          </form>
        </div>
      </div>
    </AdminShell>
  );
}
