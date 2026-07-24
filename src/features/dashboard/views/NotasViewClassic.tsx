import { useState } from "react";
import { useAuth } from "@/features/auth/AuthProvider";
import { nomeDoUsuario } from "@/lib/userProfile";
import { Panel, PanelTitle } from "../components/Panel";
import { useNotaBoard } from "../notas/useNotaBoard";
import { Trash2 } from "lucide-react";

/**
 * Notas & To-Do — visual "clássico" (terminal). Dois quadros: geral (equipe) e
 * pessoal (só do membro). Mesma lógica do moderno, roupa diferente.
 */
export function NotasViewClassic() {
  const { user } = useAuth();
  const nome = user ? nomeDoUsuario(user) : "voce";
  const uid = user?.uid ?? "anon";

  return (
    <div className="space-y-6">
      <BoardClassic
        boardId="dashboard"
        cmd="> notas.geral --shared"
        titulo="quadro da equipe"
        hint="compartilhado // todos editam"
      />
      <BoardClassic
        boardId={`user:${uid}`}
        cmd={`> notas.pessoal --user=${nome.split(" ")[0].toLowerCase()}`}
        titulo="minhas notas"
        hint="privado // só você vê"
      />
    </div>
  );
}

function BoardClassic({
  boardId,
  cmd,
  titulo,
  hint,
}: {
  boardId: string;
  cmd: string;
  titulo: string;
  hint: string;
}) {
  const b = useNotaBoard(boardId);
  const [nova, setNova] = useState("");
  const feitas = b.todos.filter((t) => t.feito).length;

  return (
    <section>
      <div className="mb-3 rounded-lg border border-dmg-border-strong bg-gradient-to-br from-dmg-surface via-dmg-bg to-dmg-surface px-5 py-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-dmg-red">{cmd}</p>
        <h2 className="mt-1 text-xl font-black lowercase">{titulo}</h2>
        <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.16em] text-dmg-text-3">
          {hint}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-5">
        <Panel>
          <PanelTitle
            title=":: notas"
            sub="autosave"
            action={
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-dmg-text-3">
                {b.status}
              </span>
            }
          />
          <textarea
            value={b.texto}
            onChange={(e) => b.setTexto(e.target.value)}
            onBlur={b.flush}
            rows={12}
            spellCheck={false}
            placeholder="$ escreva aqui…"
            className="w-full resize-y rounded border border-dmg-border bg-dmg-bg p-3 font-mono text-[13px] leading-relaxed outline-none focus:border-dmg-red"
          />
        </Panel>

        <Panel>
          <PanelTitle title=":: to-do" sub={`${feitas}/${b.todos.length} done`} />
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
              className="flex-1 rounded border border-dmg-border bg-dmg-bg px-3 py-2 font-mono text-[13px] outline-none focus:border-dmg-red"
            />
            <button
              type="submit"
              className="rounded border border-dmg-red-dark bg-dmg-red-solid/20 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-dmg-red hover:bg-dmg-red-solid/40"
            >
              add
            </button>
          </form>
          {b.todos.length === 0 ? (
            <p className="font-mono text-[12px] text-dmg-text-3">$ vazio</p>
          ) : (
            <ul className="space-y-2 font-mono text-[13px]">
              {b.todos.map((t, i) => (
                <li
                  key={i}
                  className={`flex items-center gap-3 border-l-2 border-dmg-red-dark pl-3 ${
                    t.feito ? "opacity-50" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={t.feito}
                    onChange={(e) => b.toggleTodo(i, e.target.checked)}
                    className="accent-dmg-red"
                  />
                  <span className={`flex-1 ${t.feito ? "line-through" : ""}`}>{t.texto}</span>
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
