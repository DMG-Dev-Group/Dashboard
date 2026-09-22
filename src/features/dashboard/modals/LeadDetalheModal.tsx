import { useState, type ReactNode } from "react";
import { useStore } from "@/lib/store/StoreProvider";
import type { Lead } from "@/lib/store/types";
import { BRL, fmtDataHoraCompleta, fmtTelefone, whatsappHref } from "@/lib/format";
import { dmgToast } from "@/lib/toast";
import { Building2, Mail, MessageCircle } from "lucide-react";

function Linha({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-dmg-text-3">
        {label}
      </div>
      <div className="mt-0.5 text-sm text-dmg-text">{children}</div>
    </div>
  );
}

function valorDoLead(l: Lead): string {
  if (l.sobOrcamento) return "sob orçamento";
  if (l.modalidade === "aluguel")
    return `${l.planoRecorrente ?? "aluguel"}${l.total ? ` — equivalente a ${BRL(l.total)}` : ""}`;
  return BRL(l.total ?? 0);
}

/**
 * Tela cheia do lead (abre ao clicar no card em /leads). É a única tela do
 * módulo de leads que escreve no Firestore: "Adicionar aos projetos" cria um
 * Cliente e um Projeto vinculados a ele — só com os dados que o lead já traz
 * (nome, whatsapp, email, empresa), sem pedir nada novo no site.
 */
export function LeadDetalheModal({ lead }: { lead: Lead }) {
  const { add, log } = useStore();
  const [estado, setEstado] = useState<"idle" | "criando" | "criado">("idle");

  async function adicionarAosProjetos() {
    setEstado("criando");
    try {
      const clienteId = await add("clientes", {
        nome: lead.nome,
        celular: lead.whatsapp,
        email: lead.email,
        ...(lead.empresa ? { empresa: lead.empresa } : {}),
      });
      await log(`<b>Cliente</b> — ${lead.nome} adicionado a partir de um lead do site`, "cliente");
      await add("projetos", {
        nome: [lead.categoria, lead.item].filter(Boolean).join(" — "),
        tipo: lead.categoria,
        clienteId,
        status: "plan",
        progresso: 0,
        valor: lead.sobOrcamento ? 0 : (lead.total ?? lead.subtotal ?? 0),
        desc: lead.comentario ?? "",
      });
      await log(`<b>Projeto</b> — criado a partir do lead de ${lead.nome}`, "projeto");
      dmgToast.success("Cliente e projeto criados a partir do lead");
      setEstado("criado");
    } catch (err) {
      console.error(err);
      dmgToast.error("Não deu pra criar o cliente/projeto. Tenta de novo.");
      setEstado("idle");
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Linha label="Nome">{lead.nome}</Linha>
        <Linha label="Recebido em">{fmtDataHoraCompleta(lead.criadoEm)}</Linha>
        <Linha label="WhatsApp">
          <a
            href={whatsappHref(
              lead.whatsapp,
              `Olá, ${lead.nome}! Aqui é da DMG, vi seu pedido de orçamento no site.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-dmg-red"
          >
            <MessageCircle className="h-3.5 w-3.5" /> {fmtTelefone(lead.whatsapp)}
          </a>
        </Linha>
        <Linha label="E-mail">
          <a
            href={`mailto:${lead.email}`}
            className="inline-flex items-center gap-1.5 hover:text-dmg-red"
          >
            <Mail className="h-3.5 w-3.5" /> {lead.email}
          </a>
        </Linha>
        {lead.empresa && (
          <Linha label="Empresa">
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" /> {lead.empresa}
            </span>
          </Linha>
        )}
        <Linha label="Categoria / item">
          {lead.categoria}
          {lead.item ? ` / ${lead.item}` : ""}
        </Linha>
        <Linha label="Modalidade">{lead.modalidade === "aluguel" ? "Aluguel" : "Compra"}</Linha>
        <Linha label="Valor">{valorDoLead(lead)}</Linha>
      </div>

      {lead.modulos?.length || lead.multiplicadores?.length ? (
        <div>
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-dmg-text-3">
            Itens configurados
          </div>
          <div className="space-y-1">
            {[...(lead.modulos ?? []), ...(lead.multiplicadores ?? [])].map((m, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded border border-dmg-border bg-dmg-surface-2 px-3 py-1.5 text-xs"
              >
                <span className="text-dmg-text-2">{m.descricao}</span>
                <span className="font-mono text-dmg-text-3">{BRL(m.valor)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {lead.comentario && (
        <Linha label="Comentário">
          <p className="rounded border border-dmg-border bg-dmg-surface-2 px-3 py-2 text-dmg-text-2">
            {lead.comentario}
          </p>
        </Linha>
      )}

      <div className="border-t border-dmg-border pt-4">
        <button
          type="button"
          onClick={adicionarAosProjetos}
          disabled={estado !== "idle"}
          className="inline-flex items-center gap-1.5 rounded bg-dmg-red-solid px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white hover:bg-dmg-red-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {estado === "criado"
            ? "Adicionado aos projetos ✓"
            : estado === "criando"
              ? "Adicionando…"
              : "Adicionar aos projetos"}
        </button>
      </div>
    </div>
  );
}
