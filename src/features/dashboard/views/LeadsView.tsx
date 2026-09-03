import { useStore } from "@/lib/store/StoreProvider";
import { Panel, PanelTitle } from "../components/Panel";
import { BRL, fmtTelefone, tempoRelativo, whatsappHref as linkWhatsapp } from "@/lib/format";
import type { Lead } from "@/lib/store/types";
import { MessageCircle, Mail, Building2 } from "lucide-react";

/**
 * Leads do configurador do site (damage.group) — só leitura. Quem cria essas
 * linhas é o Route Handler do repo `DMG`, gravando direto no Firestore via
 * Firebase Admin; o painel só escuta (mesmo padrão de tempo real de
 * Clientes/Projetos). Por isso não tem modal de novo/editar aqui: não existe
 * "criar lead" no painel, só "responder o lead que chegou".
 */

function valorDoLead(l: Lead): { texto: string; sobOrcamento: boolean } {
  if (l.sobOrcamento) return { texto: "Sob orçamento", sobOrcamento: true };
  if (l.modalidade === "aluguel") {
    return {
      texto: `${l.planoRecorrente ?? "Aluguel"}${l.total ? ` · equivalente ${BRL(l.total)}` : ""}`,
      sobOrcamento: false,
    };
  }
  return { texto: BRL(l.total ?? 0), sobOrcamento: false };
}

function LeadCard({ lead }: { lead: Lead }) {
  const valor = valorDoLead(lead);
  return (
    <div className="relative flex flex-col gap-3 rounded-lg border border-dmg-border bg-dmg-surface-2/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate font-semibold">{lead.nome}</div>
          <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-dmg-text-3">
            {tempoRelativo(lead.criadoEm)}
          </div>
        </div>
        <span
          className={
            "shrink-0 rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] " +
            (lead.modalidade === "aluguel"
              ? "border-sky-500/30 bg-sky-500/10 text-sky-300"
              : "border-dmg-red-dark/50 bg-dmg-red-solid/10 text-dmg-red")
          }
        >
          {lead.modalidade === "aluguel" ? "aluguel" : "compra"}
        </span>
      </div>

      <div className="text-sm text-dmg-text-2">
        {lead.categoria}
        {lead.item && <span className="text-dmg-text-3"> / {lead.item}</span>}
      </div>

      <div
        className={"font-mono text-sm " + (valor.sobOrcamento ? "text-dmg-text-3" : "text-dmg-red")}
      >
        {valor.texto}
      </div>

      {lead.comentario && (
        <p className="rounded border border-dmg-border bg-dmg-surface px-3 py-2 text-xs text-dmg-text-2">
          {lead.comentario}
        </p>
      )}

      {lead.modulos?.length || lead.multiplicadores?.length ? (
        <div className="flex flex-wrap gap-1.5">
          {[...(lead.modulos ?? []), ...(lead.multiplicadores ?? [])].map((m, i) => (
            <span
              key={i}
              className="rounded border border-dmg-border-strong px-2 py-0.5 font-mono text-[10px] text-dmg-text-3"
            >
              {m.descricao}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-dmg-border pt-3 font-mono text-[11px] uppercase tracking-[0.1em]">
        <a
          href={linkWhatsapp(
            lead.whatsapp,
            `Olá, ${lead.nome}! Aqui é da DMG, vi seu pedido de orçamento no site.`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 normal-case tracking-normal text-dmg-text-2 hover:text-dmg-red"
        >
          <MessageCircle className="h-3.5 w-3.5" /> {fmtTelefone(lead.whatsapp)}
        </a>
        <a
          href={`mailto:${lead.email}`}
          className="inline-flex items-center gap-1.5 normal-case tracking-normal text-dmg-text-2 hover:text-dmg-red"
        >
          <Mail className="h-3.5 w-3.5" /> {lead.email}
        </a>
        {lead.empresa && (
          <span className="inline-flex items-center gap-1.5 normal-case tracking-normal text-dmg-text-3">
            <Building2 className="h-3.5 w-3.5" /> {lead.empresa}
          </span>
        )}
      </div>
    </div>
  );
}

export function LeadsView() {
  const { leads } = useStore();

  return (
    <Panel>
      <PanelTitle
        title="Leads do site"
        sub={`${leads.length} recebido${leads.length === 1 ? "" : "s"} ao todo`}
      />
      {leads.length === 0 ? (
        <p className="font-mono text-sm text-dmg-text-3">
          Nenhum lead ainda. Assim que alguém enviar o configurador de orçamento no site, aparece
          aqui na hora.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {leads.map((l) => (
            <LeadCard key={l.id} lead={l} />
          ))}
        </div>
      )}
    </Panel>
  );
}
