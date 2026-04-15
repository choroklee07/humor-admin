"use client";

import { useState } from "react";
import Link from "next/link";
import { createProvider, deleteProvider } from "../llm-providers/actions";
import { createModel, deleteModel } from "../llm-models/actions";
import { PromptChainRow } from "../llm-prompt-chains/PromptChainRow";

const TABS = ["PROVIDERS", "MODELS", "PROMPT CHAINS", "RESPONSES"] as const;
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
  providers: any[];
  models: any[];
  chains: any[];
  responsesByChain: Record<number, any[]>;
  responses: any[];
  chainsTotal: number;
  responsesTotal: number;
}

export function LlmTabs({ providers, models, chains, responsesByChain, responses, chainsTotal, responsesTotal }: Props) {
  const [active, setActive] = useState<Tab>("PROVIDERS");

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

      {/* ── PROVIDERS ── */}
      {active === "PROVIDERS" && (
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <h2 className="cyber-text font-mono text-lg font-bold">PROVIDERS</h2>
            <span className="cyber-label text-[0.6rem]">{providers.length} RECORDS</span>
          </div>

          <div className="cyber-card cyber-corner rounded p-6">
            <p className="cyber-label mb-4 tracking-[0.15em]">{`// ADD NEW PROVIDER`}</p>
            <form action={createProvider} className="flex gap-4 items-end">
              <div className="space-y-1 flex-1">
                <label className="cyber-label text-[0.6rem]">NAME *</label>
                <input name="name" required placeholder="e.g. Anthropic" className={inputCls} />
              </div>
              <button type="submit" className="cyber-btn rounded px-5 py-2">CREATE</button>
            </form>
          </div>

          <div className="cyber-card rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-table">
                    {["ID", "NAME", "CREATED", "ACTIONS"].map((h) => (
                      <th key={h} className="cyber-label px-4 py-3 text-left font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {providers.map((p: any) => (
                    <tr key={p.id} className="border-b border-row-divider hover-row transition-colors">
                      <td className="px-4 py-3 cyber-label">{p.id}</td>
                      <td className="px-4 py-3 t-bright font-bold">{p.name}</td>
                      <td className="px-4 py-3 t-muted">{new Date(p.created_datetime_utc).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link href={`/llm-providers/${p.id}/edit`} className="cyber-btn rounded px-3 py-1 text-[0.6rem] inline-block">EDIT</Link>
                          <form action={deleteProvider}>
                            <input type="hidden" name="id" value={p.id} />
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

      {/* ── MODELS ── */}
      {active === "MODELS" && (
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <h2 className="cyber-text font-mono text-lg font-bold">MODELS</h2>
            <span className="cyber-label text-[0.6rem]">{models.length} RECORDS</span>
          </div>

          <div className="cyber-card cyber-corner rounded p-6">
            <p className="cyber-label mb-4 tracking-[0.15em]">{`// ADD NEW MODEL`}</p>
            <form action={createModel} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="cyber-label text-[0.6rem]">DISPLAY NAME *</label>
                  <input name="name" required placeholder="e.g. Claude 3 Opus" className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className="cyber-label text-[0.6rem]">PROVIDER MODEL ID *</label>
                  <input name="provider_model_id" required placeholder="e.g. claude-opus-4-6" className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className="cyber-label text-[0.6rem]">PROVIDER *</label>
                  <select name="llm_provider_id" required className={inputCls}>
                    <option value="">— select provider —</option>
                    {providers.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="is_temperature_supported" className="accent-[#00d4ff]" />
                    <span className="cyber-label text-[0.65rem]">TEMPERATURE SUPPORTED</span>
                  </label>
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
                    {["ID", "NAME", "PROVIDER MODEL ID", "PROVIDER", "TEMP", "CREATED", "ACTIONS"].map((h) => (
                      <th key={h} className="cyber-label px-4 py-3 text-left font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {models.map((m: any) => (
                    <tr key={m.id} className="border-b border-row-divider hover-row transition-colors">
                      <td className="px-4 py-3 cyber-label">{m.id}</td>
                      <td className="px-4 py-3 t-bright font-bold">{m.name}</td>
                      <td className="px-4 py-3 t-body">{m.provider_model_id}</td>
                      <td className="px-4 py-3 t-body">{m.llm_providers?.name ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[0.6rem] tracking-wider border ${m.is_temperature_supported ? "border-[#00d4ff] text-[#00d4ff] bg-active" : "border-input t-inactive"}`}>
                          {m.is_temperature_supported ? "YES" : "NO"}
                        </span>
                      </td>
                      <td className="px-4 py-3 t-muted">{new Date(m.created_datetime_utc).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link href={`/llm-models/${m.id}/edit`} className="cyber-btn rounded px-3 py-1 text-[0.6rem] inline-block">EDIT</Link>
                          <form action={deleteModel}>
                            <input type="hidden" name="id" value={m.id} />
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

      {/* ── PROMPT CHAINS ── */}
      {active === "PROMPT CHAINS" && (
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <h2 className="cyber-text font-mono text-lg font-bold">PROMPT CHAINS</h2>
            <span className="cyber-label text-[0.6rem]">{chainsTotal} TOTAL · SHOWING LATEST 50</span>
          </div>
          <div className="cyber-card rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-table">
                    {["ID", "CAPTION REQUEST ID", "STEPS", "CREATED", ""].map((h) => (
                      <th key={h} className="cyber-label px-4 py-3 text-left font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chains.map((c: any) => (
                    <PromptChainRow key={c.id} chain={c} responses={responsesByChain[c.id] ?? []} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ── RESPONSES ── */}
      {active === "RESPONSES" && (
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <h2 className="cyber-text font-mono text-lg font-bold">RESPONSES</h2>
            <span className="cyber-label text-[0.6rem]">{responsesTotal} TOTAL · SHOWING LATEST 50</span>
          </div>
          <div className="cyber-card rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-table">
                    {["USER", "MODEL", "FLAVOR", "TEMP", "TIME (s)", "RESPONSE", "CREATED"].map((h) => (
                      <th key={h} className="cyber-label px-4 py-3 text-left font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {responses.map((r: any) => (
                    <tr key={r.id} className="border-b border-row-divider hover-row transition-colors">
                      <td className="px-4 py-3 t-body">{r.profiles?.email ?? "—"}</td>
                      <td className="px-4 py-3 t-body">{r.llm_models?.name ?? "—"}</td>
                      <td className="px-4 py-3"><span className="text-[#00d4ff]">{r.humor_flavors?.slug ?? "—"}</span></td>
                      <td className="px-4 py-3 t-dim">{r.llm_temperature ?? "—"}</td>
                      <td className="px-4 py-3 cyber-value">{r.processing_time_seconds}</td>
                      <td className="px-4 py-3 w-[280px]">
                        {r.llm_model_response
                          ? <ExpandableText text={r.llm_model_response} className="t-body" />
                          : <span className="opacity-30">—</span>}
                      </td>
                      <td className="px-4 py-3 t-muted">{new Date(r.created_datetime_utc).toLocaleString()}</td>
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
