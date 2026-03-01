import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/LogoutButton";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center gap-8 px-16 py-16 bg-white dark:bg-black sm:items-start">
        <header className="flex w-full items-center justify-between">
          <h1 className="text-xl font-semibold text-black dark:text-white">
            Admin Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {user?.email}
            </span>
            <LogoutButton />
          </div>
        </header>

        <div className="flex flex-col gap-6">
          <h2 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Welcome back
          </h2>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            You are signed in and can access protected content.
          </p>
        </div>

        <div className="mt-8 w-full rounded-lg border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 font-medium text-black dark:text-white">
            User Info
          </h3>
          <dl className="space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="text-zinc-500 dark:text-zinc-400">Email:</dt>
              <dd className="text-zinc-900 dark:text-zinc-100">{user?.email}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-zinc-500 dark:text-zinc-400">User ID:</dt>
              <dd className="font-mono text-zinc-900 dark:text-zinc-100">
                {user?.id}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-zinc-500 dark:text-zinc-400">Provider:</dt>
              <dd className="text-zinc-900 dark:text-zinc-100">
                {user?.app_metadata?.provider}
              </dd>
            </div>
          </dl>
        </div>
      </main>
    </div>
  );
}
