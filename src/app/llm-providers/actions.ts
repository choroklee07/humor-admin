"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProvider(formData: FormData) {
  const supabase = createAdminClient();
  await (supabase as any).from("llm_providers").insert({
    name: formData.get("name") as string,
  });
  revalidatePath("/llm");
}

export async function updateProvider(formData: FormData) {
  const supabase = createAdminClient();
  const id = formData.get("id") as string;
  await (supabase as any)
    .from("llm_providers")
    .update({ name: formData.get("name") as string })
    .eq("id", id);
  revalidatePath("/llm");
}

export async function deleteProvider(formData: FormData) {
  const supabase = createAdminClient();
  const id = formData.get("id") as string;
  await supabase.from("llm_providers").delete().eq("id", id);
  revalidatePath("/llm");
}
