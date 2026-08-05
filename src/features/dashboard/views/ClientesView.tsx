import { Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store/StoreProvider";
import { Panel, PanelTitle } from "../components/Panel";
import { useModal } from "../modals/ModalProvider";
import { useConfirm } from "../components/ConfirmProvider";
import { ClienteModal } from "../modals/ClienteModal";
import { projetosDoCliente } from "@/lib/store/relations";
import { calcularIdade } from "@/lib/format";
import { dmgToast } from "@/lib/toast";
import { Building2, Instagram, Pencil, Plus, Trash2 } from "lucide-react";

export function ClientesView() {
  const { clientes, projetos, remove, log } = useStore();
  const { open } = useModal();
  const confirm = useConfirm();

  return (
    <Panel>
      <PanelTitle
        title="Base de clientes"
        sub="carteira ativa da DMG"
        action={
          <button
            onClick={() => open("Novo cliente", (close) => <ClienteModal onClose={close} />)}
            className="inline-flex items-center gap-1.5 rounded border border-dmg-border-strong bg-dmg-surface-2 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] hover:border-dmg-red-dark"
          >
            <Plus className="h-3.5 w-3.5" /> novo cliente
          </button>
        }
      />
      {clientes.length === 0 ? (
        <p className="font-mono text-sm text-dmg-text-3">Nenhum cliente cadastrado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clientes.map((c) => {
            const projs = projetosDoCliente(c, projetos);
            const contato = c.celular || c.email || c.contato;
            const idade = c.nascimento ? calcularIdade(c.nascimento) : null;
            return (
              <div
                key={c.id}
                className="relative flex gap-4 rounded-lg border border-dmg-border bg-dmg-surface-2/40 p-4"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-dmg-border-strong bg-dmg-surface font-bold text-dmg-red">
                  {c.nome[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{c.nome}</div>
                  {c.nomeCompleto && c.nomeCompleto !== c.nome && (
                    <div className="text-[11px] text-dmg-text-3 truncate">{c.nomeCompleto}</div>
                  )}
                  <div className="text-xs text-dmg-text-2 truncate">{contato || "sem contato"}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.14em] text-dmg-text-3">
                    <span>desde {c.desde || "—"}</span>
                    {idade !== null && <span>{idade} anos</span>}
                    {c.empresa && (
                      <span className="inline-flex items-center gap-1 normal-case tracking-normal">
                        <Building2 className="h-3 w-3" /> {c.empresa}
                      </span>
                    )}
                    {c.instagram && (
                      <a
                        href={`https://instagram.com/${c.instagram.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center gap-1 normal-case tracking-normal hover:text-dmg-red"
                      >
                        <Instagram className="h-3 w-3" /> {c.instagram}
                      </a>
                    )}
                  </div>
                  {projs.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {projs.map((p) => (
                        <Link
                          key={p.id}
                          to="/projetos/$id"
                          params={{ id: p.id }}
                          className="rounded border border-dmg-border-strong bg-dmg-surface px-2 py-0.5 font-mono text-[10px] text-dmg-text-2 hover:border-dmg-red-dark hover:text-dmg-red"
                        >
                          {p.nome} →
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                <div className="absolute top-2 right-2 flex gap-0.5">
                  <button
                    onClick={() => open("Editar cliente", (close) => <ClienteModal cliente={c} onClose={close} />)}
                    className="rounded p-1 text-dmg-text-3 hover:text-dmg-text"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={async () => {
                      if (await confirm({ title: `Remover o cliente "${c.nome}"?`, danger: true })) {
                        await remove("clientes", c.id);
                        await log(`<b>Cliente</b> — ${c.nome} removido`, "cliente");
                        dmgToast.success("Cliente removido");
                      }
                    }}
                    className="rounded p-1 text-dmg-text-3 hover:text-dmg-red"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
