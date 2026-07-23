import type { ProjectStatus } from "./types";

export const STATUS: Record<ProjectStatus, { label: string; cls: string }> = {
  producao: { label: "produção", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
  dev: { label: "desenvolvimento", cls: "bg-amber-500/10 text-amber-300 border-amber-500/30" },
  plan: { label: "planejamento", cls: "bg-sky-500/10 text-sky-300 border-sky-500/30" },
  done: { label: "concluído", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
};

export const EV_TIPOS: Record<string, string> = {
  reuniao: "Reunião",
  entrega: "Entrega",
  deadline: "Deadline",
  outro: "Outro",
};

export const RESPONSAVEIS = ["Daniel", "Miguel", "Guilherme", "Equipe"] as const;
