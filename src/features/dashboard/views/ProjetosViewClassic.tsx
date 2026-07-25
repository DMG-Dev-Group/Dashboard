import { Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store/StoreProvider";
import { progressoDoProjeto } from "@/lib/store/relations";
import { BRL } from "@/lib/format";
import { useModal } from "../modals/ModalProvider";
import { ProjetoModal } from "../modals/ProjetoModal";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  ClassicAvatarDot,
  ClassicButtonSm,
  ClassicEmpty,
  ClassicIconMini,
  ClassicPanel,
  ClassicProgress,
  ClassicStatusBadge,
  ClassicTh,
} from "../components/classic/ClassicUI";

export function ProjetosViewClassic() {
  const { projetos, remove, log } = useStore();
  const { open } = useModal();

  return (
    <ClassicPanel
      title="Todos os projetos"
      sub="clique num projeto para abrir os detalhes"
      action={
        <ClassicButtonSm onClick={() => open("Novo projeto", (close) => <ProjetoModal onClose={close} />)}>
          <Plus className="h-3.5 w-3.5" /> novo projeto
        </ClassicButtonSm>
      }
    >
      <div className="-mx-5 -mb-5 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-y border-white/10 bg-white/[.035]">
              <ClassicTh>Projeto</ClassicTh>
              <ClassicTh>Responsável</ClassicTh>
              <ClassicTh>Status</ClassicTh>
              <ClassicTh>Progresso</ClassicTh>
              <ClassicTh>Valor</ClassicTh>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {projetos.length === 0 ? (
              <ClassicEmpty colSpan={6}>Nenhum projeto — adicione o primeiro.</ClassicEmpty>
            ) : (
              projetos.map((p) => (
                <tr key={p.id} className="group transition-colors hover:bg-white/[.035]">
                  <td className="border-b border-white/10 px-5 py-3.5">
                    <Link to="/projetos/$id" params={{ id: p.id }} className="group/link block">
                      <span className="font-medium text-dmg-text group-hover/link:text-dmg-red">
                        {p.nome}
                      </span>
                      <span className="mt-1 block text-xs text-dmg-text-3">
                        {p.tipo || "Projeto"}{" "}
                        <span className="inline-block text-dmg-red opacity-0 transition-all group-hover/link:translate-x-1 group-hover/link:opacity-100">
                          →
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="border-b border-white/10 px-5 py-3.5 text-sm text-dmg-text-2">
                    <ClassicAvatarDot>{(p.resp || "?")[0]}</ClassicAvatarDot>
                  </td>
                  <td className="border-b border-white/10 px-5 py-3.5">
                    <ClassicStatusBadge status={p.status} />
                  </td>
                  <td className="border-b border-white/10 px-5 py-3.5">
                    <ClassicProgress value={progressoDoProjeto(p)} />
                  </td>
                  <td className="border-b border-white/10 px-5 py-3.5 text-sm tabular-nums text-dmg-text-2">
                    {p.valor ? BRL(Number(p.valor)) : "—"}
                  </td>
                  <td className="border-b border-white/10 px-5 py-3.5 text-right">
                    <div className="inline-flex gap-1.5">
                      <ClassicIconMini
                        onClick={() =>
                          open("Editar projeto", (close) => <ProjetoModal projeto={p} onClose={close} />)
                        }
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </ClassicIconMini>
                      <ClassicIconMini
                        onClick={async () => {
                          if (confirm(`Excluir o projeto "${p.nome}"?`)) {
                            await remove("projetos", p.id);
                            await log(`<b>Projeto</b> — ${p.nome} excluído`, "projeto");
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </ClassicIconMini>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </ClassicPanel>
  );
}
