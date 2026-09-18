import { useAuth } from "@/features/auth/AuthProvider";
import { useProjetosPessoais } from "../projetosPessoais/useProjetosPessoais";
import { useModal } from "./ModalProvider";
import { useConfirm } from "../components/ConfirmProvider";
import { StatusBadge } from "../components/StatusBadge";
import { TodoList } from "../components/TodoList";
import { ProjetoPessoalModal } from "./ProjetoPessoalModal";
import { dmgToast } from "@/lib/toast";
import { Pencil, Trash2, ExternalLink, Github } from "lucide-react";

interface Props {
  projetoId: string;
  onClose: () => void;
}

/**
 * Detalhe de um projeto pessoal: descrição, stack, links e a checklist de
 * to-dos — tudo num modal só (sem rota própria, ao contrário do projeto de
 * cliente, que não precisa aqui já que não há financeiro/GitHub ao vivo).
 *
 * Busca o projeto pelo id via seu próprio hook (em vez de receber o objeto
 * como prop) de propósito: o ModalProvider guarda o conteúdo do modal como
 * um closure criado uma única vez no `open()`, então uma prop com o objeto
 * inteiro ficaria congelada no que a to-do era no instante do clique — com
 * o hook aqui dentro, o modal escuta o Firestore direto e cada toggle/add
 * de to-do reflete ao vivo, igual ao resto do app.
 */
export function ProjetoPessoalDetalheModal({ projetoId, onClose }: Props) {
  const { user } = useAuth();
  const uid = user?.uid ?? "anon";
  const store = useProjetosPessoais(uid);
  const { open } = useModal();
  const confirm = useConfirm();

  const projeto = store.projetos.find((p) => p.id === projetoId);
  if (!projeto) return null;

  const stack = (projeto.stack || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <StatusBadge status={projeto.status} />
        <div className="flex gap-1">
          <button
            onClick={() =>
              open("Editar projeto pessoal", (close) => (
                <ProjetoPessoalModal
                  projeto={projeto}
                  onSave={(dados) => store.updateProjeto(projeto.id, dados)}
                  onClose={close}
                />
              ))
            }
            className="rounded p-1.5 text-dmg-text-3 hover:bg-dmg-surface-2 hover:text-dmg-text"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={async () => {
              if (await confirm({ title: `Excluir "${projeto.nome}"?`, danger: true })) {
                await store.removeProjeto(projeto.id);
                dmgToast.success("Projeto pessoal excluído");
                onClose();
              }
            }}
            className="rounded p-1.5 text-dmg-text-3 hover:bg-dmg-red/10 hover:text-dmg-red"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {projeto.desc && <p className="text-sm text-dmg-text-2">{projeto.desc}</p>}

      {stack.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {stack.map((s) => (
            <span
              key={s}
              className="rounded border border-dmg-border-strong bg-dmg-surface-2 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-dmg-text-3"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {(projeto.repo || projeto.url) && (
        <div className="flex flex-wrap gap-3 font-mono text-[11px]">
          {projeto.repo && (
            <a
              href={projeto.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-dmg-text-2 hover:text-dmg-red"
            >
              <Github className="h-3.5 w-3.5" /> repositório
            </a>
          )}
          {projeto.url && (
            <a
              href={projeto.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-dmg-text-2 hover:text-dmg-red"
            >
              <ExternalLink className="h-3.5 w-3.5" /> abrir URL
            </a>
          )}
        </div>
      )}

      <div className="border-t border-dmg-border pt-4">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-dmg-text-3">
          To-Do
        </p>
        <TodoList
          todos={projeto.todos ?? []}
          onAdd={(texto) => store.addTodo(projeto.id, texto)}
          onToggle={(i, feito) => store.toggleTodo(projeto.id, i, feito)}
          onRemove={(i) => store.removeTodo(projeto.id, i)}
          onUpdate={(i, patch) => store.updateTodo(projeto.id, i, patch)}
          onReorder={(next) => store.reorderTodos(projeto.id, next)}
          maxHeight={280}
        />
      </div>
    </div>
  );
}
