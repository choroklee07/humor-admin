import { createClient, createAdminClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/AdminShell";

export default async function HumorFlavorStepsPage() {
  const sessionClient = await createClient();
  const {
    data: { user: currentUser },
  } = await sessionClient.auth.getUser();

  const supabase = createAdminClient();
  const { data: steps } = await (supabase as any)
    .from("humor_flavor_steps")
    .select(
      "id, order_by, description, llm_temperature, llm_system_prompt, llm_user_prompt, created_datetime_utc, humor_flavors(slug), llm_models(name), humor_flavor_step_types(slug)"
    )
    .order("humor_flavor_id", { ascending: true })
    .order("order_by", { ascending: true });

  return (
    <AdminShell user={{ email: currentUser?.email }}>
      <div className="p-8 space-y-6">
        <div>
          <p className="cyber-label tracking-[0.2em]">{`// AI CONFIGURATION`}</p>
          <h1 className="cyber-text font-mono text-3xl font-bold mt-1">HUMOR FLAVOR STEPS</h1>
          <p className="cyber-label mt-1">{steps?.length ?? 0} TOTAL RECORDS</p>
        </div>

        <div className="cyber-card rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-[rgba(0,212,255,0.15)]">
                  {["ID", "FLAVOR", "ORDER", "STEP TYPE", "MODEL", "TEMP", "DESCRIPTION", "CREATED"].map((h) => (
                    <th key={h} className="cyber-label px-4 py-3 text-left font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {steps?.map((step: any) => (
                  <tr
                    key={step.id}
                    className="border-b border-[rgba(0,212,255,0.06)] hover:bg-[rgba(0,212,255,0.03)] transition-colors"
                  >
                    <td className="px-4 py-3 cyber-label">{step.id}</td>
                    <td className="px-4 py-3">
                      <span className="text-[#00d4ff] font-bold">{step.humor_flavors?.slug ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3 cyber-value text-center">{step.order_by}</td>
                    <td className="px-4 py-3 text-[rgba(200,240,255,0.6)]">
                      {step.humor_flavor_step_types?.slug ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-[rgba(200,240,255,0.7)]">
                      {step.llm_models?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-[rgba(200,240,255,0.5)]">
                      {step.llm_temperature ?? "—"}
                    </td>
                    <td className="px-4 py-3 max-w-[240px]">
                      <span
                        className="text-[rgba(200,240,255,0.7)] block truncate"
                        title={step.description ?? ""}
                      >
                        {step.description ?? <span className="opacity-30">—</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[rgba(200,240,255,0.4)]">
                      {new Date(step.created_datetime_utc).toLocaleDateString()}
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
