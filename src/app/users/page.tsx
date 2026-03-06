import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/AdminShell";
import { UsersTable } from "./UsersTable";

export default async function UsersPage() {
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const [{ data: profiles }, { count: totalCount }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, first_name, last_name, is_superadmin, is_in_study, is_matrix_admin, created_datetime_utc")
      .order("created_datetime_utc", { ascending: false })
      .range(0, 49),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  return (
    <AdminShell user={{ email: currentUser?.email }}>
      <div className="p-8 space-y-6">
        <div>
          <p className="cyber-label tracking-[0.2em]">{`// PROFILES`}</p>
          <h1 className="cyber-text font-mono text-3xl font-bold mt-1">USERS</h1>
          <p className="cyber-label mt-1">{totalCount ?? 0} TOTAL RECORDS</p>
        </div>
        <UsersTable initialData={profiles ?? []} totalCount={totalCount ?? 0} />
      </div>
    </AdminShell>
  );
}
