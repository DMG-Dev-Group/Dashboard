import { useMemo } from "react";
import { useStore } from "@/lib/store/StoreProvider";
import { EV_TIPOS } from "@/lib/store/constants";
import { BRL, fmtDia, isoDay, tempoRelativo } from "@/lib/format";
import type { Lead } from "@/lib/store/types";

export interface Notificacao {
  id: string;
  titulo: string;
  meta: string;
  href: string;
}

const LEADS_RECENTES_MS = 7 * 24 * 60 * 60 * 1000;

function valorDoLead(l: Lead): string {
  if (l.sobOrcamento) return "sob orçamento";
  if (l.modalidade === "aluguel")
    return `aluguel${l.planoRecorrente ? ` · ${l.planoRecorrente}` : ""}`;
  return BRL(l.total ?? 0);
}

/**
 * Notificações reais derivadas dos dados já existentes no painel: próximos
 * eventos do calendário + leads recentes do configurador do site (gatilho
 * que este hook já vinha comentado esperando). Pagamento confirmado etc.
 * entram do mesmo jeito quando existirem.
 */
export function useNotificacoes() {
  const { eventos, leads } = useStore();

  const items = useMemo<Notificacao[]>(() => {
    const hoje = isoDay(new Date());
    const doEventos: Notificacao[] = eventos
      .filter((e) => e.data >= hoje)
      .slice()
      .sort((a, b) => `${a.data}${a.hora ?? ""}`.localeCompare(`${b.data}${b.hora ?? ""}`))
      .slice(0, 6)
      .map((e) => ({
        id: e.id,
        titulo: e.titulo,
        meta: `${EV_TIPOS[e.tipo || "outro"] || "Evento"} · ${fmtDia(e.data)}${e.hora ? ` · ${e.hora}` : ""}`,
        href: "/calendario",
      }));

    const corte = Date.now() - LEADS_RECENTES_MS;
    const doLeads: Notificacao[] = leads
      .filter((l) => l.criadoEm >= corte)
      .slice(0, 6)
      .map((l) => ({
        id: l.id,
        titulo: `Novo lead — ${l.nome}`,
        meta: `${l.categoria}${l.item ? ` / ${l.item}` : ""} · ${valorDoLead(l)} · ${tempoRelativo(l.criadoEm)}`,
        href: "/leads",
      }));

    // Leads primeiro — é o gatilho que a DMG mais quer ver na hora.
    return [...doLeads, ...doEventos];
  }, [eventos, leads]);

  return { items };
}
