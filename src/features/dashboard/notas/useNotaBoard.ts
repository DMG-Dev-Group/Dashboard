import { useEffect, useRef, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import type { Todo } from "@/lib/store/types";

/**
 * Quadro de notas + to-do genérico, guardado na coleção "notas" do Firestore.
 * Cada quadro é um documento identificado por `id`:
 *   - "dashboard"      → quadro geral, compartilhado pela equipe
 *   - "user:<uid>"     → quadro pessoal de um membro
 *
 * O texto salva sozinho (debounce) e as tarefas salvam na hora. Tudo em tempo
 * real via onSnapshot — abrir em dois dispositivos reflete na hora.
 */
export interface NotaBoard {
  ready: boolean;
  texto: string;
  todos: Todo[];
  status: string;
  setTexto: (t: string) => void;
  flush: () => void;
  addTodo: (texto: string) => Promise<void>;
  toggleTodo: (index: number, feito: boolean) => Promise<void>;
  removeTodo: (index: number) => Promise<void>;
}

const COL = "notas";

export function useNotaBoard(id: string): NotaBoard {
  const [ready, setReady] = useState(false);
  const [texto, setTextoState] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [status, setStatus] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Último valor conhecido do texto localmente — evita que um snapshot remoto
  // apague o que o usuário está digitando agora.
  const localText = useRef("");
  const pendingText = useRef<string | null>(null);

  useEffect(() => {
    // reseta ao trocar de quadro
    setReady(false);
    setTextoState("");
    setTodos([]);
    setStatus("");
    localText.current = "";
    pendingText.current = null;
    if (timer.current) clearTimeout(timer.current);

    const { db } = getFirebase();
    const ref = doc(db, COL, id);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const data = (snap.data() as { texto?: string; todos?: Todo[] } | undefined) ?? {};
        setTodos(Array.isArray(data.todos) ? data.todos : []);
        const remoto = data.texto ?? "";
        // só adota o texto do servidor se não houver edição pendente
        if (pendingText.current === null && remoto !== localText.current) {
          localText.current = remoto;
          setTextoState(remoto);
        }
        setReady(true);
      },
      (err) => console.error(`[Notas] "${id}":`, err),
    );
    return () => {
      unsub();
      if (timer.current) clearTimeout(timer.current);
    };
  }, [id]);

  async function persist(patch: { texto?: string; todos?: Todo[] }) {
    if (typeof window === "undefined") return;
    const { db } = getFirebase();
    await setDoc(doc(db, COL, id), patch, { merge: true });
  }

  async function commitText() {
    const t = pendingText.current;
    if (t === null) return;
    pendingText.current = null;
    timer.current = null;
    await persist({ texto: t });
    setStatus("salvo ✓");
    setTimeout(() => setStatus(""), 2000);
  }

  function setTexto(t: string) {
    localText.current = t;
    pendingText.current = t;
    setTextoState(t);
    setStatus("digitando…");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(commitText, 700);
  }

  function flush() {
    if (timer.current) clearTimeout(timer.current);
    if (pendingText.current !== null) void commitText();
  }

  async function addTodo(txt: string) {
    const t = txt.trim();
    if (!t) return;
    const novo = [...todos, { texto: t, feito: false, criadoEm: Date.now() }];
    setTodos(novo);
    await persist({ todos: novo });
  }

  async function toggleTodo(index: number, feito: boolean) {
    const novo = todos.map((t, i) => (i === index ? { ...t, feito } : t));
    setTodos(novo);
    await persist({ todos: novo });
  }

  async function removeTodo(index: number) {
    const novo = todos.filter((_, i) => i !== index);
    setTodos(novo);
    await persist({ todos: novo });
  }

  return { ready, texto, todos, status, setTexto, flush, addTodo, toggleTodo, removeTodo };
}
