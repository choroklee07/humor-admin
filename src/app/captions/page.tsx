import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/AdminShell";
import { toggleFeatured, togglePublic, deleteCaption } from "./actions";

export default async function CaptionsPage() {
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  type Caption = {
    id: string;
    content: string | null;
    is_public: boolean | null;
    is_featured: boolean | null;
    like_count: number | null;
    created_datetime_utc: string;
    profiles: { email: string } | null;
    images: { url: string } | null;
  };

  const { data: captions } = (await supabase
    .from("captions")
    .select("id, content, is_public, is_featured, like_count, created_datetime_utc, profiles(email), images(url)")
    .order("created_datetime_utc", { ascending: false })
    .limit(100)) as { data: Caption[] | null };

  return (
    <AdminShell user={{ email: currentUser?.email }}>
      <div className="p-8 space-y-6">
        <div>
          <p className="cyber-label tracking-[0.2em]">{`// CAPTION MANAGEMENT`}</p>
          <h1 className="cyber-text font-mono text-3xl font-bold mt-1">CAPTIONS</h1>
          <p className="cyber-label mt-1">{captions?.length ?? 0} RECORDS (LATEST 100)</p>
        </div>

        <div className="cyber-card rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-[rgba(0,212,255,0.15)]">
                  {["CONTENT", "AUTHOR", "LIKES", "PUBLIC", "FEATURED", "CREATED", "ACTIONS"].map((h) => (
                    <th key={h} className="cyber-label px-4 py-3 text-left font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {captions?.map((caption) => (
                  <tr
                    key={caption.id}
                    className="border-b border-[rgba(0,212,255,0.06)] hover:bg-[rgba(0,212,255,0.03)] transition-colors"
                  >
                    <td className="px-4 py-3 max-w-[280px]">
                      <span
                        className="text-[rgba(200,240,255,0.8)] block truncate"
                        title={caption.content ?? ""}
                      >
                        {caption.content ?? <span className="opacity-30">—</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[rgba(200,240,255,0.5)]">
                      {(caption.profiles as { email: string } | null)?.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 cyber-value">{caption.like_count}</td>
                    <td className="px-4 py-3">
                      <form action={togglePublic} className="inline">
                        <input type="hidden" name="id" value={caption.id} />
                        <input
                          type="hidden"
                          name="value"
                          value={String(!caption.is_public)}
                        />
                        <button
                          type="submit"
                          className={`px-2 py-0.5 rounded text-[0.6rem] tracking-wider border transition-all cursor-pointer ${
                            caption.is_public
                              ? "border-[#00d4ff] text-[#00d4ff] bg-[rgba(0,212,255,0.08)] hover:bg-[rgba(0,212,255,0.15)]"
                              : "border-[rgba(0,212,255,0.2)] text-[rgba(0,212,255,0.3)] hover:border-[rgba(0,212,255,0.4)]"
                          }`}
                        >
                          {caption.is_public ? "YES" : "NO"}
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-3">
                      <form action={toggleFeatured} className="inline">
                        <input type="hidden" name="id" value={caption.id} />
                        <input
                          type="hidden"
                          name="value"
                          value={String(!caption.is_featured)}
                        />
                        <button
                          type="submit"
                          className={`px-2 py-0.5 rounded text-[0.6rem] tracking-wider border transition-all cursor-pointer ${
                            caption.is_featured
                              ? "border-[#00ff88] text-[#00ff88] bg-[rgba(0,255,136,0.08)] hover:bg-[rgba(0,255,136,0.15)]"
                              : "border-[rgba(0,212,255,0.2)] text-[rgba(0,212,255,0.3)] hover:border-[rgba(0,212,255,0.4)]"
                          }`}
                        >
                          {caption.is_featured ? "YES" : "NO"}
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-3 text-[rgba(200,240,255,0.4)]">
                      {new Date(caption.created_datetime_utc).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <form action={deleteCaption}>
                        <input type="hidden" name="id" value={caption.id} />
                        <button
                          type="submit"
                          className="cyber-btn cyber-btn-danger rounded px-3 py-1 text-[0.6rem]"
                        >
                          DELETE
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
