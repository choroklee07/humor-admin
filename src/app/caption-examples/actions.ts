"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCaptionExample(formData: FormData) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const image_id = (formData.get("image_id") as string) || null;
  await supabase.from("caption_examples").insert({
    image_description: formData.get("image_description") as string,
    caption: formData.get("caption") as string,
    explanation: formData.get("explanation") as string,
    priority: parseInt((formData.get("priority") as string) || "0", 10),
    image_id: image_id || null,
  });
  revalidatePath("/caption-examples");
}

export async function updateCaptionExample(formData: FormData) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const id = formData.get("id") as string;
  const image_id = (formData.get("image_id") as string) || null;
  await supabase
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
  revalidatePath("/caption-examples");
}

export async function deleteCaptionExample(formData: FormData) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const id = formData.get("id") as string;
  await supabase.from("caption_examples").delete().eq("id", id);
  revalidatePath("/caption-examples");
}
