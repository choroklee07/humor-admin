import { createClient, createAdminClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/AdminShell";
import { redirect } from "next/navigation";
import { updateCaptionExample } from "../../actions";

export default async function EditCaptionExamplePage({
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
  const { data: example } = await (supabase as any)
    .from("caption_examples")
    .select("id, image_description, caption, explanation, priority, image_id")
    .eq("id", id)
    .single();

  if (!example) redirect("/caption-examples");

  const inputCls =
    "w-full bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)] rounded px-3 py-2 font-mono text-xs text-[#c8f0ff] placeholder-[rgba(0,212,255,0.2)] focus:outline-none focus:border-[rgba(0,212,255,0.6)] focus:shadow-[0_0_8px_rgba(0,212,255,0.3)]";

  return (
    <AdminShell user={{ email: currentUser?.email }}>
      <div className="p-8 space-y-6 max-w-2xl">
        <div>
          <p className="cyber-label tracking-[0.2em]">{`// CONTENT MANAGEMENT`}</p>
          <h1 className="cyber-text font-mono text-3xl font-bold mt-1">EDIT CAPTION EXAMPLE</h1>
          <p className="cyber-label mt-1 font-mono text-[0.6rem] opacity-50">{example.id}</p>
        </div>

        <div className="cyber-card cyber-corner rounded p-6">
          <form action={updateCaptionExample} className="space-y-5">
            <input type="hidden" name="id" value={example.id} />
            <div className="space-y-1">
              <label className="cyber-label text-[0.6rem]">IMAGE DESCRIPTION *</label>
              <textarea
                name="image_description"
                defaultValue={example.image_description ?? ""}
                rows={3}
                required
                className={`${inputCls} resize-none`}
              />
            </div>
            <div className="space-y-1">
              <label className="cyber-label text-[0.6rem]">CAPTION *</label>
              <textarea
                name="caption"
                defaultValue={example.caption ?? ""}
                rows={3}
                required
                className={`${inputCls} resize-none`}
              />
            </div>
            <div className="space-y-1">
              <label className="cyber-label text-[0.6rem]">EXPLANATION</label>
              <textarea
                name="explanation"
                defaultValue={example.explanation ?? ""}
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </div>
            <div className="space-y-1">
              <label className="cyber-label text-[0.6rem]">PRIORITY</label>
              <input
                name="priority"
                type="number"
                defaultValue={example.priority ?? 0}
                className={inputCls}
              />
            </div>
            <div className="space-y-1">
              <label className="cyber-label text-[0.6rem]">IMAGE ID</label>
              <input
                name="image_id"
                defaultValue={example.image_id ?? ""}
                placeholder="Optional image UUID"
                className={inputCls}
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="cyber-btn rounded px-6 py-2">
                SAVE CHANGES
              </button>
              <a href="/caption-examples" className="cyber-btn cyber-btn-danger rounded px-6 py-2 inline-block text-center">
                CANCEL
              </a>
            </div>
          </form>
        </div>
      </div>
    </AdminShell>
  );
}
