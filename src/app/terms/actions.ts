"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createTerm(formData: FormData) {
  const supabase = createAdminClient();
  const term_type_id = formData.get("term_type_id") as string;
  await (supabase as any).from("terms").insert({
    term: formData.get("term") as string,
    definition: formData.get("definition") as string,
    example: formData.get("example") as string,
    priority: parseInt((formData.get("priority") as string) || "0", 10),
    term_type_id: term_type_id ? parseInt(term_type_id, 10) : null,
  });
  revalidatePath("/humor");
}

export async function updateTerm(formData: FormData) {
  const supabase = createAdminClient();
  const id = formData.get("id") as string;
  const term_type_id = formData.get("term_type_id") as string;
  await (supabase as any)
    .from("terms")
    .update({
      term: formData.get("term") as string,
      definition: formData.get("definition") as string,
      example: formData.get("example") as string,
      priority: parseInt((formData.get("priority") as string) || "0", 10),
      term_type_id: term_type_id ? parseInt(term_type_id, 10) : null,
      modified_datetime_utc: new Date().toISOString(),
    })
    .eq("id", id);
  revalidatePath("/humor");
}

export async function deleteTerm(formData: FormData) {
  const supabase = createAdminClient();
  const id = formData.get("id") as string;
  await supabase.from("terms").delete().eq("id", id);
  revalidatePath("/humor");
}
