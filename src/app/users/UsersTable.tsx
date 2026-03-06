"use client";

import { useState } from "react";
import { loadMoreUsers } from "./actions";

type Profile = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  is_superadmin: boolean;
  is_in_study: boolean;
  is_matrix_admin: boolean;
  created_datetime_utc: string | null;
};

export function UsersTable({
  initialData,
  totalCount,
}: {
  initialData: Profile[];
  totalCount: number;
}) {
  const [users, setUsers] = useState<Profile[]>(initialData);
  const [loading, setLoading] = useState(false);

  const hasMore = users.length < totalCount;

  const handleLoadMore = async () => {
    setLoading(true);
    const more = await loadMoreUsers(users.length);
    setUsers((prev) => [...prev, ...(more as Profile[])]);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="cyber-card rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-[rgba(0,212,255,0.15)]">
                {["EMAIL", "NAME", "SUPERADMIN", "STUDY", "MATRIX ADMIN", "CREATED"].map((h) => (
                  <th key={h} className="cyber-label px-4 py-3 text-left font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((profile) => (
                <tr
                  key={profile.id}
                  className="border-b border-[rgba(0,212,255,0.06)] hover:bg-[rgba(0,212,255,0.03)] transition-colors"
                >
                  <td className="px-4 py-3 cyber-value">{profile.email ?? "—"}</td>
                  <td className="px-4 py-3 text-[rgba(200,240,255,0.7)]">
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
                  <td className="px-4 py-3 text-[rgba(200,240,255,0.4)]">
                    {profile.created_datetime_utc
                      ? new Date(profile.created_datetime_utc).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {hasMore && (
        <div className="flex items-center justify-between">
          <p className="cyber-label text-[0.6rem]">
            SHOWING {users.length} OF {totalCount}
          </p>
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="cyber-btn rounded px-6 py-2 disabled:opacity-40"
          >
            {loading ? "LOADING..." : `LOAD MORE (${totalCount - users.length} REMAINING)`}
          </button>
        </div>
      )}
      {!hasMore && totalCount > 50 && (
        <p className="cyber-label text-[0.6rem] text-center">ALL {totalCount} RECORDS LOADED</p>
      )}
    </div>
  );
}

function Badge({
  active,
  color,
}: {
  active: boolean;
  color: "cyan" | "green" | "purple";
}) {
  const colors = {
    cyan: active
      ? "border-[#00d4ff] text-[#00d4ff] bg-[rgba(0,212,255,0.08)]"
      : "border-[rgba(0,212,255,0.15)] text-[rgba(0,212,255,0.25)]",
    green: active
      ? "border-[#00ff88] text-[#00ff88] bg-[rgba(0,255,136,0.08)]"
      : "border-[rgba(0,212,255,0.15)] text-[rgba(0,212,255,0.25)]",
    purple: active
      ? "border-[#bf00ff] text-[#bf00ff] bg-[rgba(191,0,255,0.08)]"
      : "border-[rgba(0,212,255,0.15)] text-[rgba(0,212,255,0.25)]",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[0.6rem] tracking-wider border ${colors[color]}`}>
      {active ? "YES" : "NO"}
    </span>
  );
}
