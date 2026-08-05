import { Link, useMatches, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { NAV_ITEMS, TITULOS, type ViewId } from "./navItems";
import { useAuth } from "@/features/auth/AuthProvider";
import { iniciaisDoUsuario, nomeDoUsuario } from "@/lib/userProfile";
import { NotificationsBellClassic } from "./NotificationsBellClassic";
import { useConfirm } from "../components/ConfirmProvider";
import { useSidebarPrefs, sortByOrder } from "./useSidebarPrefs";
import { useNavSummaries } from "./useNavSummaries";
import { useDragReorder } from "@/hooks/useDragReorder";
import { useHoverCapable } from "@/hooks/useHoverCapable";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Activity,
  Eye,
  EyeOff,
  GripVertical,
  Menu,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

/**
 * Painel "clássico" — sidebar 280px em vidro escuro, tile de marca serifado,
 * nav com brilho vermelho no item ativo, topbar com busca. Reconstrução
 * fiel do dashboard-classic.css original (visual do Miguel).
 */
export function ClassicLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [personalizando, setPersonalizando] = useState(false);
  const { user, signOut } = useAuth();
  const confirm = useConfirm();
  const prefs = useSidebarPrefs(user?.uid);
  const summaries = useNavSummaries();
  const hoverCapaz = useHoverCapable();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const matches = useMatches();
  const currentView = deriveView(pathname);
  const [label, title] = TITULOS[currentView] ?? TITULOS.dashboard;

  const nome = user ? nomeDoUsuario(user) : "";
  const iniciais = user ? iniciaisDoUsuario(nome) : "?";
  const isProjectDetail = matches.some((m) => m.routeId.includes("projetos/$id"));

  const itensOrdenados = sortByOrder(NAV_ITEMS, prefs.order);
  const itensVisiveis = personalizando
    ? itensOrdenados
    : itensOrdenados.filter((i) => !prefs.hidden.includes(i.id));
  const { getDragProps, draggingIndex, overIndex } = useDragReorder(itensOrdenados, (next) =>
    prefs.setOrder(next.map((i) => i.id)),
  );

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

        <TooltipProvider delayDuration={1000}>
          <ul className="flex-1 space-y-1 overflow-y-auto">
            {itensVisiveis.map((item) => {
              const active = matchNav(pathname, item.to);
              const isHidden = prefs.hidden.includes(item.id);
              const summary = summaries[item.id];
              const index = itensOrdenados.indexOf(item);

              const content = (
                <div
                  className={`flex h-[46px] items-center gap-3 rounded-2xl border px-4 text-sm font-medium transition-colors ${
                    active
                      ? "border-dmg-red-solid/35 bg-dmg-red-solid/15 text-white shadow-[0_0_38px_rgba(192,24,26,.28)]"
                      : "border-transparent text-white/60 hover:bg-white/[.035] hover:text-white"
                  } ${isHidden ? "opacity-40" : ""} ${
                    overIndex === index && draggingIndex !== null && draggingIndex !== index
                      ? "ring-1 ring-dmg-red-solid"
                      : ""
                  }`}
                >
                  {personalizando && (
                    <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-white/40" />
                  )}
                  <item.icon
                    className={`h-4 w-4 shrink-0 ${active ? "text-dmg-red" : "text-white/45"}`}
                  />
                  <span className="flex-1 truncate">{item.label}</span>
                  {personalizando ? (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        prefs.toggleHidden(item.id);
                      }}
                      className="shrink-0 rounded p-1 text-white/60 hover:text-white"
                      title={isHidden ? "mostrar" : "ocultar"}
                    >
                      {isHidden ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  ) : (
                    active && <span className="ml-auto text-dmg-red">›</span>
                  )}
                </div>
              );

              if (personalizando) {
                return (
                  <li key={item.id} {...getDragProps(index)}>
                    {content}
                  </li>
                );
              }

              return (
                <li key={item.id}>
                  {hoverCapaz && summary ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link to={item.to} onClick={() => setOpen(false)}>
                          {content}
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="border border-white/10 bg-black/90 text-white"
                      >
                        <p className="mb-0.5 text-[10px] font-medium uppercase tracking-[.14em] text-white/50">
                          {item.label}
                        </p>
                        {summary.lines.map((l, i) => (
                          <p key={i} className="text-xs">
                            {l}
                          </p>
                        ))}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Link to={item.to} onClick={() => setOpen(false)}>
                      {content}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </TooltipProvider>

        <button
          onClick={() => setPersonalizando((p) => !p)}
          className={`mb-3 flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-medium uppercase tracking-[.1em] ${
            personalizando ? "bg-dmg-red-solid/20 text-dmg-red" : "text-white/50 hover:text-white"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {personalizando ? "concluir personalização" : "personalizar menu"}
        </button>

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
          onClick={async () => {
            if (user && (await confirm({ title: `Sair da conta de ${nome}?` }))) signOut();
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
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />
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
