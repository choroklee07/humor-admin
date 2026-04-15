"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteTerm } from "./actions";

export function TermRow({ term }: { term: any }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        onClick={() => setExpanded((v) => !v)}
        className="border-b border-row-divider hover-row transition-colors cursor-pointer select-none"
      >
        <td className="px-4 py-3">
          <span className="text-[#00d4ff] font-bold">{term.term}</span>
        </td>
        <td className="px-4 py-3 t-dim">
          {term.term_types?.name ?? "—"}
        </td>
        <td className="px-4 py-3 max-w-[280px]">
          <span className="t-body block truncate">
            {term.definition}
          </span>
        </td>
        <td className="px-4 py-3 cyber-value text-center">{term.priority}</td>
        <td className="px-4 py-3 t-muted">
          {new Date(term.created_datetime_utc).toLocaleDateString()}
        </td>
        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex gap-2">
            <Link
              href={`/terms/${term.id}/edit`}
              className="cyber-btn rounded px-3 py-1 text-[0.6rem] inline-block"
            >
              EDIT
            </Link>
            <form action={deleteTerm}>
              <input type="hidden" name="id" value={term.id} />
              <button
                type="submit"
                className="cyber-btn cyber-btn-danger rounded px-3 py-1 text-[0.6rem]"
              >
                DELETE
              </button>
            </form>
          </div>
        </td>
      </tr>

      {expanded && (
        <tr className="border-b border-row-divider bg-active">
          <td colSpan={6} className="px-6 py-4 space-y-3">
            <div>
              <p className="cyber-label text-[0.55rem] mb-1">DEFINITION</p>
              <p className="t-body text-xs font-mono leading-relaxed">
                {term.definition}
              </p>
            </div>
            <div>
              <p className="cyber-label text-[0.55rem] mb-1">EXAMPLE</p>
              <p className="t-body text-xs font-mono leading-relaxed italic">
                {term.example}
              </p>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
