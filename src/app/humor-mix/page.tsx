import { createClient, createAdminClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/AdminShell";
import { updateHumorMix } from "./actions";

export default async function HumorMixPage() {
  const sessionClient = await createClient();
  const {
    data: { user: currentUser },
  } = await sessionClient.auth.getUser();

  const supabase = createAdminClient();
  const { data: mix } = await (supabase as any)
    .from("humor_flavor_mix")
    .select("id, caption_count, humor_flavors(slug, description)")
    .order("id", { ascending: true });

  return (
    <AdminShell user={{ email: currentUser?.email }}>
      <div className="p-8 space-y-6">
        <div>
          <p className="cyber-label tracking-[0.2em]">{`// AI CONFIGURATION`}</p>
          <h1 className="cyber-text font-mono text-3xl font-bold mt-1">HUMOR MIX</h1>
          <p className="cyber-label mt-1">CAPTION COUNT PER FLAVOR</p>
        </div>

        <div className="cyber-card rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-table">
                  {["ID", "FLAVOR", "DESCRIPTION", "CAPTION COUNT", ""].map((h) => (
                    <th key={h} className="cyber-label px-4 py-3 text-left font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mix?.map((row: any) => (
                  <tr
                    key={row.id}
                    className="border-b border-row-divider hover-row transition-colors"
                  >
                    <td className="px-4 py-3 cyber-label">{row.id}</td>
                    <td className="px-4 py-3">
                      <span className="text-[#00d4ff] font-bold tracking-wider">
                        {row.humor_flavors?.slug ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[300px]">
                      <span
                        className="t-body block truncate"
                        title={row.humor_flavors?.description ?? ""}
                      >
                        {row.humor_flavors?.description ?? <span className="opacity-30">—</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <form action={updateHumorMix} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={row.id} />
                        <input
                          type="number"
                          name="caption_count"
                          defaultValue={row.caption_count}
                          min={0}
                          className="w-20 input-cyber px-2 py-1"
                        />
                        <button type="submit" className="cyber-btn rounded px-3 py-1 text-[0.6rem]">
                          SAVE
                        </button>
                      </form>
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
