"use server";

import { createAdminClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export type MergedUser = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  is_superadmin: boolean;
  is_in_study: boolean;
  is_matrix_admin: boolean;
  created_datetime_utc: string | null;
};

type ProfileRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  is_superadmin: boolean;
  is_in_study: boolean;
  is_matrix_admin: boolean;
  created_datetime_utc: string | null;
};

type ProfileRowWithEmail = ProfileRow & { email: string | null };

async function mergeWithProfiles(userIds: string[]): Promise<Map<string, ProfileRow>> {
  if (!userIds.length) return new Map();
  const supabase = createAdminClient();
  const { data: profiles } = await (supabase as any)
    .from("profiles")
    .select("id, first_name, last_name, is_superadmin, is_in_study, is_matrix_admin, created_datetime_utc")
    .in("id", userIds);
  return new Map(((profiles ?? []) as ProfileRow[]).map((p) => [p.id, p]));
}

function buildUser(authUser: User, profile: ProfileRow | undefined): MergedUser {
  const meta = authUser.user_metadata ?? {};
  const fullName: string = (meta.full_name as string | undefined) ?? (meta.name as string | undefined) ?? "";
  const parts = fullName ? fullName.split(" ") : [];
  const metaFirst = parts[0] ?? null;
  const metaLast = parts.length > 1 ? parts.slice(1).join(" ") : null;

  return {
    id: authUser.id,
    email: authUser.email ?? null,
    first_name: profile?.first_name ?? (meta.first_name as string | undefined) ?? metaFirst,
    last_name: profile?.last_name ?? (meta.last_name as string | undefined) ?? metaLast,
    is_superadmin: profile?.is_superadmin ?? false,
    is_in_study: profile?.is_in_study ?? false,
    is_matrix_admin: profile?.is_matrix_admin ?? false,
    created_datetime_utc: profile?.created_datetime_utc ?? authUser.created_at ?? null,
  };
}

export async function loadUsers(page: number): Promise<{ users: MergedUser[]; total: number }> {
  const supabase = createAdminClient();
  const { data: authData, error } = await supabase.auth.admin.listUsers({
    page,
    perPage: 50,
  });

  if (error || !authData) return { users: [], total: 0 };

  const profileMap = await mergeWithProfiles(authData.users.map((u) => u.id));
  const users = authData.users.map((u) => buildUser(u, profileMap.get(u.id)));

  return { users, total: authData.total };
}

export async function searchUsers(query: string): Promise<MergedUser[]> {
  const supabase = createAdminClient();
  const q = query.trim();
  if (!q) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, is_superadmin, is_in_study, is_matrix_admin, created_datetime_utc, email")
    .or(`email.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%`)
    .limit(100);

  if (!profiles?.length) return [];

  return (profiles as ProfileRowWithEmail[]).map((p) => ({
    id: p.id,
    email: p.email ?? null,
    first_name: p.first_name ?? null,
    last_name: p.last_name ?? null,
    is_superadmin: p.is_superadmin ?? false,
    is_in_study: p.is_in_study ?? false,
    is_matrix_admin: p.is_matrix_admin ?? false,
    created_datetime_utc: p.created_datetime_utc ?? null,
  }));
}
