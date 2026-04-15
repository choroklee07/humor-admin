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
        className="border-b border-row-divider hover-row transition-colors cursor-pointer select-none"
      >
        <td className="px-4 py-3 cyber-label">{chain.id}</td>
        <td className="px-4 py-3 t-body">{chain.caption_request_id}</td>
        <td className="px-4 py-3 cyber-value">{responses.length}</td>
        <td className="px-4 py-3 t-muted">
          {new Date(chain.created_datetime_utc).toLocaleString()}
        </td>
        <td className="px-4 py-3 t-inactive text-[0.6rem]">
          {responses.length > 0 ? (expanded ? "▲ COLLAPSE" : "▼ EXPAND") : ""}
        </td>
      </tr>

      {expanded && responses.map((r, i) => (
        <tr key={r.id} className="border-b border-row-divider bg-active">
          <td colSpan={5} className="px-6 py-4 space-y-3">
            <div className="flex items-center gap-3 mb-2">
              <span className="cyber-label text-[0.55rem]">STEP {i + 1}</span>
              {r.llm_models?.name && (
                <span className="text-[#00d4ff] font-mono text-[0.6rem]">{r.llm_models.name}</span>
              )}
            </div>
            <div>
              <p className="cyber-label text-[0.55rem] mb-1">SYSTEM PROMPT</p>
              <p className="t-body text-xs font-mono leading-relaxed whitespace-pre-wrap">
                {r.llm_system_prompt || <span className="opacity-30">—</span>}
              </p>
            </div>
            <div>
              <p className="cyber-label text-[0.55rem] mb-1">USER PROMPT</p>
              <p className="t-dim text-xs font-mono leading-relaxed whitespace-pre-wrap">
                {r.llm_user_prompt || <span className="opacity-30">—</span>}
              </p>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}
