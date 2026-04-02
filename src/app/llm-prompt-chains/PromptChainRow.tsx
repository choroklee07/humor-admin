"use client";

import { useState } from "react";

export interface PromptResponse {
  id: string;
  llm_system_prompt: string;
  llm_user_prompt: string;
  llm_models: { name: string } | null;
}

export interface Chain {
  id: number;
  created_datetime_utc: string;
  caption_request_id: number;
}

export function PromptChainRow({ chain, responses }: { chain: Chain; responses: PromptResponse[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        onClick={() => setExpanded((v) => !v)}
        className="border-b border-[rgba(0,212,255,0.06)] hover:bg-[rgba(0,212,255,0.03)] transition-colors cursor-pointer select-none"
      >
        <td className="px-4 py-3 cyber-label">{chain.id}</td>
        <td className="px-4 py-3 text-[rgba(200,240,255,0.7)]">{chain.caption_request_id}</td>
        <td className="px-4 py-3 cyber-value">{responses.length}</td>
        <td className="px-4 py-3 text-[rgba(200,240,255,0.4)]">
          {new Date(chain.created_datetime_utc).toLocaleString()}
        </td>
        <td className="px-4 py-3 text-[rgba(0,212,255,0.4)] text-[0.6rem]">
          {responses.length > 0 ? (expanded ? "▲ COLLAPSE" : "▼ EXPAND") : ""}
        </td>
      </tr>

      {expanded && responses.map((r, i) => (
        <tr key={r.id} className="border-b border-[rgba(0,212,255,0.06)] bg-[rgba(0,212,255,0.03)]">
          <td colSpan={5} className="px-6 py-4 space-y-3">
            <div className="flex items-center gap-3 mb-2">
              <span className="cyber-label text-[0.55rem]">STEP {i + 1}</span>
              {r.llm_models?.name && (
                <span className="text-[#00d4ff] font-mono text-[0.6rem]">{r.llm_models.name}</span>
              )}
            </div>
            <div>
              <p className="cyber-label text-[0.55rem] mb-1">SYSTEM PROMPT</p>
              <p className="text-[rgba(200,240,255,0.7)] text-xs font-mono leading-relaxed whitespace-pre-wrap">
                {r.llm_system_prompt || <span className="opacity-30">—</span>}
              </p>
            </div>
            <div>
              <p className="cyber-label text-[0.55rem] mb-1">USER PROMPT</p>
              <p className="text-[rgba(200,240,255,0.55)] text-xs font-mono leading-relaxed whitespace-pre-wrap">
                {r.llm_user_prompt || <span className="opacity-30">—</span>}
              </p>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}
