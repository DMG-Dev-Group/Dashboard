import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store/StoreProvider";
import type { Cliente } from "@/lib/store/types";
import { calcularIdade, fmtDataBR, fmtTelefone, whatsappHref } from "@/lib/format";
import { projetosDoCliente } from "@/lib/store/relations";
import { Building2, Instagram, Mail, MessageCircle } from "lucide-react";

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

/** Tela cheia do cliente (abre ao clicar no corpo do card, fora dos ícones de editar/excluir). Só leitura. */
export function ClienteDetalheModal({
  cliente,
  onClose,
}: {
  cliente: Cliente;
  onClose: () => void;
}) {
  const { projetos } = useStore();
  const projs = projetosDoCliente(cliente, projetos);
  const contato = cliente.celular || cliente.contato;
  const idade = cliente.nascimento ? calcularIdade(cliente.nascimento) : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Linha label="Nome">{cliente.nome}</Linha>
        {cliente.nomeCompleto && cliente.nomeCompleto !== cliente.nome && (
          <Linha label="Nome completo">{cliente.nomeCompleto}</Linha>
        )}
        {contato && (
          <Linha label="Celular / WhatsApp">
            <a
              href={whatsappHref(contato, `Olá, ${cliente.nome}!`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-dmg-red"
            >
              <MessageCircle className="h-3.5 w-3.5" /> {fmtTelefone(contato)}
            </a>
          </Linha>
        )}
        {cliente.email && (
          <Linha label="E-mail">
            <a
              href={`mailto:${cliente.email}`}
              className="inline-flex items-center gap-1.5 hover:text-dmg-red"
            >
              <Mail className="h-3.5 w-3.5" /> {cliente.email}
            </a>
          </Linha>
        )}
        {cliente.instagram && (
          <Linha label="Instagram">
            <a
              href={`https://instagram.com/${cliente.instagram.replace(/^@/, "")}`}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 hover:text-dmg-red"
            >
              <Instagram className="h-3.5 w-3.5" /> {cliente.instagram}
            </a>
          </Linha>
        )}
        {cliente.empresa && (
          <Linha label="Empresa / loja">
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" /> {cliente.empresa}
            </span>
          </Linha>
        )}
        {cliente.nascimento && (
          <Linha label="Nascimento">
            {fmtDataBR(cliente.nascimento)}
            {idade !== null ? ` (${idade} anos)` : ""}
          </Linha>
        )}
        <Linha label="Cliente desde">{cliente.desde || "—"}</Linha>
      </div>

      {projs.length > 0 && (
        <div>
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-dmg-text-3">
            Projetos
          </div>
          <div className="flex flex-wrap gap-1.5">
            {projs.map((p) => (
              <Link
                key={p.id}
                to="/projetos/$id"
                params={{ id: p.id }}
                onClick={onClose}
                className="rounded border border-dmg-border-strong bg-dmg-surface px-2 py-0.5 font-mono text-[10px] text-dmg-text-2 hover:border-dmg-red-dark hover:text-dmg-red"
              >
                {p.nome} →
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
