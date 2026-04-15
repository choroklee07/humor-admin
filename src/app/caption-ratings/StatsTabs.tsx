"use client";

import { useState } from "react";

const TABS = ["BY FLAVOR", "TOP RATED", "RECENT VOTES"] as const;
type Tab = (typeof TABS)[number];

export interface FlavorRow {
  id: number;
  slug: string;
  captionCount: number;
  total: number;
  positive: number;
  negative: number;
  avg: string;
  posRate: number;
}

export interface TopCaption {
  id: string;
  content: string | null;
  like_count: number;
  flavorSlug: string | null;
}

export interface RecentVote {
  id: number;
  vote_value: number;
  created_datetime_utc: string;
  captionContent: string | null;
  flavorSlug: string | null;
  voterEmail: string | null;
}

interface Props {
  flavorRows: FlavorRow[];
  topCaptions: TopCaption[];
  recentVotes: RecentVote[];
}

export function StatsTabs({ flavorRows, topCaptions, recentVotes }: Props) {
  const [active, setActive] = useState<Tab>("BY FLAVOR");

  return (
    <div className="space-y-6">
      {/* Tab buttons */}
      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-5 py-2 font-mono text-[0.65rem] tracking-widest rounded transition-all border ${
              active === tab
                ? "bg-tab-active cyber-text border-tab-active shadow-[0_0_10px_rgba(0,212,255,0.2)]"
                : "t-inactive border-table hover-t-active hover:border-img"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── BY FLAVOR ── */}
      {active === "BY FLAVOR" && (
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <h2 className="cyber-text font-mono text-lg font-bold">BY HUMOR FLAVOR</h2>
            <span className="cyber-label text-[0.6rem]">ORDERED BY VOTE COUNT</span>
          </div>
          <div className="cyber-card rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-table">
                    {["FLAVOR", "CAPTIONS", "TOTAL VOTES", "POSITIVE", "NEGATIVE", "AVG SCORE"].map((h) => (
                      <th key={h} className="cyber-label px-4 py-3 text-left font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {flavorRows.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-6 text-center t-faint">NO DATA</td></tr>
                  )}
                  {flavorRows.map((row) =>
                    row.total === 0 ? (
                      <tr key={row.id} className="border-b border-row-divider hover-row transition-colors">
                        <td className="px-4 py-3 cyber-text">{row.slug}</td>
                        <td className="px-4 py-3 cyber-value">{row.captionCount}</td>
                        <td className="px-4 py-3 t-faint" colSpan={4}>NO VOTES YET</td>
                      </tr>
                    ) : (
                      <tr key={row.id} className="border-b border-row-divider hover-row transition-colors">
                        <td className="px-4 py-3">
                          <span className="cyber-text font-bold">{row.slug}</span>
                        </td>
                        <td className="px-4 py-3 cyber-value">{row.captionCount}</td>
                        <td className="px-4 py-3 cyber-value font-bold">{row.total}</td>
                        <td className="px-4 py-3">
                          <span className="text-[#00ff88]">{row.positive}</span>
                          <span className="t-faint ml-1 text-[0.6rem]">({row.posRate}%)</span>
                          <div className="mt-1.5 h-1 w-20 rounded-full bg-[rgba(255,0,60,0.2)] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#00ff88]"
                              style={{
                                width: `${row.posRate}%`,
                                boxShadow: row.posRate > 0 ? "0 0 4px rgba(0,255,136,0.6)" : "none",
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#ff003c]">{row.negative}</td>
                        <td className="px-4 py-3">
                          <span className={parseFloat(row.avg) > 0 ? "text-[#00ff88]" : parseFloat(row.avg) < 0 ? "text-[#ff003c]" : "t-dim"}>
                            {row.avg}
                          </span>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ── TOP RATED ── */}
      {active === "TOP RATED" && (
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <h2 className="cyber-text font-mono text-lg font-bold">TOP RATED CAPTIONS</h2>
            <span className="cyber-label text-[0.6rem]">BY LIKE COUNT · TOP 20</span>
          </div>
          <div className="cyber-card rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-table">
                    {["RANK", "CONTENT", "FLAVOR", "LIKES"].map((h) => (
                      <th key={h} className="cyber-label px-4 py-3 text-left font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topCaptions.map((caption, i) => (
                    <tr key={caption.id} className="border-b border-row-divider hover-row transition-colors">
                      <td className="px-4 py-3 t-faint text-center w-12">
                        <span className={i < 3 ? "cyber-text font-bold" : ""}>{i + 1}</span>
                      </td>
                      <td className="px-4 py-3 max-w-[360px]">
                        <span className="t-body line-clamp-2 block">
                          {caption.content ?? <span className="t-faint">—</span>}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="cyber-label px-2 py-0.5 rounded border border-[rgba(0,212,255,0.2)] bg-[rgba(0,212,255,0.05)]">
                          {caption.flavorSlug ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 cyber-value font-bold">{caption.like_count}</td>
                    </tr>
                  ))}
                  {topCaptions.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-6 text-center t-faint">NO CAPTIONS FOUND</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ── RECENT VOTES ── */}
      {active === "RECENT VOTES" && (
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <h2 className="cyber-text font-mono text-lg font-bold">RECENT VOTES</h2>
            <span className="cyber-label text-[0.6rem]">LATEST 50 · NEWEST FIRST</span>
          </div>
          <div className="cyber-card rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-table">
                    {["VOTE", "FLAVOR", "CAPTION", "VOTER", "TIME"].map((h) => (
                      <th key={h} className="cyber-label px-4 py-3 text-left font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentVotes.map((vote) => (
                    <tr key={vote.id} className="border-b border-row-divider hover-row transition-colors">
                      <td className="px-4 py-3 w-16 text-center">
                        <span className={`font-bold text-sm ${vote.vote_value > 0 ? "text-[#00ff88]" : vote.vote_value < 0 ? "text-[#ff003c]" : "t-dim"}`}>
                          {vote.vote_value > 0 ? `+${vote.vote_value}` : vote.vote_value}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="cyber-label">{vote.flavorSlug ?? "—"}</span>
                      </td>
                      <td className="px-4 py-3 max-w-[280px]">
                        <span className="t-body line-clamp-1 block">
                          {vote.captionContent ?? <span className="t-faint">—</span>}
                        </span>
                      </td>
                      <td className="px-4 py-3 t-dim">{vote.voterEmail ?? "—"}</td>
                      <td className="px-4 py-3 t-muted">
                        {new Date(vote.created_datetime_utc).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {recentVotes.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-6 text-center t-faint">NO VOTES FOUND</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
