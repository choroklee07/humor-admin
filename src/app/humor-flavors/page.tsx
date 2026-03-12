import { createClient, createAdminClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/AdminShell";

export default async function HumorFlavorsPage() {
  const sessionClient = await createClient();
  const {
    data: { user: currentUser },
  } = await sessionClient.auth.getUser();

  const supabase = createAdminClient();
  const { data: flavors } = await (supabase as any)
    .from("humor_flavors")
    .select("id, slug, description, created_datetime_utc")
    .order("id", { ascending: true });

  return (
    <AdminShell user={{ email: currentUser?.email }}>
      <div className="p-8 space-y-6">
        <div>
          <p className="cyber-label tracking-[0.2em]">{`// AI CONFIGURATION`}</p>
          <h1 className="cyber-text font-mono text-3xl font-bold mt-1">HUMOR FLAVORS</h1>
          <p className="cyber-label mt-1">{flavors?.length ?? 0} TOTAL RECORDS</p>
        </div>

        <div className="cyber-card rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-[rgba(0,212,255,0.15)]">
                  {["ID", "SLUG", "DESCRIPTION", "CREATED"].map((h) => (
                    <th key={h} className="cyber-label px-4 py-3 text-left font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {flavors?.map((flavor: any) => (
                  <tr
                    key={flavor.id}
                    className="border-b border-[rgba(0,212,255,0.06)] hover:bg-[rgba(0,212,255,0.03)] transition-colors"
                  >
                    <td className="px-4 py-3 cyber-label">{flavor.id}</td>
                    <td className="px-4 py-3">
                      <span className="text-[#00d4ff] font-bold tracking-wider">{flavor.slug}</span>
                    </td>
                    <td className="px-4 py-3 max-w-[400px]">
                      <span className="text-[rgba(200,240,255,0.7)] block truncate" title={flavor.description ?? ""}>
                        {flavor.description ?? <span className="opacity-30">—</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[rgba(200,240,255,0.4)]">
                      {new Date(flavor.created_datetime_utc).toLocaleDateString()}
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
