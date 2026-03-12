"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateHumorMix(formData: FormData) {
  const supabase = createAdminClient();
  const id = formData.get("id") as string;
  const caption_count = parseInt(formData.get("caption_count") as string, 10);
  await (supabase as any)
    .from("humor_flavor_mix")
    .update({ caption_count })
    .eq("id", id);
  revalidatePath("/humor");
}
