"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function dismissCaptionReport(formData: FormData) {
  const supabase = createAdminClient();
  const id = formData.get("id") as string;
  await supabase.from("reported_captions").delete().eq("id", id);
  revalidatePath("/reports");
}

export async function dismissImageReport(formData: FormData) {
  const supabase = createAdminClient();
  const id = formData.get("id") as string;
  await supabase.from("reported_images").delete().eq("id", id);
  revalidatePath("/reports");
}
