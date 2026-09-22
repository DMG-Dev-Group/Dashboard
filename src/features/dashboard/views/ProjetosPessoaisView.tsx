import { useAuth } from "@/features/auth/AuthProvider";
import { useProjetosPessoais } from "../projetosPessoais/useProjetosPessoais";
import { Panel, PanelTitle } from "../components/Panel";
import { StatusBadge } from "../components/StatusBadge";
import { ProgressBar } from "../components/ProgressBar";
import { calcProgresso } from "@/lib/store/relations";
import { useModal } from "../modals/ModalProvider";
import { ProjetoPessoalModal } from "../modals/ProjetoPessoalModal";
import { ProjetoPessoalDetalheModal } from "../modals/ProjetoPessoalDetalheModal";
import { Plus } from "lucide-react";

/** Projetos pessoais — iniciativas próprias de cada membro, privadas (só o
 * autor vê, mesmo padrão do quadro pessoal de Notas). Separado dos projetos
 * de cliente: sem cobrança, sem responsável, sem financeiro. */
export function ProjetosPessoaisView() {
  const { user } = useAuth();
  const uid = user?.uid ?? "anon";
  const store = useProjetosPessoais(uid);
  const { open } = useModal();

  return (
    <Panel>
      <PanelTitle
        title="Projetos pessoais"
        sub="só você vê esta lista"
        action={
          <button
            onClick={() =>
              open("Novo projeto pessoal", (close) => (
                <ProjetoPessoalModal onSave={store.addProjeto} onClose={close} />
              ))
            }
            className="inline-flex items-center gap-1.5 rounded border border-dmg-border-strong bg-dmg-surface-2 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-dmg-text-2 hover:border-dmg-red-dark hover:text-dmg-text"
          >
            <Plus className="h-3.5 w-3.5" /> novo projeto
          </button>
        }
      />

      {store.projetos.length === 0 ? (
        <p className="py-8 text-center font-mono text-sm text-dmg-text-3">
          Nenhum projeto pessoal ainda — adicione o primeiro.
        </p>
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
              className="rounded border border-dmg-border bg-dmg-surface-2 p-4 text-left transition-colors hover:border-dmg-red-dark"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <span className="font-semibold">{p.nome}</span>
                <StatusBadge status={p.status} />
              </div>
              <ProgressBar value={calcProgresso(p.todos)} />
            </button>
          ))}
        </div>
      )}
    </Panel>
  );
}
