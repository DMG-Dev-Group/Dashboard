import { LayoutDashboard, FolderKanban, Users2, Wallet, CalendarDays, Server, ShieldCheck, BarChart3, Activity, Settings, UserSquare2 } from "lucide-react";

export type ViewId =
  | "dashboard"
  | "financeiro"
  | "projetos"
  | "equipe"
  | "clientes"
  | "calendario"
  | "atividades"
  | "infraestrutura"
  | "seguranca"
  | "analytics"
  | "config";

export interface NavItem {
  id: ViewId;
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  group: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Visão Geral", to: "/dashboard", icon: LayoutDashboard, group: "Principal" },
  { id: "financeiro", label: "Financeiro", to: "/financeiro", icon: Wallet, group: "Principal" },
  { id: "projetos", label: "Projetos", to: "/projetos", icon: FolderKanban, group: "Principal" },
  { id: "equipe", label: "Membros", to: "/equipe", icon: UserSquare2, group: "Principal" },
  { id: "clientes", label: "Clientes", to: "/clientes", icon: Users2, group: "Operação" },
  { id: "calendario", label: "Calendário", to: "/calendario", icon: CalendarDays, group: "Operação" },
  { id: "atividades", label: "Atividades", to: "/atividades", icon: Activity, group: "Operação" },
  { id: "infraestrutura", label: "Infraestrutura", to: "/infraestrutura", icon: Server, group: "Sistemas" },
  { id: "seguranca", label: "Segurança", to: "/seguranca", icon: ShieldCheck, group: "Sistemas" },
  { id: "analytics", label: "Analytics", to: "/analytics", icon: BarChart3, group: "Sistemas" },
  { id: "config", label: "Configurações", to: "/config", icon: Settings, group: "Sistemas" },
];

export const TITULOS: Record<ViewId | "projeto", [string, string]> = {
  dashboard: ["// visão geral", "Visão Geral"],
  projetos: ["// principal", "Projetos"],
  equipe: ["// principal", "Membros"],
  financeiro: ["// principal", "Financeiro"],
  clientes: ["// operação", "Clientes"],
  calendario: ["// operação", "Calendário"],
  atividades: ["// registro", "Atividades"],
  infraestrutura: ["// sistemas", "Infraestrutura"],
  seguranca: ["// sistemas", "Segurança"],
  analytics: ["// sistemas", "Analytics"],
  config: ["// sistemas", "Configurações"],
  projeto: ["// projetos", "Detalhes"],
};
