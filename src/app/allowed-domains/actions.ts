"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createDomain(formData: FormData) {
  const supabase = createAdminClient();
  await (supabase as any).from("allowed_signup_domains").insert({
    apex_domain: (formData.get("apex_domain") as string).toLowerCase().trim(),
  });
  revalidatePath("/allowed-domains");
}

export async function deleteDomain(formData: FormData) {
  const supabase = createAdminClient();
  const id = formData.get("id") as string;
  await supabase.from("allowed_signup_domains").delete().eq("id", id);
  revalidatePath("/allowed-domains");
}
