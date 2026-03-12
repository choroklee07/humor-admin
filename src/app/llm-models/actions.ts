"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createModel(formData: FormData) {
  const supabase = createAdminClient();
  await (supabase as any).from("llm_models").insert({
    name: formData.get("name") as string,
    provider_model_id: formData.get("provider_model_id") as string,
    llm_provider_id: parseInt(formData.get("llm_provider_id") as string, 10),
    is_temperature_supported: formData.get("is_temperature_supported") === "on",
  });
  revalidatePath("/llm");
}

export async function updateModel(formData: FormData) {
  const supabase = createAdminClient();
  const id = formData.get("id") as string;
  await (supabase as any)
    .from("llm_models")
    .update({
      name: formData.get("name") as string,
      provider_model_id: formData.get("provider_model_id") as string,
      llm_provider_id: parseInt(formData.get("llm_provider_id") as string, 10),
      is_temperature_supported: formData.get("is_temperature_supported") === "on",
    })
    .eq("id", id);
  revalidatePath("/llm");
}

export async function deleteModel(formData: FormData) {
  const supabase = createAdminClient();
  const id = formData.get("id") as string;
  await supabase.from("llm_models").delete().eq("id", id);
  revalidatePath("/llm");
}
