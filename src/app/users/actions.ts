"use server";

import { createAdminClient } from "@/lib/supabase/server";

export async function loadMoreUsers(offset: number) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select(
      "id, email, first_name, last_name, is_superadmin, is_in_study, is_matrix_admin, created_datetime_utc"
    )
    .order("created_datetime_utc", { ascending: false })
    .range(offset, offset + 49);
  return data ?? [];
}
