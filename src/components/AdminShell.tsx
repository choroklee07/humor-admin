import { SidebarNav } from "./SidebarNav";
import { LogoutButton } from "./LogoutButton";
import { ThemeToggle } from "./ThemeToggle";

interface Props {
  user: { email?: string | null };
  children: React.ReactNode;
}

export function AdminShell({ user, children }: Props) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-5 py-3 border-b border-[--header-border] bg-[--header-bg] shrink-0" style={{ borderColor: 'var(--header-border)', background: 'var(--header-bg)' }}>
        <div>
          <p className="cyber-text font-mono text-xs font-bold tracking-[0.2em]">
            {`// HUMOR`}
          </p>
          <p className="font-mono text-[0.6rem] tracking-[0.3em] text-[rgba(0,212,255,0.4)] mt-0.5">
            ADMIN PANEL
          </p>
        </div>
        <div className="flex items-center gap-4">
          <p className="cyber-label text-[0.6rem] truncate">{user.email}</p>
          <ThemeToggle />
          <LogoutButton />
        </div>
      </header>
      <div className="flex flex-1 min-h-0">
        <aside className="w-52 shrink-0 border-r" style={{ borderColor: 'var(--sidebar-border)', background: 'var(--sidebar-bg)' }}>
          <div className="py-3">
            <SidebarNav />
          </div>
        </aside>
        <div className="flex-1 min-w-0 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
