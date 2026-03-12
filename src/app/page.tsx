import { createClient, createAdminClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/AdminShell";
import { LoginRainEffect } from "@/components/LoginRainEffect";
import Link from "next/link";

export default async function DashboardPage() {
  const sessionClient = await createClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  const supabase = createAdminClient();
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: usersCount },
    { count: imagesCount },
    { count: captionsCount },
    { count: reportedCaptionsCount },
    { count: reportedImagesCount },
    { count: bugReportsCount },
    { data: recentCaptions },
    { data: recentUsers },
    { data: memeImageRows },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("images").select("*", { count: "exact", head: true }),
    supabase.from("captions").select("*", { count: "exact", head: true }),
    supabase.from("reported_captions").select("*", { count: "exact", head: true }),
    supabase.from("reported_images").select("*", { count: "exact", head: true }),
    supabase.from("bug_reports").select("*", { count: "exact", head: true }),
    supabase.from("captions").select("created_datetime_utc").gte("created_datetime_utc", fourteenDaysAgo),
    supabase.from("profiles").select("created_datetime_utc").gte("created_datetime_utc", fourteenDaysAgo),
    (supabase as any).from("images").select("url").not("url", "is", null).limit(40) as Promise<{ data: { url: string }[] | null }>,
  ]);

  // Build day buckets for last 14 days
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  });

  const countByDay = (rows: { created_datetime_utc: string }[] | null) => {
    const map: Record<string, number> = {};
    for (const row of rows ?? []) {
      const day = row.created_datetime_utc.slice(0, 10);
      map[day] = (map[day] ?? 0) + 1;
    }
    return map;
  };

  const captionsByDay = countByDay(recentCaptions);
  const usersByDay = countByDay(recentUsers);
  const maxVal = Math.max(1, ...days.map((d) => (captionsByDay[d] ?? 0) + (usersByDay[d] ?? 0)));

  const totalReports = (reportedCaptionsCount ?? 0) + (reportedImagesCount ?? 0);
  const bugs = bugReportsCount ?? 0;
  const hasAlerts = totalReports > 0 || bugs > 0;

  const stats = [
    { label: "USERS", icon: "◈", value: usersCount ?? 0, href: "/users", desc: "registered accounts" },
    { label: "IMAGES", icon: "▣", value: imagesCount ?? 0, href: "/images", desc: "uploaded assets" },
    { label: "CAPTIONS", icon: "❝", value: captionsCount ?? 0, href: "/captions", desc: "user captions" },
    { label: "REPORTS", icon: "⚠", value: totalReports, href: "/reports", desc: "pending review", alert: true },
    { label: "BUG REPORTS", icon: "⬡", value: bugs, href: "/bug-reports", desc: "open issues", alert: true },
  ];

  const now = new Date();
  const timestamp = now.toISOString().replace("T", " ").slice(0, 19) + " UTC";

  return (
    <AdminShell user={{ email: user?.email }}>
      <LoginRainEffect imageUrls={((memeImageRows as { url: string }[] | null) ?? []).map((r) => r.url).filter(Boolean) as string[]} />
      <div className="p-8 space-y-6">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="cyber-label tracking-[0.3em] text-[0.6rem]">{`// SYSTEM STATUS`}</p>
            <h1 className="cyber-text font-mono text-4xl font-bold mt-1 tracking-widest">
              DASHBOARD
            </h1>
          </div>
          <div className="text-right font-mono text-[0.6rem] space-y-1">
            <div className="flex items-center justify-end gap-2">
              <span
                className="inline-block w-2 h-2 rounded-full bg-[#00ff88]"
                style={{ boxShadow: "0 0 6px #00ff88, 0 0 12px #00ff8880" }}
              />
              <span className="cyber-text-green tracking-widest">SYSTEM ONLINE</span>
            </div>
            <p className="cyber-label">{timestamp}</p>
          </div>
        </div>

        {/* Alert banner */}
        {hasAlerts && (
          <div
            className="rounded border border-[#ff003c] bg-[rgba(255,0,60,0.05)] px-5 py-3 font-mono text-xs flex items-center gap-3"
            style={{ boxShadow: "0 0 12px rgba(255,0,60,0.2), inset 0 0 20px rgba(255,0,60,0.03)" }}
          >
            <span className="text-[#ff003c] text-base">⚠</span>
            <span className="text-[#ff003c] tracking-widest" style={{ textShadow: "0 0 8px rgba(255,0,60,0.6)" }}>
              ATTENTION REQUIRED
            </span>
            <span className="cyber-label mx-2">|</span>
            {totalReports > 0 && (
              <span className="cyber-label">
                {totalReports} pending report{totalReports !== 1 ? "s" : ""}
              </span>
            )}
            {bugs > 0 && (
              <span className="cyber-label">
                {totalReports > 0 ? "· " : ""}{bugs} open bug{bugs !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map((stat) => {
            const isAlert = stat.alert && stat.value > 0;
            return (
              <Link
                key={stat.href}
                href={stat.href}
                className="cyber-card cyber-corner rounded p-5 block group transition-all duration-200 hover:bg-[rgba(0,212,255,0.05)] hover:-translate-y-0.5"
                style={isAlert ? { borderColor: "rgba(255,0,60,0.4)", boxShadow: "0 0 12px rgba(255,0,60,0.2), inset 0 0 20px rgba(255,0,60,0.03)" } : undefined}
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="cyber-label text-[0.6rem] tracking-[0.15em]">{stat.label}</p>
                  <span
                    className={`font-mono text-base ${isAlert ? "text-[#ff003c]" : "cyber-text"} opacity-60 group-hover:opacity-100 transition-opacity`}
                    style={isAlert ? { textShadow: "0 0 8px rgba(255,0,60,0.6)" } : undefined}
                  >
                    {stat.icon}
                  </span>
                </div>
                <p
                  className={`font-mono text-4xl font-bold ${
                    isAlert
                      ? "text-[#ff003c] [text-shadow:0_0_12px_rgba(255,0,60,0.7)]"
                      : "cyber-text"
                  }`}
                >
                  {stat.value}
                </p>
                <p className="cyber-label text-[0.55rem] mt-2 opacity-60">{stat.desc}</p>
                <div
                  className={`mt-3 h-px w-full ${isAlert ? "bg-[rgba(255,0,60,0.3)]" : "bg-[rgba(0,212,255,0.15)]"} group-hover:bg-[rgba(0,212,255,0.4)] transition-colors`}
                />
                <p className={`font-mono text-[0.55rem] mt-1.5 tracking-widest ${isAlert ? "text-[rgba(255,0,60,0.5)]" : "cyber-label"} group-hover:cyber-text`}>
                  VIEW →
                </p>
              </Link>
            );
          })}
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Operator info */}
          <div className="cyber-card cyber-corner rounded p-6">
            <p className="cyber-label mb-5 tracking-[0.2em] text-[0.6rem]">{`// OPERATOR INFO`}</p>
            <dl className="space-y-4 font-mono text-sm">
              {[
                { key: "EMAIL", val: user?.email },
                { key: "UID", val: user?.id, small: true },
                { key: "AUTH", val: user?.app_metadata?.provider?.toUpperCase() },
              ].map(({ key, val, small }) => (
                <div key={key} className="flex gap-4">
                  <dt className="cyber-label w-16 shrink-0 pt-px">{key}</dt>
                  <dd className={`cyber-value ${small ? "text-xs opacity-75 break-all" : ""}`}>{val}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Activity graph */}
          <div className="cyber-card cyber-corner rounded p-6">
            <div className="flex items-baseline justify-between mb-4">
              <p className="cyber-label tracking-[0.2em] text-[0.6rem]">{`// ACTIVITY · LAST 14 DAYS`}</p>
              <div className="flex items-center gap-4 font-mono text-[0.55rem]">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2 rounded-sm" style={{ background: "var(--cyber-cyan)", boxShadow: "0 0 4px rgba(0,212,255,0.6)" }} />
                  <span className="cyber-label">CAPTIONS</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2 rounded-sm" style={{ background: "var(--cyber-green)", boxShadow: "0 0 4px rgba(0,255,136,0.6)" }} />
                  <span className="cyber-label">NEW USERS</span>
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              {/* Y-axis */}
              <div className="flex flex-col justify-between pb-5 text-right shrink-0 w-6">
                {[maxVal, Math.round(maxVal / 2), 0].map((tick) => (
                  <span key={tick} className="cyber-label font-mono text-[0.5rem] leading-none">{tick}</span>
                ))}
              </div>

              {/* Chart + x-axis */}
              <div className="flex-1 min-w-0">
                {/* Bars with gridlines */}
                <div className="relative" style={{ height: "100px" }}>
                  {/* Horizontal gridlines */}
                  {[0, 50, 100].map((pct) => (
                    <div
                      key={pct}
                      className="absolute left-0 right-0 h-px bg-[rgba(0,212,255,0.08)]"
                      style={{ top: `${pct}%` }}
                    />
                  ))}
                  {/* Bars */}
                  <div className="absolute inset-0 flex items-end gap-0.5">
                    {days.map((day) => {
                      const c = captionsByDay[day] ?? 0;
                      const u = usersByDay[day] ?? 0;
                      const cH = Math.round((c / maxVal) * 100);
                      const uH = Math.round((u / maxVal) * 100);
                      return (
                        <div
                          key={day}
                          className="flex-1 h-full flex items-end gap-px"
                          title={`${day.slice(5)}: ${c} caption${c !== 1 ? "s" : ""}, ${u} new user${u !== 1 ? "s" : ""}`}
                        >
                          <div
                            className="flex-1 rounded-t-sm transition-opacity"
                            style={{
                              height: `${Math.max(cH, c > 0 ? 2 : 0)}%`,
                              background: "var(--cyber-cyan)",
                              opacity: 0.75,
                              boxShadow: c > 0 ? "0 0 4px rgba(0,212,255,0.5)" : "none",
                            }}
                          />
                          <div
                            className="flex-1 rounded-t-sm"
                            style={{
                              height: `${Math.max(uH, u > 0 ? 2 : 0)}%`,
                              background: "var(--cyber-green)",
                              opacity: 0.75,
                              boxShadow: u > 0 ? "0 0 4px rgba(0,255,136,0.5)" : "none",
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* X-axis labels */}
                <div className="flex gap-0.5 mt-1">
                  {days.map((day, i) => (
                    <div key={day} className="flex-1 text-center">
                      {i % 2 === 0 && (
                        <span className="cyber-label font-mono text-[0.45rem] leading-none">
                          {day.slice(5)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AdminShell>
  );
}
