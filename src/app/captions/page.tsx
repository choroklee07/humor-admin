import { createClient, createAdminClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/AdminShell";
import { CaptionsTabs } from "./CaptionsTabs";

const PAGE_SIZE = 50;

export default async function CaptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const sessionClient = await createClient();
  const {
    data: { user: currentUser },
  } = await sessionClient.auth.getUser();

  const supabase = createAdminClient();

  const { page: pageParam, q: qParam } = await searchParams;
  const page = Math.max(0, parseInt(pageParam ?? "0"));
  const q = qParam?.trim() ?? "";

  let profileIdFilter: string[] | null = null;
  if (q) {
    const { data: matchingProfiles } = await supabase
      .from("profiles")
      .select("id")
      .or(`email.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%`) as { data: { id: string }[] | null };
    profileIdFilter = (matchingProfiles ?? []).map((p) => p.id);
  }

  let captionsQuery = (supabase as any)
    .from("captions")
    .select(
      "id, content, is_public, is_featured, like_count, created_datetime_utc, profiles!profile_id(email, first_name, last_name), images!image_id(url)",
      { count: "exact" }
    )
    .order("created_datetime_utc", { ascending: false });

  if (profileIdFilter !== null) {
    if (profileIdFilter.length === 0) {
      captionsQuery = captionsQuery.eq("id", "00000000-0000-0000-0000-000000000000");
    } else {
      captionsQuery = captionsQuery.in("profile_id", profileIdFilter);
    }
  }

  captionsQuery = captionsQuery.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

  const [
    { data: captions, count: captionsTotal },
    { data: requests },
    { data: examples },
    { count: requestsTotal },
  ] = await Promise.all([
    captionsQuery,
    (supabase as any)
      .from("caption_requests")
      .select("id, created_datetime_utc, profiles!profile_id(email), images!image_id(url)")
      .order("created_datetime_utc", { ascending: false })
      .limit(50),
    (supabase as any)
      .from("caption_examples")
      .select("id, image_description, caption, explanation, priority, created_datetime_utc, images(url)")
      .order("priority", { ascending: false })
      .order("id", { ascending: true }),
    supabase.from("caption_requests").select("*", { count: "exact", head: true }),
  ]);

  const totalPages = Math.ceil((captionsTotal ?? 0) / PAGE_SIZE);

  return (
    <AdminShell user={{ email: currentUser?.email }}>
      <div className="p-8 space-y-6">
        <div>
          <p className="cyber-label tracking-[0.2em]">{`// CAPTION MANAGEMENT`}</p>
          <h1 className="cyber-text font-mono text-3xl font-bold mt-1">CAPTIONS</h1>
        </div>

        <CaptionsTabs
          captions={captions ?? []}
          captionsTotal={captionsTotal ?? 0}
          requests={requests ?? []}
          requestsTotal={requestsTotal ?? 0}
          examples={examples ?? []}
          page={page}
          totalPages={totalPages}
          q={q}
        />
      </div>
    </AdminShell>
  );
}
