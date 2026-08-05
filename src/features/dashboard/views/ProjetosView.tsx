import { Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store/StoreProvider";
import { Panel, PanelTitle } from "../components/Panel";
import { StatusBadge } from "../components/StatusBadge";
import { ProgressBar } from "../components/ProgressBar";
import { progressoDoProjeto } from "@/lib/store/relations";
import { BRL } from "@/lib/format";
import { useModal } from "../modals/ModalProvider";
import { useConfirm } from "../components/ConfirmProvider";
import { ProjetoModal } from "../modals/ProjetoModal";
import { dmgToast } from "@/lib/toast";
import { Pencil, Trash2, Plus } from "lucide-react";

export function ProjetosView() {
  const { projetos, remove, log } = useStore();
  const { open } = useModal();
  const confirm = useConfirm();

  return (
    <Panel>
      <PanelTitle
        title="Todos os projetos"
        sub="clique num projeto para abrir os detalhes"
        action={
          <button
            onClick={() => open("Novo projeto", (close) => <ProjetoModal onClose={close} />)}
            className="inline-flex items-center gap-1.5 rounded border border-dmg-border-strong bg-dmg-surface-2 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-dmg-text-2 hover:border-dmg-red-dark hover:text-dmg-text"
          >
            <Plus className="h-3.5 w-3.5" /> novo projeto
          </button>
        }
      />

      {projetos.length === 0 ? (
        <p className="py-8 text-center font-mono text-sm text-dmg-text-3">
          Nenhum projeto — adicione o primeiro.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dmg-border text-left font-mono text-[10px] uppercase tracking-[0.16em] text-dmg-text-3">
                <th className="pb-3 pr-4">Projeto</th>
                <th className="pb-3 pr-4">Responsável</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Progresso</th>
                <th className="pb-3 pr-4">Valor</th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-dmg-border">
              {projetos.map((p) => (
                <tr key={p.id} className="group">
                  <td className="py-3 pr-4">
                    <Link
                      to="/projetos/$id"
                      params={{ id: p.id }}
                      className="block hover:text-dmg-red"
                    >
                      <span className="font-semibold">{p.nome}</span>
                      <span className="ml-2 font-mono text-[11px] text-dmg-text-3">
                        {p.tipo || "—"}
                      </span>
                    </Link>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-dmg-border-strong bg-dmg-surface-2 text-xs font-bold text-dmg-red"
                      title={p.resp || ""}
                    >
                      {(p.resp || "?")[0]}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="py-3 pr-4 min-w-[160px]">
                    <ProgressBar value={progressoDoProjeto(p)} />
                  </td>
                  <td className="py-3 pr-4 tabular-nums text-dmg-text-2">
                    {p.valor ? BRL(Number(p.valor)) : "—"}
                  </td>
                  <td className="py-3 text-right">
                    <div className="inline-flex gap-1">
                      <button
                        onClick={() =>
                          open("Editar projeto", (close) => (
                            <ProjetoModal projeto={p} onClose={close} />
                          ))
                        }
                        className="rounded p-1.5 text-dmg-text-3 hover:bg-dmg-surface-2 hover:text-dmg-text"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={async () => {
                          if (
                            await confirm({ title: `Excluir o projeto "${p.nome}"?`, danger: true })
                          ) {
                            await remove("projetos", p.id);
                            await log(`<b>Projeto</b> — ${p.nome} excluído`, "projeto");
                            dmgToast.success("Projeto excluído");
                          }
                        }}
                        className="rounded p-1.5 text-dmg-text-3 hover:bg-dmg-red/10 hover:text-dmg-red"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
