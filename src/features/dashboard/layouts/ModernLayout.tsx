import { Link, useMatches, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { NAV_ITEMS, TITULOS, type NavItem, type ViewId } from "./navItems";
import { useAuth } from "@/features/auth/AuthProvider";
import { iniciaisDoUsuario, nomeDoUsuario } from "@/lib/userProfile";
import { NotificationsBellModern } from "./NotificationsBellModern";
import { useConfirm } from "../components/ConfirmProvider";
import { useSidebarPrefs, sortByOrder } from "./useSidebarPrefs";
import { useNavSummaries } from "./useNavSummaries";
import { useDragReorder } from "@/hooks/useDragReorder";
import { useHoverCapable } from "@/hooks/useHoverCapable";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import logoUrl from "@/assets/logo.svg";
import { Eye, EyeOff, GripVertical, Menu, SlidersHorizontal } from "lucide-react";

/**
 * Painel "novo" — sidebar compacta, topbar minimalista.
 */
export function ModernLayout({ children }: { children: ReactNode }) {
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

  const grupos = groupNav(prefs.order);

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

        <TooltipProvider delayDuration={1000}>
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {grupos.map((grupo) => (
              <NavGroup
                key={grupo.name}
                grupo={grupo}
                pathname={pathname}
                personalizando={personalizando}
                hoverCapaz={hoverCapaz}
                hidden={prefs.hidden}
                summaries={summaries}
                onNavigate={() => setOpen(false)}
                onToggleHidden={prefs.toggleHidden}
                onReorderGroup={(novosItens) => {
                  const novaOrdem = grupos
                    .flatMap((g) => (g.name === grupo.name ? novosItens : g.items))
                    .map((i) => i.id);
                  void prefs.setOrder(novaOrdem);
                }}
              />
            ))}
          </nav>
        </TooltipProvider>

        <div className="border-t border-dmg-border px-4 py-3">
          <button
            onClick={() => setPersonalizando((p) => !p)}
            className={`mb-2 flex w-full items-center gap-2 rounded px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] ${
              personalizando
                ? "bg-dmg-red-solid/15 text-dmg-red"
                : "text-dmg-text-3 hover:text-dmg-text"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {personalizando ? "concluir personalização" : "personalizar menu"}
          </button>
          <div className="flex items-center gap-3 px-2 py-1">
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
        <NotificationsBellModern />
        <button
          onClick={async () => {
            if (user && (await confirm({ title: `Sair da conta de ${nome}?` }))) signOut();
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
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}

function NavGroup({
  grupo,
  pathname,
  personalizando,
  hoverCapaz,
  hidden,
  summaries,
  onNavigate,
  onToggleHidden,
  onReorderGroup,
}: {
  grupo: { name: string; items: NavItem[] };
  pathname: string;
  personalizando: boolean;
  hoverCapaz: boolean;
  hidden: ViewId[];
  summaries: ReturnType<typeof useNavSummaries>;
  onNavigate: () => void;
  onToggleHidden: (id: ViewId) => void;
  onReorderGroup: (items: NavItem[]) => void;
}) {
  const { getDragProps, draggingIndex, overIndex } = useDragReorder(grupo.items, onReorderGroup);
  const visiveis = personalizando ? grupo.items : grupo.items.filter((i) => !hidden.includes(i.id));
  if (visiveis.length === 0) return null;

  return (
    <div className="mb-6">
      <p className="mb-2 px-3 font-mono text-[10px] uppercase tracking-[0.28em] text-dmg-text-3">
        {grupo.name}
      </p>
      <ul className="space-y-1">
        {visiveis.map((item) => {
          const active = matchNav(pathname, item.to);
          const isHidden = hidden.includes(item.id);
          const summary = summaries[item.id];
          const index = grupo.items.indexOf(item);

          const content = (
            <div
              className={`flex items-center gap-2 rounded px-3 py-2 font-mono text-[12px] uppercase tracking-[0.1em] transition-colors ${
                active
                  ? "bg-dmg-red-solid/10 text-dmg-red border-l-2 border-dmg-red"
                  : "text-dmg-text-2 hover:bg-dmg-surface-2 hover:text-dmg-text"
              } ${isHidden ? "opacity-40" : ""} ${overIndex === index && draggingIndex !== null && draggingIndex !== index ? "ring-1 ring-dmg-red" : ""}`}
            >
              {personalizando && (
                <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-dmg-text-3" />
              )}
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {personalizando && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleHidden(item.id);
                  }}
                  className="shrink-0 rounded p-1 hover:text-dmg-text"
                  title={isHidden ? "mostrar" : "ocultar"}
                >
                  {isHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
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
                    <Link to={item.to} onClick={onNavigate}>
                      {content}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="border border-dmg-border-strong bg-dmg-surface-2 text-dmg-text"
                  >
                    <p className="mb-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-dmg-text-3">
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
                <Link to={item.to} onClick={onNavigate}>
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function groupNav(order: ViewId[]) {
  const map = new Map<string, NavItem[]>();
  for (const item of NAV_ITEMS) {
    if (!map.has(item.group)) map.set(item.group, []);
    map.get(item.group)!.push(item);
  }
  return Array.from(map.entries()).map(([name, items]) => ({
    name,
    items: sortByOrder(items, order),
  }));
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
