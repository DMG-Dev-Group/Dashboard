import { useStore } from "@/lib/store/StoreProvider";
import { useModal } from "../modals/ModalProvider";
import { useConfirm } from "../components/ConfirmProvider";
import { LeadDetalheModal } from "../modals/LeadDetalheModal";
import { BRL, fmtTelefone, tempoRelativo, whatsappHref as linkWhatsapp } from "@/lib/format";
import { dmgToast } from "@/lib/toast";
import type { Lead } from "@/lib/store/types";
import { MessageCircle, Mail, Building2, Trash2 } from "lucide-react";
import { ClassicEmpty, ClassicPanel, ClassicPill } from "../components/classic/ClassicUI";

/**
 * Mesma tela de LeadsView, no visual clássico. Read-only pelos mesmos
 * motivos: quem cria as linhas é o site, via Firebase Admin — o painel só
 * escuta em tempo real.
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

function LeadCardClassic({ lead }: { lead: Lead }) {
  const { remove, log } = useStore();
  const { open } = useModal();
  const confirm = useConfirm();
  const valor = valorDoLead(lead);

  async function excluir(e: React.MouseEvent) {
    e.stopPropagation();
    if (await confirm({ title: `Excluir o lead de "${lead.nome}"?`, danger: true })) {
      await remove("leads", lead.id);
      await log(`<b>Lead</b> — pedido de ${lead.nome} excluído`, "lead");
      dmgToast.success("Lead excluído");
    }
  }

  return (
    <div
      onClick={() => open("Lead do site", () => <LeadDetalheModal lead={lead} />)}
      className="flex cursor-pointer flex-col gap-3 rounded-2xl border border-white/8 bg-white/[.035] p-4 transition-all hover:-translate-y-0.5 hover:border-dmg-red-solid/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-[14.5px] font-semibold text-dmg-text">{lead.nome}</div>
          <div className="mt-0.5 text-[11px] text-white/40">{tempoRelativo(lead.criadoEm)}</div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <ClassicPill tone={lead.modalidade === "aluguel" ? "muted" : "default"}>
            {lead.modalidade === "aluguel" ? "aluguel" : "compra"}
          </ClassicPill>
          <button
            type="button"
            title="Excluir lead"
            onClick={excluir}
            className="rounded p-1 text-white/40 hover:text-dmg-red"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="text-[13px] text-dmg-text-2">
        {lead.categoria}
        {lead.item && <span className="text-white/40"> / {lead.item}</span>}
      </div>

      <div
        className={"font-mono text-sm " + (valor.sobOrcamento ? "text-white/40" : "text-dmg-red")}
      >
        {valor.texto}
      </div>

      {lead.comentario && (
        <p className="rounded-lg border border-white/8 bg-black/20 px-3 py-2 text-xs text-dmg-text-2">
          {lead.comentario}
        </p>
      )}

      {lead.modulos?.length || lead.multiplicadores?.length ? (
        <div className="flex flex-wrap gap-1.5">
          {[...(lead.modulos ?? []), ...(lead.multiplicadores ?? [])].map((m, i) => (
            <span
              key={i}
              className="rounded border border-white/10 px-2 py-0.5 text-[10px] text-white/40"
            >
              {m.descricao}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-white/8 pt-3 text-[11px]">
        <a
          href={linkWhatsapp(
            lead.whatsapp,
            `Olá, ${lead.nome}! Aqui é da DMG, vi seu pedido de orçamento no site.`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 text-dmg-text-2 hover:text-dmg-red"
        >
          <MessageCircle className="h-3.5 w-3.5" /> {fmtTelefone(lead.whatsapp)}
        </a>
        <a
          href={`mailto:${lead.email}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 text-dmg-text-2 hover:text-dmg-red"
        >
          <Mail className="h-3.5 w-3.5" /> {lead.email}
        </a>
        {lead.empresa && (
          <span className="inline-flex items-center gap-1.5 text-white/40">
            <Building2 className="h-3.5 w-3.5" /> {lead.empresa}
          </span>
        )}
      </div>
    </div>
  );
}

export function LeadsViewClassic() {
  const { leads } = useStore();

  return (
    <ClassicPanel
      title="Leads do site"
      sub={`${leads.length} recebido${leads.length === 1 ? "" : "s"} ao todo`}
    >
      {leads.length === 0 ? (
        <ClassicEmpty>
          Nenhum lead ainda. Assim que alguém enviar o configurador de orçamento no site, aparece
          aqui na hora.
        </ClassicEmpty>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
          {leads.map((l) => (
            <LeadCardClassic key={l.id} lead={l} />
          ))}
        </div>
      )}
    </ClassicPanel>
  );
}
