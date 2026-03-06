import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/AdminShell";
import { deleteBugReport } from "./actions";

export default async function BugReportsPage() {
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const { data: bugReports } = await supabase
    .from("bug_reports")
    .select("id, subject, message, created_datetime_utc, profiles(email)")
    .order("created_datetime_utc", { ascending: false });

  return (
    <AdminShell user={{ email: currentUser?.email }}>
      <div className="p-8 space-y-6">
        <div>
          <p className="cyber-label tracking-[0.2em]">{`// ISSUE TRACKER`}</p>
          <h1 className="cyber-text font-mono text-3xl font-bold mt-1">BUG REPORTS</h1>
          <p
            className={`mt-1 font-mono text-[0.68rem] tracking-wider ${
              (bugReports?.length ?? 0) > 0
                ? "text-[#ff003c] [text-shadow:0_0_6px_rgba(255,0,60,0.5)]"
                : "cyber-label"
            }`}
          >
            {bugReports?.length ?? 0} OPEN REPORTS
          </p>
        </div>

        <div className="space-y-4">
          {!bugReports?.length ? (
            <div className="cyber-card rounded p-8 text-center">
              <p className="cyber-label">NO BUG REPORTS</p>
            </div>
          ) : (
            bugReports.map((report) => (
              <div key={report.id} className="cyber-card cyber-corner rounded p-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="cyber-text font-mono text-sm font-semibold">
                      {report.subject ?? (
                        <span className="opacity-40">NO SUBJECT</span>
                      )}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="cyber-label text-[0.6rem]">
                        {(report.profiles as { email: string } | null)?.email ?? "UNKNOWN"}
                      </span>
                      <span className="text-[rgba(0,212,255,0.2)] text-[0.6rem]">•</span>
                      <span className="cyber-label text-[0.6rem]">
                        {new Date(report.created_datetime_utc).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <form action={deleteBugReport}>
                    <input type="hidden" name="id" value={report.id} />
                    <button
                      type="submit"
                      className="cyber-btn cyber-btn-danger rounded px-3 py-1 text-[0.6rem] shrink-0"
                    >
                      DISMISS
                    </button>
                  </form>
                </div>
                {report.message && (
                  <p className="text-[rgba(200,240,255,0.6)] font-mono text-xs leading-relaxed border-t border-[rgba(0,212,255,0.1)] pt-3 whitespace-pre-wrap">
                    {report.message}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </AdminShell>
  );
}
