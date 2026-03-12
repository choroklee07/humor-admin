import { createClient, createAdminClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/AdminShell";
import { createTerm, deleteTerm } from "./actions";
import Link from "next/link";

const inputCls =
  "w-full bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)] rounded px-3 py-2 font-mono text-xs text-[#c8f0ff] placeholder-[rgba(0,212,255,0.2)] focus:outline-none focus:border-[rgba(0,212,255,0.6)] focus:shadow-[0_0_8px_rgba(0,212,255,0.3)]";

export default async function TermsPage() {
  const sessionClient = await createClient();
  const {
    data: { user: currentUser },
  } = await sessionClient.auth.getUser();

  const supabase = createAdminClient();
  const [{ data: terms }, { data: termTypes }] = await Promise.all([
    (supabase as any)
      .from("terms")
      .select("id, term, definition, example, priority, created_datetime_utc, term_types(name)")
      .order("priority", { ascending: false })
      .order("id", { ascending: true }),
    (supabase as any).from("term_types").select("id, name").order("id"),
  ]);

  return (
    <AdminShell user={{ email: currentUser?.email }}>
      <div className="p-8 space-y-6">
        <div>
          <p className="cyber-label tracking-[0.2em]">{`// CONTENT MANAGEMENT`}</p>
          <h1 className="cyber-text font-mono text-3xl font-bold mt-1">TERMS</h1>
          <p className="cyber-label mt-1">{terms?.length ?? 0} TOTAL RECORDS</p>
        </div>

        {/* Create form */}
        <div className="cyber-card cyber-corner rounded p-6">
          <p className="cyber-label mb-4 tracking-[0.15em]">{`// ADD NEW TERM`}</p>
          <form action={createTerm} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="cyber-label text-[0.6rem]">TERM *</label>
                <input name="term" required placeholder="e.g. Deadpan" className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className="cyber-label text-[0.6rem]">TYPE</label>
                <select name="term_type_id" className={inputCls}>
                  <option value="">— none —</option>
                  {termTypes?.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="cyber-label text-[0.6rem]">DEFINITION *</label>
              <textarea name="definition" required rows={2} placeholder="Definition..." className={inputCls + " resize-none"} />
            </div>
            <div className="space-y-1">
              <label className="cyber-label text-[0.6rem]">EXAMPLE *</label>
              <textarea name="example" required rows={2} placeholder="Example usage..." className={inputCls + " resize-none"} />
            </div>
            <div className="flex items-center gap-4">
              <div className="space-y-1">
                <label className="cyber-label text-[0.6rem]">PRIORITY</label>
                <input
                  name="priority"
                  type="number"
                  defaultValue={0}
                  className="w-24 bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)] rounded px-3 py-2 font-mono text-xs text-[#c8f0ff] focus:outline-none focus:border-[rgba(0,212,255,0.6)]"
                />
              </div>
              <div className="pt-5">
                <button type="submit" className="cyber-btn rounded px-5 py-2">
                  CREATE
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Table */}
        <div className="cyber-card rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-[rgba(0,212,255,0.15)]">
                  {["TERM", "TYPE", "DEFINITION", "PRIORITY", "CREATED", "ACTIONS"].map((h) => (
                    <th key={h} className="cyber-label px-4 py-3 text-left font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {terms?.map((term: any) => (
                  <tr
                    key={term.id}
                    className="border-b border-[rgba(0,212,255,0.06)] hover:bg-[rgba(0,212,255,0.03)] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="text-[#00d4ff] font-bold">{term.term}</span>
                    </td>
                    <td className="px-4 py-3 text-[rgba(200,240,255,0.5)]">
                      {term.term_types?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 max-w-[280px]">
                      <span className="text-[rgba(200,240,255,0.7)] block truncate" title={term.definition}>
                        {term.definition}
                      </span>
                    </td>
                    <td className="px-4 py-3 cyber-value text-center">{term.priority}</td>
                    <td className="px-4 py-3 text-[rgba(200,240,255,0.4)]">
                      {new Date(term.created_datetime_utc).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/terms/${term.id}/edit`}
                          className="cyber-btn rounded px-3 py-1 text-[0.6rem] inline-block"
                        >
                          EDIT
                        </Link>
                        <form action={deleteTerm}>
                          <input type="hidden" name="id" value={term.id} />
                          <button type="submit" className="cyber-btn cyber-btn-danger rounded px-3 py-1 text-[0.6rem]">
                            DELETE
                          </button>
                        </form>
                      </div>
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
