"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCaptionExample(formData: FormData) {
  const supabase = createAdminClient();
  const image_id = (formData.get("image_id") as string) || null;
  await (supabase as any).from("caption_examples").insert({
    image_description: formData.get("image_description") as string,
    caption: formData.get("caption") as string,
    explanation: formData.get("explanation") as string,
    priority: parseInt((formData.get("priority") as string) || "0", 10),
    image_id: image_id || null,
  });
  revalidatePath("/captions");
}

export async function updateCaptionExample(formData: FormData) {
  const supabase = createAdminClient();
  const id = formData.get("id") as string;
  const image_id = (formData.get("image_id") as string) || null;
  await (supabase as any)
    .from("caption_examples")
    .update({
      image_description: formData.get("image_description") as string,
      caption: formData.get("caption") as string,
      explanation: formData.get("explanation") as string,
      priority: parseInt((formData.get("priority") as string) || "0", 10),
      image_id: image_id || null,
      modified_datetime_utc: new Date().toISOString(),
    })
    .eq("id", id);
  revalidatePath("/captions");
}

export async function deleteCaptionExample(formData: FormData) {
  const supabase = createAdminClient();
  const id = formData.get("id") as string;
  await supabase.from("caption_examples").delete().eq("id", id);
  revalidatePath("/captions");
}
