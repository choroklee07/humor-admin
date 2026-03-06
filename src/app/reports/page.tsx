import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/AdminShell";
import { dismissCaptionReport, dismissImageReport } from "./actions";

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  type CaptionReport = {
    id: string;
    reason: string | null;
    created_datetime_utc: string;
    profiles: { email: string } | null;
    captions: { content: string } | null;
  };
  type ImageReport = {
    id: string;
    reason: string | null;
    created_datetime_utc: string;
    profiles: { email: string } | null;
    images: { url: string } | null;
  };

  const [{ data: captionReports }, { data: imageReports }] = await Promise.all([
    (supabase as any)
      .from("reported_captions")
      .select("id, reason, created_datetime_utc, profiles(email), captions(content)")
      .order("created_datetime_utc", { ascending: false }) as Promise<{ data: CaptionReport[] | null }>,
    (supabase as any)
      .from("reported_images")
      .select("id, reason, created_datetime_utc, profiles(email), images(url)")
      .order("created_datetime_utc", { ascending: false }) as Promise<{ data: ImageReport[] | null }>,
  ]);

  const totalCount = (captionReports?.length ?? 0) + (imageReports?.length ?? 0);

  return (
    <AdminShell user={{ email: currentUser?.email }}>
      <div className="p-8 space-y-8">
        <div>
          <p className="cyber-label tracking-[0.2em]">{`// MODERATION QUEUE`}</p>
          <h1 className="cyber-text font-mono text-3xl font-bold mt-1">REPORTS</h1>
          <p
            className={`mt-1 font-mono text-[0.68rem] tracking-wider ${
              totalCount > 0
                ? "text-[#ff003c] [text-shadow:0_0_6px_rgba(255,0,60,0.5)]"
                : "cyber-label"
            }`}
          >
            {totalCount} PENDING REPORTS
          </p>
        </div>

        {/* Reported Captions */}
        <section className="space-y-3">
          <p className="cyber-label tracking-[0.15em]">
            {`// REPORTED CAPTIONS (${captionReports?.length ?? 0})`}
          </p>
          <div className="cyber-card rounded overflow-hidden">
            {!captionReports?.length ? (
              <p className="cyber-label p-6 text-center">NO REPORTS</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[rgba(0,212,255,0.15)]">
                      {["CAPTION CONTENT", "REPORTER", "REASON", "DATE", "ACTION"].map((h) => (
                        <th key={h} className="cyber-label px-4 py-3 text-left font-normal">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {captionReports.map((report) => (
                      <tr
                        key={report.id}
                        className="border-b border-[rgba(0,212,255,0.06)] hover:bg-[rgba(0,212,255,0.03)] transition-colors"
                      >
                        <td className="px-4 py-3 max-w-[220px]">
                          <span
                            className="text-[rgba(200,240,255,0.7)] block truncate"
                            title={(report.captions as { content: string } | null)?.content ?? ""}
                          >
                            {(report.captions as { content: string } | null)?.content ?? "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[rgba(200,240,255,0.5)]">
                          {(report.profiles as { email: string } | null)?.email ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-[rgba(200,240,255,0.6)] max-w-[180px]">
                          <span className="truncate block" title={report.reason ?? ""}>
                            {report.reason ?? "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[rgba(200,240,255,0.4)]">
                          {new Date(report.created_datetime_utc).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <form action={dismissCaptionReport}>
                            <input type="hidden" name="id" value={report.id} />
                            <button
                              type="submit"
                              className="cyber-btn rounded px-3 py-1 text-[0.6rem]"
                            >
                              DISMISS
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Reported Images */}
        <section className="space-y-3">
          <p className="cyber-label tracking-[0.15em]">
            {`// REPORTED IMAGES (${imageReports?.length ?? 0})`}
          </p>
          <div className="cyber-card rounded overflow-hidden">
            {!imageReports?.length ? (
              <p className="cyber-label p-6 text-center">NO REPORTS</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[rgba(0,212,255,0.15)]">
                      {["PREVIEW", "REPORTER", "REASON", "DATE", "ACTION"].map((h) => (
                        <th key={h} className="cyber-label px-4 py-3 text-left font-normal">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {imageReports.map((report) => (
                      <tr
                        key={report.id}
                        className="border-b border-[rgba(0,212,255,0.06)] hover:bg-[rgba(0,212,255,0.03)] transition-colors"
                      >
                        <td className="px-4 py-3">
                          {(report.images as { url: string } | null)?.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={(report.images as { url: string }).url}
                              alt=""
                              className="w-12 h-12 object-cover rounded border border-[rgba(255,0,60,0.3)]"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded border border-[rgba(0,212,255,0.1)] flex items-center justify-center text-[rgba(0,212,255,0.2)]">
                              —
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[rgba(200,240,255,0.5)]">
                          {(report.profiles as { email: string } | null)?.email ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-[rgba(200,240,255,0.6)] max-w-[180px]">
                          <span className="truncate block" title={report.reason ?? ""}>
                            {report.reason ?? "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[rgba(200,240,255,0.4)]">
                          {new Date(report.created_datetime_utc).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <form action={dismissImageReport}>
                            <input type="hidden" name="id" value={report.id} />
                            <button
                              type="submit"
                              className="cyber-btn rounded px-3 py-1 text-[0.6rem]"
                            >
                              DISMISS
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
