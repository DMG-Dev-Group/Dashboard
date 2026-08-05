import { useAuth } from "@/features/auth/AuthProvider";
import { nomeDoUsuario } from "@/lib/userProfile";
import { Panel, PanelTitle } from "../components/Panel";
import { useNotaBoard } from "../notas/useNotaBoard";
import { MarkdownEditor } from "../components/markdown/MarkdownEditor";
import { TodoList } from "../components/TodoList";
import { Users, UserRound } from "lucide-react";

/**
 * Notas & To-Do — visual "moderno". Dois quadros: um geral (compartilhado com a
 * equipe) e um pessoal (só do membro logado). Tudo salva sozinho.
 */
export function NotasViewModern() {
  const { user } = useAuth();
  const nome = user ? nomeDoUsuario(user) : "Você";
  const uid = user?.uid ?? "anon";

  return (
    <div className="space-y-10">
      <BoardModern
        boardId="dashboard"
        icon={<Users className="h-4 w-4 text-dmg-red" />}
        label="// geral"
        titulo="Quadro da equipe"
        tag="compartilhado"
        sub="todos os membros veem e editam — em tempo real"
      />
      <BoardModern
        boardId={`user:${uid}`}
        icon={<UserRound className="h-4 w-4 text-dmg-red" />}
        label="// pessoal"
        titulo="Minhas notas"
        tag={nome}
        sub="só você vê este quadro"
      />
    </div>
  );
}

function BoardModern({
  boardId,
  icon,
  label,
  titulo,
  tag,
  sub,
}: {
  boardId: string;
  icon: React.ReactNode;
  label: string;
  titulo: string;
  tag: string;
  sub: string;
}) {
  const b = useNotaBoard(boardId);

  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-dmg-border-strong bg-dmg-surface-2">
          {icon}
        </span>
        <div>
          <p className="mono-label">{label}</p>
          <h2 className="text-lg font-bold tracking-tight">{titulo}</h2>
        </div>
        <span className="ml-auto rounded-full border border-dmg-border-strong bg-dmg-surface-2 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-dmg-text-3">
          {tag}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel>
          <PanelTitle
            title="Bloco de notas"
            sub={sub}
            action={
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-dmg-text-3">
                {b.status}
              </span>
            }
          />
          <MarkdownEditor
            value={b.texto}
            onChange={b.setTexto}
            onBlur={b.flush}
            placeholder="Ideias, lembretes, links, combinados…"
            maxHeight={360}
          />
        </Panel>

        <Panel>
          <PanelTitle title="To-Do" />
          <TodoList
            todos={b.todos}
            onAdd={b.addTodo}
            onToggle={b.toggleTodo}
            onRemove={b.removeTodo}
            onUpdate={b.updateTodo}
            onReorder={b.reorderTodos}
          />
        </Panel>
      </div>
    </section>
  );
}
