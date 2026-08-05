import { useState } from "react";
import { useAuth } from "@/features/auth/AuthProvider";
import { nomeDoUsuario } from "@/lib/userProfile";
import { Panel, PanelTitle } from "../components/Panel";
import { useNotaBoard } from "../notas/useNotaBoard";
import { MarkdownEditor } from "../components/markdown/MarkdownEditor";
import { Trash2, Users, UserRound } from "lucide-react";

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
  const [nova, setNova] = useState("");
  const feitas = b.todos.filter((t) => t.feito).length;

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
          />
        </Panel>

        <Panel>
          <PanelTitle title="To-Do" sub={`${feitas}/${b.todos.length} concluídas`} />
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const t = nova;
              setNova("");
              await b.addTodo(t);
            }}
            className="mb-4 flex gap-2"
          >
            <input
              value={nova}
              onChange={(e) => setNova(e.target.value)}
              placeholder="nova tarefa…"
              className="flex-1 rounded border border-dmg-border bg-dmg-surface-2 px-3 py-2 text-sm outline-none focus:border-dmg-red"
            />
            <button
              type="submit"
              className="rounded bg-dmg-red-solid px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white hover:bg-dmg-red-hover"
            >
              + add
            </button>
          </form>
          {b.todos.length === 0 ? (
            <p className="font-mono text-sm text-dmg-text-3">Nenhuma tarefa.</p>
          ) : (
            <ul className="space-y-2">
              {b.todos.map((t, i) => (
                <li
                  key={i}
                  className={`flex items-center gap-3 rounded border border-dmg-border bg-dmg-surface-2/50 px-3 py-2 ${
                    t.feito ? "opacity-60" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={t.feito}
                    onChange={(e) => b.toggleTodo(i, e.target.checked)}
                    className="accent-dmg-red"
                  />
                  <span className={`flex-1 text-sm ${t.feito ? "line-through" : ""}`}>
                    {t.texto}
                  </span>
                  <button
                    onClick={() => b.removeTodo(i)}
                    className="rounded p-1 text-dmg-text-3 hover:text-dmg-red"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </section>
  );
}
