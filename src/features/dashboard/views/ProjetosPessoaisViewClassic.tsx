import { useAuth } from "@/features/auth/AuthProvider";
import { useProjetosPessoais } from "../projetosPessoais/useProjetosPessoais";
import { calcProgresso } from "@/lib/store/relations";
import { useModal } from "../modals/ModalProvider";
import { ProjetoPessoalModal } from "../modals/ProjetoPessoalModal";
import { ProjetoPessoalDetalheModal } from "../modals/ProjetoPessoalDetalheModal";
import {
  ClassicButtonSm,
  ClassicEmpty,
  ClassicPanel,
  ClassicProgress,
  ClassicStatusBadge,
} from "../components/classic/ClassicUI";
import { Plus } from "lucide-react";

export function ProjetosPessoaisViewClassic() {
  const { user } = useAuth();
  const uid = user?.uid ?? "anon";
  const store = useProjetosPessoais(uid);
  const { open } = useModal();

  return (
    <ClassicPanel
      title="Projetos pessoais"
      sub="só você vê esta lista"
      action={
        <ClassicButtonSm
          onClick={() =>
            open("Novo projeto pessoal", (close) => (
              <ProjetoPessoalModal onSave={store.addProjeto} onClose={close} />
            ))
          }
        >
          <Plus className="h-3.5 w-3.5" /> novo projeto
        </ClassicButtonSm>
      }
    >
      {store.projetos.length === 0 ? (
        <ClassicEmpty>Nenhum projeto pessoal ainda — adicione o primeiro.</ClassicEmpty>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {store.projetos.map((p) => (
            <button
              key={p.id}
              onClick={() =>
                open(p.nome, (close) => (
                  <ProjetoPessoalDetalheModal projetoId={p.id} onClose={close} />
                ))
              }
              className="block w-full rounded-2xl border border-dmg-border bg-white/[.035] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-dmg-red-dark"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <span className="text-sm font-semibold text-dmg-text">{p.nome}</span>
                <ClassicStatusBadge status={p.status} />
              </div>
              <ClassicProgress value={calcProgresso(p.todos)} />
            </button>
          ))}
        </div>
      )}
    </ClassicPanel>
  );
}
