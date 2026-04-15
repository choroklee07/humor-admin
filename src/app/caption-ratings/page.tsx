import { createClient, createAdminClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/AdminShell";
import { StatsTabs } from "./StatsTabs";

const PAGE = 1000;

// PostgREST hard-caps responses at max_rows (default 1000) regardless of .range().
// Fix: get the total count first, then fetch all pages in parallel.
async function fetchAllPages(
  totalCount: number,
  queryFn: (from: number, to: number) => any,
): Promise<any[]> {
  if (totalCount === 0) return [];
  const pageCount = Math.ceil(totalCount / PAGE);
  const results = await Promise.all(
    Array.from({ length: pageCount }, (_, i) =>
      queryFn(i * PAGE, (i + 1) * PAGE - 1)
    )
  );
  return results.flatMap((r: any) => r.data ?? []);
}

export default async function CaptionRatingsPage() {
  const sessionClient = await createClient();
  const {
    data: { user: currentUser },
  } = await sessionClient.auth.getUser();

  const supabase = createAdminClient();

  // Phase 1: counts + small fixed-size queries (all parallel)
  const [
    { count: votesCount },
    { count: captionsCount },
    { data: flavors },
    { data: topCaptions },
    { data: recentVotes },
  ] = await Promise.all([
    (supabase as any)
      .from("caption_votes")
      .select("*", { count: "exact", head: true }),

    (supabase as any)
      .from("captions")
      .select("*", { count: "exact", head: true })
      .not("humor_flavor_id", "is", null),

    supabase
      .from("humor_flavors")
      .select("id, slug, description")
      .order("slug", { ascending: true })
      .range(0, PAGE - 1),

    (supabase as any)
      .from("captions")
      .select("id, content, like_count, humor_flavor_id, humor_flavors!humor_flavor_id(slug)")
      .not("humor_flavor_id", "is", null)
      .order("like_count", { ascending: false })
      .range(0, 19),

    (supabase as any)
      .from("caption_votes")
      .select(
        "id, vote_value, is_from_study, created_datetime_utc, captions!caption_id(content, humor_flavor_id, humor_flavors!humor_flavor_id(slug)), profiles!profile_id(email)"
      )
      .order("created_datetime_utc", { ascending: false })
      .range(0, 49),
  ]);

  // Phase 2: full paginated fetches using counts from phase 1 (both parallel)
  const [votes, captionRows] = await Promise.all([
    fetchAllPages(votesCount ?? 0, (from, to) =>
      (supabase as any)
        .from("caption_votes")
        .select("vote_value, caption_id, is_from_study, captions!caption_id(humor_flavor_id)")
        .order("created_datetime_utc", { ascending: true })
        .range(from, to)
    ),

    fetchAllPages(captionsCount ?? 0, (from, to) =>
      (supabase as any)
        .from("captions")
        .select("humor_flavor_id")
        .not("humor_flavor_id", "is", null)
        .order("created_datetime_utc", { ascending: true })
        .range(from, to)
    ),
  ]);

  // Build per-flavor vote stats
  type FlavorStats = {
    total: number;
    positive: number;
    negative: number;
    sumValue: number;
  };
  const flavorStats: Record<number, FlavorStats> = {};

  for (const vote of votes) {
    const flavorId = (vote as any).captions?.humor_flavor_id;
    if (!flavorId) continue;
    if (!flavorStats[flavorId]) {
      flavorStats[flavorId] = { total: 0, positive: 0, negative: 0, sumValue: 0 };
    }
    const s = flavorStats[flavorId];
    s.total++;
    s.sumValue += (vote as any).vote_value ?? 0;
    if ((vote as any).vote_value > 0) s.positive++;
    else if ((vote as any).vote_value < 0) s.negative++;

  }

  // Build caption count per flavor
  const captionCountByFlavor: Record<number, number> = {};
  for (const row of captionRows) {
    const fid = (row as any).humor_flavor_id;
    captionCountByFlavor[fid] = (captionCountByFlavor[fid] ?? 0) + 1;
  }

  const totalVotes = votes.length;
  const totalPositive = Object.values(flavorStats).reduce((a, s) => a + s.positive, 0);
  const totalNegative = Object.values(flavorStats).reduce((a, s) => a + s.negative, 0);

  // Shape flavor rows for the client component
  const flavorRows = (flavors ?? [])
    .map((flavor: any) => {
      const s = flavorStats[flavor.id];
      const total = s?.total ?? 0;
      const positive = s?.positive ?? 0;
      const negative = s?.negative ?? 0;
      const sumValue = s?.sumValue ?? 0;
      return {
        id: flavor.id,
        slug: flavor.slug,
        captionCount: captionCountByFlavor[flavor.id] ?? 0,
        total,
        positive,
        negative,
        avg: total > 0 ? (sumValue / total).toFixed(2) : "—",
        posRate: total > 0 ? Math.round((positive / total) * 100) : 0,
      };
    })
    .sort((a, b) => b.total - a.total);

  // Top 15 flavors with votes for the chart
  const chartRows = flavorRows.filter((r) => r.total > 0).slice(0, 15);
  const chartMax = chartRows[0]?.total ?? 1;

  // Shape top captions
  const topCaptionRows = (topCaptions ?? []).map((c: any) => ({
    id: c.id,
    content: c.content ?? null,
    like_count: c.like_count,
    flavorSlug: c.humor_flavors?.slug ?? null,
  }));

  // Shape recent votes
  const recentVoteRows = (recentVotes ?? []).map((v: any) => ({
    id: v.id,
    vote_value: v.vote_value,
    created_datetime_utc: v.created_datetime_utc,
    captionContent: v.captions?.content ?? null,
    flavorSlug: v.captions?.humor_flavors?.slug ?? null,
    voterEmail: v.profiles?.email ?? null,
  }));

  return (
    <AdminShell user={{ email: currentUser?.email }}>
      <div className="p-8 space-y-8">

        {/* Header */}
        <div>
          <p className="cyber-label tracking-[0.2em] text-[0.6rem]">{`// ENGAGEMENT ANALYTICS`}</p>
          <h1 className="cyber-text font-mono text-3xl font-bold mt-1">CAPTION RATINGS</h1>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "TOTAL VOTES", value: totalVotes, icon: "◈" },
            { label: "POSITIVE", value: totalPositive, icon: "▲", color: "text-[#00ff88]" },
            { label: "NEGATIVE", value: totalNegative, icon: "▼", color: "text-[#ff003c]" },
            { label: "FLAVORS RATED", value: Object.keys(flavorStats).length, icon: "⬡" },
          ].map((card) => (
            <div key={card.label} className="cyber-card cyber-corner rounded p-5">
              <div className="flex items-start justify-between mb-3">
                <p className="cyber-label text-[0.6rem] tracking-[0.15em]">{card.label}</p>
                <span className={`font-mono text-base opacity-60 ${card.color ?? "cyber-text"}`}>{card.icon}</span>
              </div>
              <p className={`font-mono text-4xl font-bold ${card.color ?? "cyber-text"}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Vote distribution chart */}
        <div className="cyber-card cyber-corner rounded p-6">
          <div className="flex items-baseline justify-between mb-5">
            <div>
              <p className="cyber-label text-[0.6rem] tracking-[0.2em]">{`// VOTE DISTRIBUTION`}</p>
              <h2 className="cyber-text font-mono text-lg font-bold mt-0.5">BY HUMOR FLAVOR</h2>
            </div>
            <div className="flex items-center gap-5 font-mono text-[0.55rem]">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-2 rounded-sm bg-[#00ff88]" style={{ boxShadow: "0 0 4px rgba(0,255,136,0.5)" }} />
                <span className="cyber-label">POSITIVE</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-2 rounded-sm bg-[#ff003c]" style={{ boxShadow: "0 0 4px rgba(255,0,60,0.5)" }} />
                <span className="cyber-label">NEGATIVE</span>
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            {chartRows.map((row) => {
              const posW = (row.positive / chartMax) * 100;
              const negW = (row.negative / chartMax) * 100;
              return (
                <div key={row.id} className="flex items-center gap-3 font-mono text-[0.6rem]">
                  <span className="cyber-label w-44 shrink-0 truncate text-right" title={row.slug}>
                    {row.slug}
                  </span>
                  <div className="flex-1 flex h-4 rounded-sm overflow-hidden bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.08)]">
                    <div
                      style={{ width: `${posW}%`, background: "#00ff88", boxShadow: posW > 0 ? "0 0 6px rgba(0,255,136,0.35)" : "none" }}
                      className="h-full transition-all"
                    />
                    <div
                      style={{ width: `${negW}%`, background: "#ff003c", boxShadow: negW > 0 ? "0 0 6px rgba(255,0,60,0.35)" : "none" }}
                      className="h-full transition-all"
                    />
                  </div>
                  <span className="t-dim w-10 shrink-0 text-right">{row.total}</span>
                  <span className="text-[#00ff88] w-10 shrink-0 text-right">{row.posRate}%</span>
                </div>
              );
            })}
          </div>
        </div>

        <StatsTabs
          flavorRows={flavorRows}
          topCaptions={topCaptionRows}
          recentVotes={recentVoteRows}
        />

      </div>
    </AdminShell>
  );
}
