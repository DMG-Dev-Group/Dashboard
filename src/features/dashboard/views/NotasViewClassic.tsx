import { useState } from "react";
import { useAuth } from "@/features/auth/AuthProvider";
import { nomeDoUsuario } from "@/lib/userProfile";
import { useNotaBoard } from "../notas/useNotaBoard";
import { Trash2, UserRound, Users } from "lucide-react";
import {
  ClassicButtonSm,
  ClassicEmpty,
  ClassicIconMini,
  ClassicPanel,
  ClassicPill,
} from "../components/classic/ClassicUI";

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
  const [nova, setNova] = useState("");
  const feitas = b.todos.filter((t) => t.feito).length;

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
          <textarea
            value={b.texto}
            onChange={(e) => b.setTexto(e.target.value)}
            onBlur={b.flush}
            rows={12}
            placeholder="Ideias, lembretes, links, combinados…"
            className="w-full resize-y rounded-[10px] border border-white/10 bg-black/28 p-3.5 text-[13px] leading-[1.65] text-[#eaeaea] outline-none placeholder:text-white/26 focus:border-dmg-red-solid/55"
          />
        </ClassicPanel>

        <ClassicPanel title="To-Do" sub={`${feitas}/${b.todos.length} concluídas`}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const t = nova;
              setNova("");
              await b.addTodo(t);
            }}
            className="mb-3.5 flex gap-2"
          >
            <input
              value={nova}
              onChange={(e) => setNova(e.target.value)}
              placeholder="nova tarefa…"
              className="flex-1 rounded-lg border border-white/10 bg-black/28 px-3 py-2.5 text-[13px] text-[#eaeaea] outline-none placeholder:text-white/26 focus:border-dmg-red-solid/55"
            />
            <ClassicButtonSm type="submit">+ add</ClassicButtonSm>
          </form>
          {b.todos.length === 0 ? (
            <ClassicEmpty>Nenhuma tarefa.</ClassicEmpty>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {b.todos.map((t, i) => (
                <li
                  key={i}
                  className={`group/todo flex items-center gap-2.5 border-b border-white/5 py-2.5 last:border-none ${
                    t.feito ? "opacity-60" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={t.feito}
                    onChange={(e) => b.toggleTodo(i, e.target.checked)}
                    className="h-4 w-4 shrink-0 accent-dmg-red-solid"
                  />
                  <span
                    className={`flex-1 text-[13.5px] leading-snug ${
                      t.feito ? "text-dmg-text-3 line-through" : "text-dmg-text"
                    }`}
                  >
                    {t.texto}
                  </span>
                  <ClassicIconMini
                    className="opacity-0 group-hover/todo:opacity-100"
                    onClick={() => b.removeTodo(i)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </ClassicIconMini>
                </li>
              ))}
            </ul>
          )}
        </ClassicPanel>
      </div>
    </section>
  );
}
