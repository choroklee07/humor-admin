import { createClient, createAdminClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/AdminShell";
import { createDomain, deleteDomain } from "./actions";

const inputCls =
  "w-full bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)] rounded px-3 py-2 font-mono text-xs text-[#c8f0ff] placeholder-[rgba(0,212,255,0.2)] focus:outline-none focus:border-[rgba(0,212,255,0.6)] focus:shadow-[0_0_8px_rgba(0,212,255,0.3)]";

export default async function AllowedDomainsPage() {
  const sessionClient = await createClient();
  const {
    data: { user: currentUser },
  } = await sessionClient.auth.getUser();

  const supabase = createAdminClient();
  const { data: domains } = await (supabase as any)
    .from("allowed_signup_domains")
    .select("id, apex_domain, created_datetime_utc")
    .order("created_datetime_utc", { ascending: false });

  return (
    <AdminShell user={{ email: currentUser?.email }}>
      <div className="p-8 space-y-6">
        <div>
          <p className="cyber-label tracking-[0.2em]">{`// SETTINGS`}</p>
          <h1 className="cyber-text font-mono text-3xl font-bold mt-1">ALLOWED SIGNUP DOMAINS</h1>
          <p className="cyber-label mt-1">{domains?.length ?? 0} TOTAL RECORDS</p>
        </div>

        {/* Create form */}
        <div className="cyber-card cyber-corner rounded p-6">
          <p className="cyber-label mb-4 tracking-[0.15em]">{`// ADD NEW DOMAIN`}</p>
          <form action={createDomain} className="flex gap-4 items-end">
            <div className="space-y-1 flex-1">
              <label className="cyber-label text-[0.6rem]">APEX DOMAIN *</label>
              <input
                name="apex_domain"
                required
                placeholder="e.g. example.com"
                className={inputCls}
              />
            </div>
            <button type="submit" className="cyber-btn rounded px-5 py-2">
              ADD
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="cyber-card rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-[rgba(0,212,255,0.15)]">
                  {["ID", "APEX DOMAIN", "ADDED", "ACTIONS"].map((h) => (
                    <th key={h} className="cyber-label px-4 py-3 text-left font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {domains?.map((domain: any) => (
                  <tr
                    key={domain.id}
                    className="border-b border-[rgba(0,212,255,0.06)] hover:bg-[rgba(0,212,255,0.03)] transition-colors"
                  >
                    <td className="px-4 py-3 cyber-label">{domain.id}</td>
                    <td className="px-4 py-3">
                      <span className="text-[#00ff88] font-bold tracking-wider">{domain.apex_domain}</span>
                    </td>
                    <td className="px-4 py-3 text-[rgba(200,240,255,0.4)]">
                      {new Date(domain.created_datetime_utc).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <form action={deleteDomain}>
                        <input type="hidden" name="id" value={domain.id} />
                        <button type="submit" className="cyber-btn cyber-btn-danger rounded px-3 py-1 text-[0.6rem]">
                          REMOVE
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
