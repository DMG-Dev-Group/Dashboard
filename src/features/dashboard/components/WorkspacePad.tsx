import { useEffect, useRef, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import { Panel, PanelTitle } from "./Panel";
import { Trash2 } from "lucide-react";
import type { Todo } from "@/lib/store/types";

interface PadDoc {
  notas?: string;
  todos?: Todo[];
}

const DOC_PATH = { col: "workspace", id: "main" };

function usePad() {
  const [data, setData] = useState<PadDoc>({ notas: "", todos: [] });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { db } = getFirebase();
    const ref = doc(db, DOC_PATH.col, DOC_PATH.id);
    const unsub = onSnapshot(ref, (snap) => {
      const d = (snap.data() as PadDoc | undefined) || {};
      setData({ notas: d.notas ?? "", todos: Array.isArray(d.todos) ? d.todos : [] });
      setReady(true);
    });
    return () => unsub();
  }, []);

  async function save(patch: Partial<PadDoc>) {
    const { db } = getFirebase();
    await setDoc(doc(db, DOC_PATH.col, DOC_PATH.id), patch, { merge: true });
  }

  return { data, ready, save };
}

export function WorkspacePad() {
  const { data, save } = usePad();
  const [notas, setNotas] = useState(data.notas ?? "");
  const [status, setStatus] = useState("");
  const [nova, setNova] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirty = useRef(false);

  useEffect(() => {
    if (!dirty.current) setNotas(data.notas ?? "");
  }, [data.notas]);

  const todos = data.todos ?? [];
  const feitas = todos.filter((t) => t.feito).length;

  function saveNotas(texto: string, immediate = false) {
    dirty.current = true;
    setStatus("digitando…");
    if (timer.current) clearTimeout(timer.current);
    const doIt = async () => {
      await save({ notas: texto });
      dirty.current = false;
      setStatus("salvo ✓");
      setTimeout(() => setStatus(""), 1500);
    };
    if (immediate) doIt();
    else timer.current = setTimeout(doIt, 700);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Panel>
        <PanelTitle
          title="Bloco de notas"
          sub="rascunho geral — salva sozinho"
          action={
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-dmg-text-3">
              {status}
            </span>
          }
        />
        <textarea
          value={notas}
          onChange={(e) => {
            setNotas(e.target.value);
            saveNotas(e.target.value);
          }}
          onBlur={() => saveNotas(notas, true)}
          rows={10}
          placeholder="Ideias, lembretes, links úteis, senhas temporárias..."
          className="w-full resize-y rounded border border-dmg-border bg-dmg-surface-2 p-3 font-mono text-sm outline-none focus:border-dmg-red"
        />
      </Panel>

      <Panel>
        <PanelTitle title="To-do geral" sub={`${feitas}/${todos.length} concluídas`} />
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!nova.trim()) return;
            const t = [...todos, { texto: nova.trim(), feito: false, criadoEm: Date.now() }];
            setNova("");
            await save({ todos: t });
          }}
          className="mb-4 flex gap-2"
        >
          <input
            value={nova}
            onChange={(e) => setNova(e.target.value)}
            placeholder="nova tarefa..."
            className="flex-1 rounded border border-dmg-border bg-dmg-surface-2 px-3 py-2 text-sm outline-none focus:border-dmg-red"
          />
          <button
            type="submit"
            className="rounded bg-dmg-red-solid px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white hover:bg-dmg-red-hover"
          >
            + add
          </button>
        </form>
        {todos.length === 0 ? (
          <p className="font-mono text-sm text-dmg-text-3">Nenhuma tarefa.</p>
        ) : (
          <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {todos.map((t, i) => (
              <li
                key={i}
                className={`flex items-center gap-3 rounded border border-dmg-border bg-dmg-surface-2/50 px-3 py-2 ${
                  t.feito ? "opacity-60" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={t.feito}
                  onChange={async (e) => {
                    const t2 = todos.map((x, idx) =>
                      idx === i ? { ...x, feito: e.target.checked } : x,
                    );
                    await save({ todos: t2 });
                  }}
                  className="accent-dmg-red"
                />
                <span className={`flex-1 text-sm ${t.feito ? "line-through" : ""}`}>
                  {t.texto}
                </span>
                <button
                  onClick={async () => {
                    await save({ todos: todos.filter((_, idx) => idx !== i) });
                  }}
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
  );
}
