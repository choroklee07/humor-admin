"use client";

import { useState } from "react";
import Link from "next/link";
import { toggleFeatured, togglePublic, deleteCaption } from "./actions";
import { createCaptionExample, deleteCaptionExample } from "../caption-examples/actions";

const TABS = ["CAPTIONS", "REQUESTS", "EXAMPLES"] as const;
type Tab = (typeof TABS)[number];

const inputCls = "w-full input-cyber";

function ExpandableText({ text, limit = 60, className }: { text: string; limit?: number; className?: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > limit;

  return (
    <span
      className={`block cursor-pointer select-text ${className ?? ""}`}
      onClick={() => isLong && setExpanded((v) => !v)}
      title={isLong && !expanded ? text : undefined}
    >
      {expanded || !isLong ? text : text.slice(0, limit) + "…"}
      {isLong && (
        <span className="ml-1 t-inactive hover:text-[#00d4ff] font-mono text-[0.55rem] tracking-wider select-none">
          {expanded ? "[−]" : "[+]"}
        </span>
      )}
    </span>
  );
}

interface Props {
  captions: any[];
  captionsTotal: number;
  requests: any[];
  requestsTotal: number;
  examples: any[];
  page: number;
  totalPages: number;
  q: string;
}

export function CaptionsTabs({
  captions,
  captionsTotal,
  requests,
  requestsTotal,
  examples,
  page,
  totalPages,
  q,
}: Props) {
  const [active, setActive] = useState<Tab>("CAPTIONS");

  const buildHref = (p: number, query?: string) => {
    const params = new URLSearchParams();
    const qVal = query !== undefined ? query : q;
    if (qVal) params.set("q", qVal);
    if (p > 0) params.set("page", String(p));
    const str = params.toString();
    return `/captions${str ? `?${str}` : ""}`;
  };

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

      {/* ── CAPTIONS ── */}
      {active === "CAPTIONS" && (
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <h2 className="cyber-text font-mono text-lg font-bold">CAPTIONS</h2>
            <span className="cyber-label text-[0.6rem]">
              {captionsTotal} RECORDS{q ? ` MATCHING "${q}"` : ""}
              {` · PAGE ${page + 1}/${Math.max(1, totalPages)}`}
            </span>
          </div>

          <form method="GET" action="/captions" className="flex gap-2">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by email or name..."
              className="flex-1 input-cyber"
            />
            <button type="submit" className="cyber-btn rounded px-4 py-2 text-[0.65rem]">SEARCH</button>
            {q && (
              <Link href="/captions" className="cyber-btn rounded px-4 py-2 text-[0.65rem] flex items-center">CLEAR</Link>
            )}
          </form>

          <div className="cyber-card rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-table">
                    {["CONTENT", "AUTHOR", "LIKES", "PUBLIC", "FEATURED", "CREATED", "ACTIONS"].map((h) => (
                      <th key={h} className="cyber-label px-4 py-3 text-left font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {captions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center t-faint font-mono text-xs">
                        NO CAPTIONS FOUND
                      </td>
                    </tr>
                  )}
                  {captions.map((caption: any) => (
                    <tr key={caption.id} className="border-b border-row-divider hover-row transition-colors">
                      <td className="px-4 py-3 w-[300px]">
                        {caption.content
                          ? <ExpandableText text={caption.content} className="t-body" />
                          : <span className="opacity-30">—</span>}
                      </td>
                      <td className="px-4 py-3 t-dim">{caption.profiles?.email ?? "—"}</td>
                      <td className="px-4 py-3 cyber-value">{caption.like_count}</td>
                      <td className="px-4 py-3">
                        <form action={togglePublic} className="inline">
                          <input type="hidden" name="id" value={caption.id} />
                          <input type="hidden" name="value" value={String(!caption.is_public)} />
                          <button type="submit" className={`px-2 py-0.5 rounded text-[0.6rem] tracking-wider border transition-all cursor-pointer ${caption.is_public ? "border-[#00d4ff] text-[#00d4ff] bg-active hover-bg-active" : "border-input t-inactive hover:border-tab-active"}`}>
                            {caption.is_public ? "YES" : "NO"}
                          </button>
                        </form>
                      </td>
                      <td className="px-4 py-3">
                        <form action={toggleFeatured} className="inline">
                          <input type="hidden" name="id" value={caption.id} />
                          <input type="hidden" name="value" value={String(!caption.is_featured)} />
                          <button type="submit" className={`px-2 py-0.5 rounded text-[0.6rem] tracking-wider border transition-all cursor-pointer ${caption.is_featured ? "border-[#00ff88] text-[#00ff88] bg-[rgba(0,255,136,0.08)] hover:bg-[rgba(0,255,136,0.15)]" : "border-input t-inactive hover:border-tab-active"}`}>
                            {caption.is_featured ? "YES" : "NO"}
                          </button>
                        </form>
                      </td>
                      <td className="px-4 py-3 t-muted">
                        {new Date(caption.created_datetime_utc).toLocaleDateString()}
                      </td>
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

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-1">
              <Link href={buildHref(page - 1)} className={`cyber-btn rounded px-4 py-1.5 text-[0.65rem] ${page === 0 ? "opacity-30 pointer-events-none" : ""}`}>
                ← PREV
              </Link>
              <span className="cyber-label text-[0.6rem]">PAGE {page + 1} / {totalPages}</span>
              <Link href={buildHref(page + 1)} className={`cyber-btn rounded px-4 py-1.5 text-[0.65rem] ${page >= totalPages - 1 ? "opacity-30 pointer-events-none" : ""}`}>
                NEXT →
              </Link>
            </div>
          )}
        </section>
      )}

      {/* ── REQUESTS ── */}
      {active === "REQUESTS" && (
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <h2 className="cyber-text font-mono text-lg font-bold">REQUESTS</h2>
            <span className="cyber-label text-[0.6rem]">{requestsTotal} TOTAL · SHOWING LATEST 50</span>
          </div>
          <div className="cyber-card rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-table">
                    {["ID", "USER", "IMAGE", "CREATED"].map((h) => (
                      <th key={h} className="cyber-label px-4 py-3 text-left font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req: any) => (
                    <tr key={req.id} className="border-b border-row-divider hover-row transition-colors">
                      <td className="px-4 py-3 w-[120px]">
                        <ExpandableText text={String(req.id)} limit={8} className="cyber-label" />
                      </td>
                      <td className="px-4 py-3 w-[200px]">
                        <ExpandableText text={req.profiles?.email ?? "—"} className="t-body" />
                      </td>
                      <td className="px-4 py-3">
                        {req.images?.url
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={req.images.url} alt="" className="w-10 h-10 object-cover rounded border border-img" />
                          : <span className="t-faint">—</span>}
                      </td>
                      <td className="px-4 py-3 t-muted">{new Date(req.created_datetime_utc).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ── EXAMPLES ── */}
      {active === "EXAMPLES" && (
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <h2 className="cyber-text font-mono text-lg font-bold">EXAMPLES</h2>
            <span className="cyber-label text-[0.6rem]">{examples.length} TOTAL RECORDS</span>
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
                  <tr className="border-b border-table">
                    {["IMG", "DESCRIPTION", "CAPTION", "PRIORITY", "CREATED", "ACTIONS"].map((h) => (
                      <th key={h} className="cyber-label px-4 py-3 text-left font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {examples.map((ex: any) => (
                    <tr key={ex.id} className="border-b border-row-divider hover-row transition-colors">
                      <td className="px-4 py-3">
                        {ex.images?.url
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={ex.images.url} alt="" className="w-10 h-10 object-cover rounded border border-img" />
                          : <span className="t-faint">—</span>}
                      </td>
                      <td className="px-4 py-3 w-[220px]">
                        <ExpandableText text={ex.image_description ?? "—"} className="t-body" />
                      </td>
                      <td className="px-4 py-3 w-[220px]">
                        <ExpandableText text={ex.caption ?? "—"} className="t-bright" />
                      </td>
                      <td className="px-4 py-3 cyber-value text-center">{ex.priority}</td>
                      <td className="px-4 py-3 t-muted">{new Date(ex.created_datetime_utc).toLocaleDateString()}</td>
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
      )}
    </div>
  );
}
