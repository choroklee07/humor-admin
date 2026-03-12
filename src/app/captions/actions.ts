"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleFeatured(formData: FormData) {
  const supabase = createAdminClient();
  const id = formData.get("id") as string;
  const value = formData.get("value") === "true";
  await (supabase as any)
    .from("captions")
    .update({ is_featured: value, modified_datetime_utc: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/captions");
}

export async function togglePublic(formData: FormData) {
  const supabase = createAdminClient();
  const id = formData.get("id") as string;
  const value = formData.get("value") === "true";
  await (supabase as any)
    .from("captions")
    .update({ is_public: value, modified_datetime_utc: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/captions");
}

export async function deleteCaption(formData: FormData) {
  const supabase = createAdminClient();
  const id = formData.get("id") as string;
  await supabase.from("captions").delete().eq("id", id);
  revalidatePath("/captions");
}
