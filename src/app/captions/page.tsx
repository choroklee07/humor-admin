import { createClient, createAdminClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/AdminShell";
import { toggleFeatured, togglePublic, deleteCaption } from "./actions";
import { createCaptionExample, deleteCaptionExample } from "../caption-examples/actions";
import Link from "next/link";

const inputCls =
  "w-full bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)] rounded px-3 py-2 font-mono text-xs text-[#c8f0ff] placeholder-[rgba(0,212,255,0.2)] focus:outline-none focus:border-[rgba(0,212,255,0.6)] focus:shadow-[0_0_8px_rgba(0,212,255,0.3)]";

const SectionDivider = ({ label }: { label: string }) => (
  <div className="flex items-center gap-4 pt-4">
    <div className="h-px flex-1 bg-[rgba(0,212,255,0.1)]" />
    <p className="cyber-label tracking-[0.25em] text-[0.55rem]">{`// ${label}`}</p>
    <div className="h-px flex-1 bg-[rgba(0,212,255,0.1)]" />
  </div>
);

export default async function CaptionsPage() {
  const sessionClient = await createClient();
  const {
    data: { user: currentUser },
  } = await sessionClient.auth.getUser();

  const supabase = createAdminClient();
  const [{ data: captions }, { data: requests }, { data: examples }, { count: requestsTotal }] =
    await Promise.all([
      (supabase as any)
        .from("captions")
        .select("id, content, is_public, is_featured, like_count, created_datetime_utc, profiles(email), images(url)")
        .order("created_datetime_utc", { ascending: false })
        .limit(100),
      (supabase as any)
        .from("caption_requests")
        .select("id, created_datetime_utc, profiles(email), images(url)")
        .order("created_datetime_utc", { ascending: false })
        .limit(50),
      (supabase as any)
        .from("caption_examples")
        .select("id, image_description, caption, explanation, priority, created_datetime_utc, images(url)")
        .order("priority", { ascending: false })
        .order("id", { ascending: true }),
      supabase.from("caption_requests").select("*", { count: "exact", head: true }),
    ]);

  return (
    <AdminShell user={{ email: currentUser?.email }}>
      <div className="p-8 space-y-8">
        <div>
          <p className="cyber-label tracking-[0.2em]">{`// CAPTION MANAGEMENT`}</p>
          <h1 className="cyber-text font-mono text-3xl font-bold mt-1">CAPTIONS</h1>
        </div>

        {/* ── CAPTIONS ── */}
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <h2 className="cyber-text font-mono text-lg font-bold">CAPTIONS</h2>
            <span className="cyber-label text-[0.6rem]">{captions?.length ?? 0} RECORDS (LATEST 100)</span>
          </div>
          <div className="cyber-card rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-[rgba(0,212,255,0.15)]">
                    {["CONTENT", "AUTHOR", "LIKES", "PUBLIC", "FEATURED", "CREATED", "ACTIONS"].map((h) => (
                      <th key={h} className="cyber-label px-4 py-3 text-left font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {captions?.map((caption: any) => (
                    <tr key={caption.id} className="border-b border-[rgba(0,212,255,0.06)] hover:bg-[rgba(0,212,255,0.03)] transition-colors">
                      <td className="px-4 py-3 max-w-[280px]">
                        <span className="text-[rgba(200,240,255,0.8)] block truncate" title={caption.content ?? ""}>{caption.content ?? <span className="opacity-30">—</span>}</span>
                      </td>
                      <td className="px-4 py-3 text-[rgba(200,240,255,0.5)]">{caption.profiles?.email ?? "—"}</td>
                      <td className="px-4 py-3 cyber-value">{caption.like_count}</td>
                      <td className="px-4 py-3">
                        <form action={togglePublic} className="inline">
                          <input type="hidden" name="id" value={caption.id} />
                          <input type="hidden" name="value" value={String(!caption.is_public)} />
                          <button type="submit" className={`px-2 py-0.5 rounded text-[0.6rem] tracking-wider border transition-all cursor-pointer ${caption.is_public ? "border-[#00d4ff] text-[#00d4ff] bg-[rgba(0,212,255,0.08)] hover:bg-[rgba(0,212,255,0.15)]" : "border-[rgba(0,212,255,0.2)] text-[rgba(0,212,255,0.3)] hover:border-[rgba(0,212,255,0.4)]"}`}>{caption.is_public ? "YES" : "NO"}</button>
                        </form>
                      </td>
                      <td className="px-4 py-3">
                        <form action={toggleFeatured} className="inline">
                          <input type="hidden" name="id" value={caption.id} />
                          <input type="hidden" name="value" value={String(!caption.is_featured)} />
                          <button type="submit" className={`px-2 py-0.5 rounded text-[0.6rem] tracking-wider border transition-all cursor-pointer ${caption.is_featured ? "border-[#00ff88] text-[#00ff88] bg-[rgba(0,255,136,0.08)] hover:bg-[rgba(0,255,136,0.15)]" : "border-[rgba(0,212,255,0.2)] text-[rgba(0,212,255,0.3)] hover:border-[rgba(0,212,255,0.4)]"}`}>{caption.is_featured ? "YES" : "NO"}</button>
                        </form>
                      </td>
                      <td className="px-4 py-3 text-[rgba(200,240,255,0.4)]">{new Date(caption.created_datetime_utc).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <form action={deleteCaption}>
                          <input type="hidden" name="id" value={caption.id} />
                          <button type="submit" className="cyber-btn cyber-btn-danger rounded px-3 py-1 text-[0.6rem]">DELETE</button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <SectionDivider label="CAPTION REQUESTS" />

        {/* ── CAPTION REQUESTS ── */}
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <h2 className="cyber-text font-mono text-lg font-bold">REQUESTS</h2>
            <span className="cyber-label text-[0.6rem]">{requestsTotal ?? 0} TOTAL · SHOWING LATEST 50</span>
          </div>
          <div className="cyber-card rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-[rgba(0,212,255,0.15)]">
                    {["ID", "USER", "IMAGE", "CREATED"].map((h) => (
                      <th key={h} className="cyber-label px-4 py-3 text-left font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests?.map((req: any) => (
                    <tr key={req.id} className="border-b border-[rgba(0,212,255,0.06)] hover:bg-[rgba(0,212,255,0.03)] transition-colors">
                      <td className="px-4 py-3 cyber-label">{req.id}</td>
                      <td className="px-4 py-3 text-[rgba(200,240,255,0.7)]">{req.profiles?.email ?? "—"}</td>
                      <td className="px-4 py-3">
                        {req.images?.url
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={req.images.url} alt="" className="w-10 h-10 object-cover rounded border border-[rgba(0,212,255,0.3)]" />
                          : <span className="text-[rgba(200,240,255,0.3)]">—</span>}
                      </td>
                      <td className="px-4 py-3 text-[rgba(200,240,255,0.4)]">{new Date(req.created_datetime_utc).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <SectionDivider label="CAPTION EXAMPLES" />

        {/* ── CAPTION EXAMPLES ── */}
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <h2 className="cyber-text font-mono text-lg font-bold">EXAMPLES</h2>
            <span className="cyber-label text-[0.6rem]">{examples?.length ?? 0} TOTAL RECORDS</span>
          </div>

          <div className="cyber-card cyber-corner rounded p-6">
            <p className="cyber-label mb-4 tracking-[0.15em]">{`// ADD NEW EXAMPLE`}</p>
            <form action={createCaptionExample} className="space-y-4">
              <div className="space-y-1">
                <label className="cyber-label text-[0.6rem]">IMAGE DESCRIPTION *</label>
                <textarea name="image_description" required rows={2} placeholder="Describe the image..." className={inputCls + " resize-none"} />
              </div>
              <div className="space-y-1">
                <label className="cyber-label text-[0.6rem]">CAPTION *</label>
                <input name="caption" required placeholder="The caption text..." className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className="cyber-label text-[0.6rem]">EXPLANATION *</label>
                <textarea name="explanation" required rows={2} placeholder="Why this caption works..." className={inputCls + " resize-none"} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="cyber-label text-[0.6rem]">IMAGE ID (UUID, optional)</label>
                  <input name="image_id" placeholder="Optional image UUID..." className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className="cyber-label text-[0.6rem]">PRIORITY</label>
                  <input name="priority" type="number" defaultValue={0} className={inputCls} />
                </div>
              </div>
              <button type="submit" className="cyber-btn rounded px-5 py-2">CREATE</button>
            </form>
          </div>

          <div className="cyber-card rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-[rgba(0,212,255,0.15)]">
                    {["IMG", "DESCRIPTION", "CAPTION", "PRIORITY", "CREATED", "ACTIONS"].map((h) => (
                      <th key={h} className="cyber-label px-4 py-3 text-left font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {examples?.map((ex: any) => (
                    <tr key={ex.id} className="border-b border-[rgba(0,212,255,0.06)] hover:bg-[rgba(0,212,255,0.03)] transition-colors">
                      <td className="px-4 py-3">
                        {ex.images?.url
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={ex.images.url} alt="" className="w-10 h-10 object-cover rounded border border-[rgba(0,212,255,0.3)]" />
                          : <span className="text-[rgba(200,240,255,0.3)]">—</span>}
                      </td>
                      <td className="px-4 py-3 max-w-[200px]"><span className="text-[rgba(200,240,255,0.7)] block truncate" title={ex.image_description}>{ex.image_description}</span></td>
                      <td className="px-4 py-3 max-w-[200px]"><span className="text-[#c8f0ff] block truncate" title={ex.caption}>{ex.caption}</span></td>
                      <td className="px-4 py-3 cyber-value text-center">{ex.priority}</td>
                      <td className="px-4 py-3 text-[rgba(200,240,255,0.4)]">{new Date(ex.created_datetime_utc).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link href={`/caption-examples/${ex.id}/edit`} className="cyber-btn rounded px-3 py-1 text-[0.6rem] inline-block">EDIT</Link>
                          <form action={deleteCaptionExample}>
                            <input type="hidden" name="id" value={ex.id} />
                            <button type="submit" className="cyber-btn cyber-btn-danger rounded px-3 py-1 text-[0.6rem]">DELETE</button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </div>
    </AdminShell>
  );
}
