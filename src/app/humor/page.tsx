import { createClient, createAdminClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/AdminShell";
import { HumorTabs } from "./HumorTabs";

export default async function HumorPage() {
  const sessionClient = await createClient();
  const {
    data: { user: currentUser },
  } = await sessionClient.auth.getUser();

  const supabase = createAdminClient();
  const [{ data: flavors }, { data: steps }, { data: mix }] = await Promise.all([
    supabase
      .from("humor_flavors")
      .select("id, slug, description, created_datetime_utc")
      .order("id", { ascending: true }),
    supabase
      .from("humor_flavor_steps")
      .select("id, order_by, description, llm_temperature, created_datetime_utc, humor_flavors(slug), llm_models(name), humor_flavor_step_types(slug)")
      .order("humor_flavor_id", { ascending: true })
      .order("order_by", { ascending: true }),
    supabase
      .from("humor_flavor_mix")
      .select("id, caption_count, humor_flavors(slug)")
      .order("id", { ascending: true }),
  ]);

  return (
    <AdminShell user={{ email: currentUser?.email }}>
      <div className="p-8 space-y-6">
        <div>
          <p className="cyber-label tracking-[0.2em]">{`// HUMOR CONFIGURATION`}</p>
          <h1 className="cyber-text font-mono text-3xl font-bold mt-1">HUMOR</h1>
        </div>

        <HumorTabs
          flavors={flavors ?? []}
          steps={steps ?? []}
          mix={mix ?? []}
        />
      </div>
    </AdminShell>
  );
}
