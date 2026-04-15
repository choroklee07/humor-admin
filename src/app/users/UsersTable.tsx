"use client";

import { useState, useTransition } from "react";
import { loadUsers, searchUsers, type MergedUser } from "./actions";

const inputCls = "w-full input-cyber";

export function UsersTable({
  initialData,
  totalCount,
}: {
  initialData: MergedUser[];
  totalCount: number;
}) {
  const [users, setUsers] = useState<MergedUser[]>(initialData);
  const [total, setTotal] = useState(totalCount);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, startTransition] = useTransition();

  const hasMore = !isSearching && users.length < total;

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setIsSearching(false);
      setUsers(initialData);
      setTotal(totalCount);
      setPage(1);
      return;
    }
    setIsSearching(true);
    startTransition(async () => {
      const results = await searchUsers(value);
      setUsers(results);
      setTotal(results.length);
    });
  };

  const handleLoadMore = () => {
    startTransition(async () => {
      const nextPage = page + 1;
      const { users: more, total: newTotal } = await loadUsers(nextPage);
      setUsers((prev) => [...prev, ...more]);
      setTotal(newTotal);
      setPage(nextPage);
    });
  };

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 cyber-label text-[0.7rem] pointer-events-none">
          {"//"}
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="SEARCH BY NAME OR EMAIL..."
          className={`${inputCls} pl-8`}
        />
        {isPending && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 cyber-label text-[0.6rem]">
            SEARCHING...
          </span>
        )}
        {isSearching && !isPending && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 t-inactive font-mono text-[0.6rem]">
            {users.length} RESULTS
          </span>
        )}
      </div>

      <div className="cyber-card rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-table">
                {["EMAIL", "NAME", "SUPERADMIN", "STUDY", "MATRIX ADMIN", "CREATED"].map((h) => (
                  <th key={h} className="cyber-label px-4 py-3 text-left font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length ? (
                users.map((profile) => (
                  <tr
                    key={profile.id}
                    className="border-b border-row-divider hover-row transition-colors"
                  >
                    <td className="px-4 py-3 cyber-value">{profile.email ?? "—"}</td>
                    <td className="px-4 py-3 t-body">
                      {[profile.first_name, profile.last_name].filter(Boolean).join(" ") || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge active={profile.is_superadmin} color="green" />
                    </td>
                    <td className="px-4 py-3">
                      <Badge active={profile.is_in_study} color="cyan" />
                    </td>
                    <td className="px-4 py-3">
                      <Badge active={profile.is_matrix_admin} color="purple" />
                    </td>
                    <td className="px-4 py-3 t-muted">
                      {profile.created_datetime_utc
                        ? new Date(profile.created_datetime_utc).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="cyber-label p-6 text-center">
                    {isSearching ? "NO MATCHING USERS" : "NO RECORDS"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {hasMore && (
        <div className="flex items-center justify-between">
          <p className="cyber-label text-[0.6rem]">
            SHOWING {users.length} OF {total}
          </p>
          <button
            onClick={handleLoadMore}
            disabled={isPending}
            className="cyber-btn rounded px-6 py-2 disabled:opacity-40"
          >
            {isPending ? "LOADING..." : `LOAD MORE (${total - users.length} REMAINING)`}
          </button>
        </div>
      )}
      {!hasMore && !isSearching && total > 50 && (
        <p className="cyber-label text-[0.6rem] text-center">ALL {total} RECORDS LOADED</p>
      )}
    </div>
  );
}

function Badge({ active, color }: { active: boolean; color: "cyan" | "green" | "purple" }) {
  const colors = {
    cyan: active
      ? "border-[#00d4ff] text-[#00d4ff] bg-active"
      : "border-table text-[rgba(0,212,255,0.25)]",
    green: active
      ? "border-[#00ff88] text-[#00ff88] bg-[rgba(0,255,136,0.08)]"
      : "border-table text-[rgba(0,212,255,0.25)]",
    purple: active
      ? "border-[#bf00ff] text-[#bf00ff] bg-[rgba(191,0,255,0.08)]"
      : "border-table text-[rgba(0,212,255,0.25)]",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[0.6rem] tracking-wider border ${colors[color]}`}>
      {active ? "YES" : "NO"}
    </span>
  );
}
