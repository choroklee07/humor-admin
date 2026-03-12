import { createClient, createAdminClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/AdminShell";
import { redirect } from "next/navigation";
import { updateTerm } from "../../actions";

export default async function EditTermPage({
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
  const { data: term } = await (supabase as any)
    .from("terms")
    .select("id, term, definition, example, priority, term_type_id")
    .eq("id", id)
    .single();

  if (!term) redirect("/terms");

  const inputCls =
    "w-full bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)] rounded px-3 py-2 font-mono text-xs text-[#c8f0ff] placeholder-[rgba(0,212,255,0.2)] focus:outline-none focus:border-[rgba(0,212,255,0.6)] focus:shadow-[0_0_8px_rgba(0,212,255,0.3)]";

  return (
    <AdminShell user={{ email: currentUser?.email }}>
      <div className="p-8 space-y-6 max-w-2xl">
        <div>
          <p className="cyber-label tracking-[0.2em]">{`// HUMOR MANAGEMENT`}</p>
          <h1 className="cyber-text font-mono text-3xl font-bold mt-1">EDIT TERM</h1>
          <p className="cyber-label mt-1 font-mono text-[0.6rem] opacity-50">{term.id}</p>
        </div>

        <div className="cyber-card cyber-corner rounded p-6">
          <form action={updateTerm} className="space-y-5">
            <input type="hidden" name="id" value={term.id} />
            <div className="space-y-1">
              <label className="cyber-label text-[0.6rem]">TERM *</label>
              <input
                name="term"
                defaultValue={term.term ?? ""}
                required
                className={inputCls}
              />
            </div>
            <div className="space-y-1">
              <label className="cyber-label text-[0.6rem]">DEFINITION</label>
              <textarea
                name="definition"
                defaultValue={term.definition ?? ""}
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </div>
            <div className="space-y-1">
              <label className="cyber-label text-[0.6rem]">EXAMPLE</label>
              <textarea
                name="example"
                defaultValue={term.example ?? ""}
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </div>
            <div className="space-y-1">
              <label className="cyber-label text-[0.6rem]">PRIORITY</label>
              <input
                name="priority"
                type="number"
                defaultValue={term.priority ?? 0}
                className={inputCls}
              />
            </div>
            <div className="space-y-1">
              <label className="cyber-label text-[0.6rem]">TERM TYPE ID</label>
              <input
                name="term_type_id"
                type="number"
                defaultValue={term.term_type_id ?? ""}
                placeholder="Optional"
                className={inputCls}
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="cyber-btn rounded px-6 py-2">
                SAVE CHANGES
              </button>
              <a href="/terms" className="cyber-btn cyber-btn-danger rounded px-6 py-2 inline-block text-center">
                CANCEL
              </a>
            </div>
          </form>
        </div>
      </div>
    </AdminShell>
  );
}
