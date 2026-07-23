import { Link, useMatches, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { NAV_ITEMS, TITULOS, type ViewId } from "./navItems";
import { useAuth } from "@/features/auth/AuthProvider";
import { iniciaisDoUsuario, nomeDoUsuario } from "@/lib/userProfile";
import logoUrl from "@/assets/logo.svg";
import { Menu } from "lucide-react";

/**
 * Painel "novo" — sidebar compacta, topbar minimalista.
 */
export function ModernLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const matches = useMatches();
  const currentView = deriveView(pathname);
  const [label, title] = TITULOS[currentView] ?? TITULOS.dashboard;

  const nome = user ? nomeDoUsuario(user) : "";
  const iniciais = user ? iniciaisDoUsuario(nome) : "?";
  const isProjectDetail = matches.some((m) => m.routeId.includes("projetos/$id"));

  return (
    <div className="layout-modern min-h-screen bg-dmg-bg text-dmg-text">
      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-dmg-border bg-dmg-surface transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link to="/" className="flex items-center gap-3 border-b border-dmg-border px-6 py-5">
          <img src={logoUrl} alt="DMG" width={34} height={34} />
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-dmg-text-2">
            Damage<b className="text-dmg-red">Group</b>
          </span>
        </Link>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {groupNav().map((group) => (
            <div key={group.name} className="mb-6">
              <p className="mb-2 px-3 font-mono text-[10px] uppercase tracking-[0.28em] text-dmg-text-3">
                {group.name}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active = matchNav(pathname, item.to);
                  return (
                    <li key={item.id}>
                      <Link
                        to={item.to}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 rounded px-3 py-2 font-mono text-[12px] uppercase tracking-[0.1em] transition-colors ${
                          active
                            ? "bg-dmg-red-solid/10 text-dmg-red border-l-2 border-dmg-red"
                            : "text-dmg-text-2 hover:bg-dmg-surface-2 hover:text-dmg-text"
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-dmg-border px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <p className="text-xs font-bold">Command Core</p>
              <small className="font-mono text-[10px] uppercase tracking-[0.16em] text-dmg-text-3">
                Firestore em tempo real
              </small>
            </div>
          </div>
        </div>
      </aside>

      {/* TOPBAR */}
      <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-dmg-border bg-dmg-bg/85 px-4 md:px-8 py-3 backdrop-blur lg:ml-64">
        <button
          className="lg:hidden rounded p-2 hover:bg-dmg-surface-2"
          onClick={() => setOpen((o) => !o)}
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="hidden sm:inline font-mono text-xs uppercase tracking-[0.24em] text-dmg-text-2">
          Command Center
        </span>
        <span className="ml-auto hidden md:inline font-mono text-[11px] uppercase tracking-[0.1em] text-dmg-text-3">
          //{" "}
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </span>
        <button
          onClick={() => {
            if (user && confirm(`Sair da conta de ${nome}?`)) signOut();
          }}
          title={`${nome} (clique para sair)`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-dmg-border-strong bg-dmg-surface font-bold text-dmg-red hover:border-dmg-red-dark"
        >
          {iniciais}
        </button>
      </header>

      <main className="lg:ml-64 min-h-[calc(100vh-56px)] px-4 md:px-8 py-6 md:py-8">
        {!isProjectDetail && (
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mono-label">{label}</p>
              <h1 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight">
                {title}
                <span className="dmg-cursor">_</span>
              </h1>
            </div>
          </div>
        )}
        {children}
      </main>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function groupNav() {
  const map = new Map<string, typeof NAV_ITEMS>();
  for (const item of NAV_ITEMS) {
    if (!map.has(item.group)) map.set(item.group, []);
    map.get(item.group)!.push(item);
  }
  return Array.from(map.entries()).map(([name, items]) => ({ name, items }));
}

function deriveView(pathname: string): ViewId | "projeto" {
  if (pathname.startsWith("/projetos/")) return "projeto";
  const seg = pathname.split("/")[1] || "dashboard";
  return (seg as ViewId) || "dashboard";
}

function matchNav(pathname: string, to: string): boolean {
  if (to === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(to);
}
