import { createClient, createAdminClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/AdminShell";
import Link from "next/link";
import { createDomain, deleteDomain, createEmail, updateEmail, deleteEmail } from "./actions";

const inputCls =
  "w-full bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)] rounded px-3 py-2 font-mono text-xs text-[#c8f0ff] placeholder-[rgba(0,212,255,0.2)] focus:outline-none focus:border-[rgba(0,212,255,0.6)] focus:shadow-[0_0_8px_rgba(0,212,255,0.3)]";

export default async function AllowedDomainsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = tab === "emails" ? "emails" : "domains";

  const sessionClient = await createClient();
  const {
    data: { user: currentUser },
  } = await sessionClient.auth.getUser();

  const supabase = createAdminClient();

  const [{ data: domains }, { data: emails }] = await Promise.all([
    (supabase as any)
      .from("allowed_signup_domains")
      .select("id, apex_domain, created_datetime_utc")
      .order("created_datetime_utc", { ascending: false }),
    (supabase as any)
      .from("whitelist_email_addresses")
      .select("id, email_address, created_datetime_utc")
      .order("created_datetime_utc", { ascending: false }),
  ]);

  return (
    <AdminShell user={{ email: currentUser?.email }}>
      <div className="p-8 space-y-6">
        <div>
          <p className="cyber-label tracking-[0.2em]">{`// SETTINGS`}</p>
          <h1 className="cyber-text font-mono text-3xl font-bold mt-1">ACCESS CONTROL</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[rgba(0,212,255,0.15)]">
          {[
            { key: "domains", label: "ALLOWED DOMAINS", count: domains?.length ?? 0 },
            { key: "emails", label: "WHITELISTED EMAILS", count: emails?.length ?? 0 },
          ].map(({ key, label, count }) => (
            <Link
              key={key}
              href={`/allowed-domains?tab=${key}`}
              className={`px-5 py-2.5 font-mono text-[0.65rem] tracking-widest border-b-2 transition-all ${
                activeTab === key
                  ? "text-[#00d4ff] border-[#00d4ff]"
                  : "text-[rgba(0,212,255,0.35)] border-transparent hover:text-[rgba(0,212,255,0.6)]"
              }`}
            >
              {label}{" "}
              <span className="opacity-50">({count})</span>
            </Link>
          ))}
        </div>

        {activeTab === "domains" && (
          <>
            {/* Create domain form */}
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

            {/* Domains table */}
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
                    {domains?.length ? (
                      domains.map((domain: any) => (
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
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="cyber-label p-6 text-center">NO RECORDS</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === "emails" && (
          <>
            {/* Create email form */}
            <div className="cyber-card cyber-corner rounded p-6">
              <p className="cyber-label mb-4 tracking-[0.15em]">{`// ADD WHITELISTED EMAIL`}</p>
              <form action={createEmail} className="flex gap-4 items-end">
                <div className="space-y-1 flex-1">
                  <label className="cyber-label text-[0.6rem]">EMAIL ADDRESS *</label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="e.g. user@example.com"
                    className={inputCls}
                  />
                </div>
                <button type="submit" className="cyber-btn rounded px-5 py-2">
                  ADD
                </button>
              </form>
            </div>

            {/* Emails table */}
            <div className="cyber-card rounded overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[rgba(0,212,255,0.15)]">
                      {["ID", "EMAIL", "ADDED", "ACTIONS"].map((h) => (
                        <th key={h} className="cyber-label px-4 py-3 text-left font-normal">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {emails?.length ? (
                      emails.map((entry: any) => (
                        <tr
                          key={entry.id}
                          className="border-b border-[rgba(0,212,255,0.06)] hover:bg-[rgba(0,212,255,0.03)] transition-colors group"
                        >
                          <td className="px-4 py-3 cyber-label">{entry.id}</td>
                          <td className="px-4 py-3">
                            <form action={updateEmail} className="flex gap-2 items-center">
                              <input type="hidden" name="id" value={entry.id} />
                              <input
                                name="email"
                                type="email"
                                required
                                defaultValue={entry.email_address}
                                className="bg-transparent border border-transparent group-hover:border-[rgba(0,212,255,0.2)] focus:border-[rgba(0,212,255,0.6)] rounded px-2 py-1 font-mono text-xs text-[#00ff88] font-bold tracking-wider focus:outline-none focus:bg-[rgba(0,212,255,0.05)] w-56"
                              />
                              <button type="submit" className="cyber-btn rounded px-3 py-1 text-[0.6rem] opacity-0 group-hover:opacity-100 transition-opacity">
                                SAVE
                              </button>
                            </form>
                          </td>
                          <td className="px-4 py-3 text-[rgba(200,240,255,0.4)]">
                            {new Date(entry.created_datetime_utc).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <form action={deleteEmail}>
                              <input type="hidden" name="id" value={entry.id} />
                              <button type="submit" className="cyber-btn cyber-btn-danger rounded px-3 py-1 text-[0.6rem]">
                                REMOVE
                              </button>
                            </form>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="cyber-label p-6 text-center">NO RECORDS</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}
