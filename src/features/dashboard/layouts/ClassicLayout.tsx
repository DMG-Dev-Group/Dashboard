import { Link, useMatches, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { NAV_ITEMS, TITULOS, type ViewId } from "./navItems";
import { useAuth } from "@/features/auth/AuthProvider";
import { iniciaisDoUsuario, nomeDoUsuario } from "@/lib/userProfile";
import { Bell, Menu, Search, Shield } from "lucide-react";

/**
 * Painel "clássico" — sidebar cheia com tile DMG, topbar com busca,
 * fonte Geist. Visual do Miguel.
 */
export function ClassicLayout({ children }: { children: ReactNode }) {
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
    <div className="layout-classic min-h-screen bg-dmg-bg text-dmg-text" style={{ fontFamily: "Geist, Archivo, system-ui, sans-serif" }}>
      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-dmg-border bg-gradient-to-b from-dmg-surface to-dmg-bg transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link to="/" className="flex items-center gap-3 border-b border-dmg-border px-6 py-6">
          <span className="flex h-10 w-10 items-center justify-center rounded border border-dmg-red-dark bg-dmg-red-solid font-black text-white shadow-[0_0_16px_rgba(192,24,26,0.35)]">
            DMG
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold">Damage</p>
            <p className="text-xs font-mono uppercase tracking-[0.24em] text-dmg-text-3">Group</p>
          </div>
        </Link>

        <ul className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const active = matchNav(pathname, item.to);
            return (
              <li key={item.id}>
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all ${
                    active
                      ? "bg-dmg-red-solid/15 text-dmg-red font-medium ring-1 ring-inset ring-dmg-red-dark/40"
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

        <div className="m-3 rounded-lg border border-dmg-border bg-dmg-surface-2 p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400">Online</span>
          </div>
          <p className="mt-2 text-sm font-bold">Command Core</p>
          <small className="text-xs text-dmg-text-3">
            Monitoramento em tempo real para as operações da DMG.
          </small>
        </div>
      </aside>

      {/* TOPBAR */}
      <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-dmg-border bg-dmg-bg/85 px-4 md:px-8 py-4 backdrop-blur-lg lg:ml-72">
        <button
          className="lg:hidden rounded p-2 hover:bg-dmg-surface-2"
          onClick={() => setOpen((o) => !o)}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden md:block">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-[0.14em] text-emerald-400">
            <Shield className="h-3 w-3" /> Secure Ops
          </span>
          <h2 className="mt-1 text-lg font-bold tracking-tight">Command Center</h2>
        </div>
        <div className="ml-auto hidden md:flex items-center gap-2 rounded-md border border-dmg-border bg-dmg-surface-2 px-3 py-2 w-72">
          <Search className="h-4 w-4 text-dmg-text-3" />
          <input
            placeholder="Buscar projetos, clientes, deploys..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-dmg-text-3"
          />
        </div>
        <button className="relative rounded-md border border-dmg-border p-2 text-dmg-text-2 hover:text-dmg-text" title="Notificações">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-dmg-red" />
        </button>
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

      <main className="lg:ml-72 min-h-[calc(100vh-64px)] px-4 md:px-8 py-6 md:py-8">
        {!isProjectDetail && (
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mono-label">{label}</p>
              <h1 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight">
                {title}
                <span className="dmg-cursor">_</span>
              </h1>
            </div>
            <span className="hidden md:inline font-mono text-[11px] uppercase tracking-[0.1em] text-dmg-text-3">
              //{" "}
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
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

function deriveView(pathname: string): ViewId | "projeto" {
  if (pathname.startsWith("/projetos/")) return "projeto";
  const seg = pathname.split("/")[1] || "dashboard";
  return (seg as ViewId) || "dashboard";
}

function matchNav(pathname: string, to: string): boolean {
  if (to === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(to);
}
