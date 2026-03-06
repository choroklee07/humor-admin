import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/AdminShell";
import { redirect } from "next/navigation";
import { updateImage } from "../../actions";

export default async function EditImagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const { data: image } = await supabase
    .from("images")
    .select("*")
    .eq("id", id)
    .single();

  if (!image) redirect("/images");

  return (
    <AdminShell user={{ email: currentUser?.email }}>
      <div className="p-8 space-y-6 max-w-2xl">
        <div>
          <p className="cyber-label tracking-[0.2em]">{`// EDIT IMAGE`}</p>
          <h1 className="cyber-text font-mono text-3xl font-bold mt-1">
            EDIT IMAGE
          </h1>
          <p className="cyber-label mt-1 font-mono text-[0.6rem] opacity-50">
            {image.id}
          </p>
        </div>

        {image.url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.url}
            alt=""
            className="w-48 h-48 object-cover rounded border border-[rgba(0,212,255,0.3)]"
          />
        )}

        <div className="cyber-card cyber-corner rounded p-6">
          <form action={updateImage} className="space-y-5">
            <input type="hidden" name="id" value={image.id} />
            <div className="space-y-1">
              <label className="cyber-label text-[0.6rem]">IMAGE URL</label>
              <input
                name="url"
                defaultValue={image.url ?? ""}
                className="w-full bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)] rounded px-3 py-2 font-mono text-xs text-[#c8f0ff] focus:outline-none focus:border-[rgba(0,212,255,0.6)] focus:shadow-[0_0_8px_rgba(0,212,255,0.3)]"
              />
            </div>
            <div className="space-y-1">
              <label className="cyber-label text-[0.6rem]">ADDITIONAL CONTEXT</label>
              <textarea
                name="additional_context"
                defaultValue={image.additional_context ?? ""}
                rows={3}
                className="w-full bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)] rounded px-3 py-2 font-mono text-xs text-[#c8f0ff] focus:outline-none focus:border-[rgba(0,212,255,0.6)] focus:shadow-[0_0_8px_rgba(0,212,255,0.3)] resize-none"
              />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_public"
                  defaultChecked={image.is_public ?? false}
                  className="accent-[#00d4ff]"
                />
                <span className="cyber-label text-[0.65rem]">PUBLIC</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_common_use"
                  defaultChecked={image.is_common_use ?? false}
                  className="accent-[#00d4ff]"
                />
                <span className="cyber-label text-[0.65rem]">COMMON USE</span>
              </label>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="cyber-btn rounded px-6 py-2">
                SAVE CHANGES
              </button>
              <a href="/images" className="cyber-btn cyber-btn-danger rounded px-6 py-2 inline-block text-center">
                CANCEL
              </a>
            </div>
          </form>
        </div>
      </div>
    </AdminShell>
  );
}
