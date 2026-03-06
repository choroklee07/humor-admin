import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/AdminShell";
import { createImage } from "./actions";
import { ImagesTable } from "./ImagesTable";

export default async function ImagesPage() {
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const [{ data: images }, { count: totalCount }] = await Promise.all([
    supabase
      .from("images")
      .select("id, url, is_public, is_common_use, additional_context, created_datetime_utc, profiles(email)")
      .order("created_datetime_utc", { ascending: false })
      .range(0, 49),
    supabase.from("images").select("*", { count: "exact", head: true }),
  ]);

  return (
    <AdminShell user={{ email: currentUser?.email }}>
      <div className="p-8 space-y-6">
        <div>
          <p className="cyber-label tracking-[0.2em]">{`// MEDIA MANAGEMENT`}</p>
          <h1 className="cyber-text font-mono text-3xl font-bold mt-1">IMAGES</h1>
          <p className="cyber-label mt-1">{totalCount ?? 0} TOTAL RECORDS</p>
        </div>

        {/* Create form */}
        <div className="cyber-card cyber-corner rounded p-6">
          <p className="cyber-label mb-4 tracking-[0.15em]">{`// ADD NEW IMAGE`}</p>
          <form action={createImage} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="cyber-label text-[0.6rem]">IMAGE URL *</label>
                <input
                  name="url"
                  required
                  placeholder="https://..."
                  className="w-full bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)] rounded px-3 py-2 font-mono text-xs text-[#c8f0ff] placeholder-[rgba(0,212,255,0.2)] focus:outline-none focus:border-[rgba(0,212,255,0.6)] focus:shadow-[0_0_8px_rgba(0,212,255,0.3)]"
                />
              </div>
              <div className="space-y-1">
                <label className="cyber-label text-[0.6rem]">ADDITIONAL CONTEXT</label>
                <input
                  name="additional_context"
                  placeholder="Optional description..."
                  className="w-full bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)] rounded px-3 py-2 font-mono text-xs text-[#c8f0ff] placeholder-[rgba(0,212,255,0.2)] focus:outline-none focus:border-[rgba(0,212,255,0.6)] focus:shadow-[0_0_8px_rgba(0,212,255,0.3)]"
                />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_public"
                  className="accent-[#00d4ff]"
                />
                <span className="cyber-label text-[0.65rem]">PUBLIC</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_common_use"
                  defaultChecked
                  className="accent-[#00d4ff]"
                />
                <span className="cyber-label text-[0.65rem]">COMMON USE</span>
              </label>
              <button type="submit" className="cyber-btn rounded px-5 py-2">
                CREATE
              </button>
            </div>
          </form>
        </div>

        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <ImagesTable initialData={(images ?? []) as any} totalCount={totalCount ?? 0} />
      </div>
    </AdminShell>
  );
}
