import { useAuth } from "@/features/auth/AuthProvider";
import { nomeDoUsuario } from "@/lib/userProfile";
import { useNotaBoard } from "../notas/useNotaBoard";
import { MarkdownEditor } from "../components/markdown/MarkdownEditor";
import { TodoListClassic } from "../components/classic/TodoListClassic";
import { UserRound, Users } from "lucide-react";
import { ClassicPanel, ClassicPill } from "../components/classic/ClassicUI";

/**
 * Notas & To-Do — visual clássico: mesmos glass panels do resto do painel do
 * Miguel. Dois quadros: um geral (compartilhado com a equipe) e um pessoal.
 */
export function NotasViewClassic() {
  const { user } = useAuth();
  const nome = user ? nomeDoUsuario(user) : "Você";
  const uid = user?.uid ?? "anon";

  return (
    <div className="flex flex-col gap-8">
      <BoardClassic
        boardId="dashboard"
        icon={<Users className="h-[19px] w-[19px]" />}
        titulo="Quadro da equipe"
        tag="compartilhado"
        sub="todos os membros veem e editam — em tempo real"
      />
      <BoardClassic
        boardId={`user:${uid}`}
        icon={<UserRound className="h-[19px] w-[19px]" />}
        titulo="Minhas notas"
        tag={nome}
        sub="privado — só você vê este quadro"
      />
    </div>
  );
}

function BoardClassic({
  boardId,
  icon,
  titulo,
  tag,
  sub,
}: {
  boardId: string;
  icon: React.ReactNode;
  titulo: string;
  tag: string;
  sub: string;
}) {
  const b = useNotaBoard(boardId);

  return (
    <section>
      <div className="mb-3.5 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl border border-dmg-red-dark/45 bg-dmg-red-solid/[.12] text-dmg-red">
          {icon}
        </span>
        <div>
          <h2 className="text-[17px] font-semibold text-dmg-text">{titulo}</h2>
          <p className="text-[13px] text-dmg-text-3">{sub}</p>
        </div>
        <span className="ml-auto">
          <ClassicPill tone="muted">{tag}</ClassicPill>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ClassicPanel
          title="Bloco de notas"
          sub="autosave"
          action={<span className="text-[11px] text-dmg-text-3">{b.status}</span>}
        >
          <MarkdownEditor
            value={b.texto}
            onChange={b.setTexto}
            onBlur={b.flush}
            placeholder="Ideias, lembretes, links, combinados…"
            editorClassName="w-full resize-y rounded-[10px] border border-white/10 bg-black/28 p-3.5 text-[13px] leading-[1.65] text-[#eaeaea] outline-none placeholder:text-white/26 focus:border-dmg-red-solid/55"
            maxHeight={360}
          />
        </ClassicPanel>

        <ClassicPanel title="To-Do">
          <TodoListClassic
            todos={b.todos}
            onAdd={b.addTodo}
            onToggle={b.toggleTodo}
            onRemove={b.removeTodo}
            onUpdate={b.updateTodo}
            onReorder={b.reorderTodos}
          />
        </ClassicPanel>
      </div>
    </section>
  );
}
