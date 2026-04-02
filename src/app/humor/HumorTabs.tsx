"use client";

import { useState } from "react";
import { updateHumorMix } from "../humor-mix/actions";

const TABS = ["FLAVORS", "FLAVOR STEPS", "HUMOR MIX"] as const;
type Tab = (typeof TABS)[number];

export function HumorTabs({
  steps,
  mix,
  flavors,
}: {
  steps: any[];
  mix: any[];
  flavors: any[];
}) {
  const [active, setActive] = useState<Tab>("FLAVORS");

  return (
    <div className="space-y-6">
      {/* Tab buttons at the top */}
      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-5 py-2 font-mono text-[0.65rem] tracking-widest rounded transition-all border ${
              active === tab
                ? "bg-[rgba(0,212,255,0.12)] text-[#00d4ff] border-[rgba(0,212,255,0.5)] shadow-[0_0_10px_rgba(0,212,255,0.2)]"
                : "text-[rgba(0,212,255,0.35)] border-[rgba(0,212,255,0.15)] hover:text-[rgba(0,212,255,0.6)] hover:border-[rgba(0,212,255,0.3)]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* FLAVORS */}
      {active === "FLAVORS" && <section className="space-y-3">
        <div className="flex items-baseline gap-3">
          <h2 className="cyber-text font-mono text-lg font-bold">FLAVORS</h2>
          <span className="cyber-label text-[0.6rem]">{flavors.length} RECORDS</span>
        </div>
        <div className="cyber-card rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-[rgba(0,212,255,0.15)]">
                  {["ID", "SLUG", "DESCRIPTION", "CREATED"].map((h) => (
                    <th key={h} className="cyber-label px-4 py-3 text-left font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {flavors.map((f: any) => (
                  <tr key={f.id} className="border-b border-[rgba(0,212,255,0.06)] hover:bg-[rgba(0,212,255,0.03)] transition-colors">
                    <td className="px-4 py-3 cyber-label">{f.id}</td>
                    <td className="px-4 py-3"><span className="text-[#00d4ff] font-bold tracking-wider">{f.slug}</span></td>
                    <td className="px-4 py-3 max-w-[400px]"><span className="text-[rgba(200,240,255,0.7)] block truncate" title={f.description ?? ""}>{f.description ?? <span className="opacity-30">—</span>}</span></td>
                    <td className="px-4 py-3 text-[rgba(200,240,255,0.4)]">{new Date(f.created_datetime_utc).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>}

      {/* FLAVOR STEPS */}
      {active === "FLAVOR STEPS" && (
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <h2 className="cyber-text font-mono text-lg font-bold">FLAVOR STEPS</h2>
            <span className="cyber-label text-[0.6rem]">{steps.length} RECORDS</span>
          </div>
          <div className="cyber-card rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-[rgba(0,212,255,0.15)]">
                    {["ID", "FLAVOR", "ORDER", "STEP TYPE", "MODEL", "TEMP", "DESCRIPTION"].map((h) => (
                      <th key={h} className="cyber-label px-4 py-3 text-left font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {steps.map((s: any) => (
                    <tr key={s.id} className="border-b border-[rgba(0,212,255,0.06)] hover:bg-[rgba(0,212,255,0.03)] transition-colors">
                      <td className="px-4 py-3 cyber-label">{s.id}</td>
                      <td className="px-4 py-3"><span className="text-[#00d4ff] font-bold">{s.humor_flavors?.slug ?? "—"}</span></td>
                      <td className="px-4 py-3 cyber-value text-center">{s.order_by}</td>
                      <td className="px-4 py-3 text-[rgba(200,240,255,0.6)]">{s.humor_flavor_step_types?.slug ?? "—"}</td>
                      <td className="px-4 py-3 text-[rgba(200,240,255,0.7)]">{s.llm_models?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-[rgba(200,240,255,0.5)]">{s.llm_temperature ?? "—"}</td>
                      <td className="px-4 py-3 max-w-[240px]">
                        <span className="text-[rgba(200,240,255,0.7)] block truncate" title={s.description ?? ""}>
                          {s.description ?? <span className="opacity-30">—</span>}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* HUMOR MIX */}
      {active === "HUMOR MIX" && (
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <h2 className="cyber-text font-mono text-lg font-bold">MIX</h2>
            <span className="cyber-label text-[0.6rem]">CAPTION COUNT PER FLAVOR</span>
          </div>
          <div className="cyber-card rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-[rgba(0,212,255,0.15)]">
                    {["ID", "FLAVOR", "CAPTION COUNT", ""].map((h) => (
                      <th key={h} className="cyber-label px-4 py-3 text-left font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mix.map((row: any) => (
                    <tr key={row.id} className="border-b border-[rgba(0,212,255,0.06)] hover:bg-[rgba(0,212,255,0.03)] transition-colors">
                      <td className="px-4 py-3 cyber-label">{row.id}</td>
                      <td className="px-4 py-3"><span className="text-[#00d4ff] font-bold tracking-wider">{row.humor_flavors?.slug ?? "—"}</span></td>
                      <td className="px-4 py-3" colSpan={2}>
                        <form action={updateHumorMix} className="flex items-center gap-2">
                          <input type="hidden" name="id" value={row.id} />
                          <input
                            type="number"
                            name="caption_count"
                            defaultValue={row.caption_count}
                            min={0}
                            className="w-20 bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)] rounded px-2 py-1 font-mono text-xs text-[#c8f0ff] focus:outline-none focus:border-[rgba(0,212,255,0.6)]"
                          />
                          <button type="submit" className="cyber-btn rounded px-3 py-1 text-[0.6rem]">SAVE</button>
                        </form>
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
