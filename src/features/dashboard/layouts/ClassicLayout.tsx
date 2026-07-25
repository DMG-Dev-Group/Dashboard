import { Link, useMatches, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { NAV_ITEMS, TITULOS, type ViewId } from "./navItems";
import { useAuth } from "@/features/auth/AuthProvider";
import { iniciaisDoUsuario, nomeDoUsuario } from "@/lib/userProfile";
import { NotificationsBellClassic } from "./NotificationsBellClassic";
import { Activity, Menu, Search, ShieldCheck } from "lucide-react";

/**
 * Painel "clássico" — sidebar 280px em vidro escuro, tile de marca serifado,
 * nav com brilho vermelho no item ativo, topbar com busca. Reconstrução
 * fiel do dashboard-classic.css original (visual do Miguel).
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
    <div className="layout-classic min-h-screen bg-dmg-bg text-dmg-text">
      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-white/10 bg-black/86 p-4 backdrop-blur-[40px] transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link to="/" className="flex items-center gap-3 px-2 pb-8 pt-2">
          <span className="relative grid h-11 w-11 place-items-center rounded-2xl border border-dmg-red-dark/45 bg-dmg-red-solid/15 shadow-[0_0_38px_rgba(192,24,26,.28)]">
            <span className="relative font-serif text-[15px] font-bold tracking-[-.04em] text-white">
              DMG
            </span>
          </span>
          <span className="leading-none">
            <p className="font-serif text-sm font-bold uppercase tracking-[.38em] text-white">
              Damage
            </p>
            <p className="mt-1 font-serif text-[10px] font-bold uppercase tracking-[.5em] text-dmg-red">
              Group
            </p>
          </span>
        </Link>

        <ul className="flex-1 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = matchNav(pathname, item.to);
            return (
              <li key={item.id}>
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`flex h-[46px] items-center gap-3 rounded-2xl border px-4 text-sm font-medium transition-colors ${
                    active
                      ? "border-dmg-red-solid/35 bg-dmg-red-solid/15 text-white shadow-[0_0_38px_rgba(192,24,26,.28)]"
                      : "border-transparent text-white/60 hover:bg-white/[.035] hover:text-white"
                  }`}
                >
                  <item.icon className={`h-4 w-4 shrink-0 ${active ? "text-dmg-red" : "text-white/45"}`} />
                  <span className="truncate">{item.label}</span>
                  {active && <span className="ml-auto text-dmg-red">›</span>}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="rounded-2xl border border-dmg-red-solid/30 bg-dmg-red-solid/[.08] p-4 shadow-[0_0_38px_rgba(192,24,26,.28)]">
          <div className="mb-3.5 flex items-center justify-between">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-dmg-red-solid text-white">
              <Activity className="h-[19px] w-[19px]" />
            </span>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[.1em] text-emerald-300">
              Online
            </span>
          </div>
          <p className="text-sm font-semibold text-white">Command Core</p>
          <small className="mt-1 block text-xs leading-relaxed text-white/48">
            Monitoramento em tempo real para as operações da DMG.
          </small>
        </div>
      </aside>

      {/* TOPBAR */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-black/72 px-4 py-3 backdrop-blur-[40px] md:px-7 lg:ml-[280px]">
        <button
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
          onClick={() => setOpen((o) => !o)}
        >
          <Menu className="h-[17px] w-[17px]" />
        </button>

        <div className="min-w-0">
          <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[.055] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[.22em] text-white/58 md:inline-flex">
            <ShieldCheck className="h-3 w-3 text-dmg-red" />
            Secure Ops
          </span>
          <h2 className="mt-1.5 hidden whitespace-nowrap text-[19px] font-semibold text-white md:block">
            Command Center
          </h2>
        </div>

        <div className="relative ml-auto hidden w-full max-w-[360px] md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-white/32" />
          <input
            placeholder="Buscar projetos, clientes, deploys..."
            className="h-11 w-full rounded-xl border border-white/10 bg-white/[.03] pl-10 pr-3.5 text-sm text-white outline-none placeholder:text-white/32 focus:border-dmg-red-solid/60"
          />
        </div>

        <div className="ml-auto md:ml-0">
          <NotificationsBellClassic />
        </div>

        <button
          onClick={() => {
            if (user && confirm(`Sair da conta de ${nome}?`)) signOut();
          }}
          title={`${nome} (clique para sair)`}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-dmg-red-dark/45 bg-dmg-red-solid/[.16] text-[13px] font-bold text-white shadow-[0_0_38px_rgba(192,24,26,.28)]"
        >
          {iniciais}
        </button>
      </header>

      <main className="min-h-[calc(100vh-64px)] px-4 py-5 md:px-7 md:py-6 lg:ml-[280px]">
        <div className="mx-auto flex max-w-[1680px] flex-col gap-5">
          {!isProjectDetail && (
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] font-bold uppercase tracking-[.32em] text-dmg-red-solid">
                  {label}
                </p>
                <h1 className="mt-2 text-[26px] font-extrabold leading-none tracking-[-.02em] text-white md:text-[34px]">
                  {title}
                  <span className="dmg-cursor">_</span>
                </h1>
              </div>
              <span className="hidden font-mono text-xs text-white/38 md:inline">
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
        </div>
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
