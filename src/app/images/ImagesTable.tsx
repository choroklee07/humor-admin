"use client";

import { useState } from "react";
import Link from "next/link";
import { loadMoreImages, deleteImage } from "./actions";

type Image = {
  id: string;
  url: string | null;
  is_public: boolean | null;
  is_common_use: boolean | null;
  additional_context: string | null;
  created_datetime_utc: string;
  profiles: { email: string } | null;
};

export function ImagesTable({
  initialData,
  totalCount,
}: {
  initialData: Image[];
  totalCount: number;
}) {
  const [images, setImages] = useState<Image[]>(initialData);
  const [loading, setLoading] = useState(false);

  const hasMore = images.length < totalCount;

  const handleLoadMore = async () => {
    setLoading(true);
    const more = await loadMoreImages(images.length);
    setImages((prev) => [...prev, ...(more as Image[])]);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="cyber-card rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-[rgba(0,212,255,0.15)]">
                {["PREVIEW", "URL", "UPLOADER", "PUBLIC", "COMMON USE", "CREATED", "ACTIONS"].map((h) => (
                  <th key={h} className="cyber-label px-4 py-3 text-left font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {images.map((image) => (
                <tr
                  key={image.id}
                  className="border-b border-[rgba(0,212,255,0.06)] hover:bg-[rgba(0,212,255,0.03)] transition-colors"
                >
                  <td className="px-4 py-3">
                    {image.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image.url}
                        alt=""
                        className="w-12 h-12 object-cover rounded border border-[rgba(0,212,255,0.2)]"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded border border-[rgba(0,212,255,0.1)] flex items-center justify-center text-[rgba(0,212,255,0.2)]">
                        —
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <span
                      className="text-[rgba(200,240,255,0.6)] truncate block"
                      title={image.url ?? ""}
                    >
                      {image.url
                        ? image.url.slice(0, 40) + (image.url.length > 40 ? "…" : "")
                        : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[rgba(200,240,255,0.5)]">
                    {image.profiles?.email ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge active={image.is_public ?? false} color="cyan" />
                  </td>
                  <td className="px-4 py-3">
                    <Badge active={image.is_common_use ?? false} color="purple" />
                  </td>
                  <td className="px-4 py-3 text-[rgba(200,240,255,0.4)]">
                    {new Date(image.created_datetime_utc).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/images/${image.id}/edit`}
                        className="cyber-btn rounded px-3 py-1 text-[0.6rem]"
                      >
                        EDIT
                      </Link>
                      <form action={deleteImage}>
                        <input type="hidden" name="id" value={image.id} />
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {hasMore && (
        <div className="flex items-center justify-between">
          <p className="cyber-label text-[0.6rem]">
            SHOWING {images.length} OF {totalCount}
          </p>
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="cyber-btn rounded px-6 py-2 disabled:opacity-40"
          >
            {loading ? "LOADING..." : `LOAD MORE (${totalCount - images.length} REMAINING)`}
          </button>
        </div>
      )}
      {!hasMore && totalCount > 50 && (
        <p className="cyber-label text-[0.6rem] text-center">
          ALL {totalCount} RECORDS LOADED
        </p>
      )}
    </div>
  );
}

function Badge({
  active,
  color,
}: {
  active: boolean;
  color: "cyan" | "purple";
}) {
  const colors = {
    cyan: active
      ? "border-[#00d4ff] text-[#00d4ff] bg-[rgba(0,212,255,0.08)]"
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
