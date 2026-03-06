"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function loadMoreImages(offset: number) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("images")
    .select(
      "id, url, is_public, is_common_use, additional_context, created_datetime_utc, profiles(email)"
    )
    .order("created_datetime_utc", { ascending: false })
    .range(offset, offset + 49);
  return data ?? [];
}

export async function createImage(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("images").insert({
    url: formData.get("url") as string,
    is_public: formData.get("is_public") === "on",
    is_common_use: formData.get("is_common_use") === "on",
    additional_context: (formData.get("additional_context") as string) || null,
    profile_id: user.id,
  });
  revalidatePath("/images");
}

export async function updateImage(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  await supabase
    .from("images")
    .update({
      url: formData.get("url") as string,
      is_public: formData.get("is_public") === "on",
      is_common_use: formData.get("is_common_use") === "on",
      additional_context: (formData.get("additional_context") as string) || null,
      modified_datetime_utc: new Date().toISOString(),
    })
    .eq("id", id);
  revalidatePath("/images");
}

export async function deleteImage(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  await supabase.from("images").delete().eq("id", id);
  revalidatePath("/images");
}
