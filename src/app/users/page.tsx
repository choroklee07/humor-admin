import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/AdminShell";
import { UsersTable } from "./UsersTable";
import { loadUsers } from "./actions";

export default async function UsersPage() {
  const sessionClient = await createClient();
  const {
    data: { user: currentUser },
  } = await sessionClient.auth.getUser();

  const { users, total } = await loadUsers(1);

  return (
    <AdminShell user={{ email: currentUser?.email }}>
      <div className="p-8 space-y-6">
        <div>
          <p className="cyber-label tracking-[0.2em]">{`// PROFILES`}</p>
          <h1 className="cyber-text font-mono text-3xl font-bold mt-1">USERS</h1>
          <p className="cyber-label mt-1">{total} TOTAL RECORDS</p>
        </div>
        <UsersTable initialData={users} totalCount={total} />
      </div>
    </AdminShell>
  );
}
