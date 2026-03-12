"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const PIPELINE_BASE = "https://api.almostcrackd.ai";

export async function uploadImageViaPipeline(formData: FormData) {
  const sessionClient = await createClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No file provided" };

  const token = process.env.PIPELINE_API_TOKEN;
  const authHeader = { Authorization: `Bearer ${token}` };

  // Step 1: Get presigned URL
  const presignedRes = await fetch(`${PIPELINE_BASE}/pipeline/generate-presigned-url`, {
    method: "POST",
    headers: { ...authHeader, "Content-Type": "application/json" },
    body: JSON.stringify({ contentType: file.type }),
  });
  if (!presignedRes.ok) return { error: `Presigned URL failed: ${presignedRes.status}` };
  const { presignedUrl, cdnUrl } = await presignedRes.json();

  // Step 2: Upload file bytes directly to the presigned URL
  const uploadRes = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: await file.arrayBuffer(),
  });
  if (!uploadRes.ok) return { error: `Upload failed: ${uploadRes.status}` };

  // Step 3: Register with pipeline (creates the images record)
  const isCommonUse = formData.get("is_common_use") === "on";
  const registerRes = await fetch(`${PIPELINE_BASE}/pipeline/upload-image-from-url`, {
    method: "POST",
    headers: { ...authHeader, "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse }),
  });
  if (!registerRes.ok) return { error: `Pipeline register failed: ${registerRes.status}` };
  const { imageId } = await registerRes.json();

  // Update fields the pipeline doesn't set
  const supabase = createAdminClient();
  const additional_context = (formData.get("additional_context") as string) || null;
  const is_public = formData.get("is_public") === "on";
  await (supabase as any)
    .from("images")
    .update({ additional_context, is_public, modified_datetime_utc: new Date().toISOString() })
    .eq("id", imageId);

  revalidatePath("/images");
  return { success: true };
}

export async function loadMoreImages(offset: number) {
  const supabase = createAdminClient();
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
  const sessionClient = await createClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();
  if (!user) return;

  const supabase = createAdminClient();
  await (supabase as any).from("images").insert({
    url: formData.get("url") as string,
    is_public: formData.get("is_public") === "on",
    is_common_use: formData.get("is_common_use") === "on",
    additional_context: (formData.get("additional_context") as string) || null,
    profile_id: user.id,
  });
  revalidatePath("/images");
}

export async function updateImage(formData: FormData) {
  const supabase = createAdminClient();
  const id = formData.get("id") as string;

  await (supabase as any)
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
  const supabase = createAdminClient();
  const id = formData.get("id") as string;
  await supabase.from("images").delete().eq("id", id);
  revalidatePath("/images");
}
