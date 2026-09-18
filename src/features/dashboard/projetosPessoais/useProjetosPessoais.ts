import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import type { ProjetoPessoal, Todo } from "@/lib/store/types";

const COL = "projetos_pessoais";

function novoId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Projetos pessoais de um membro — mesmo padrão de useNotaBoard: um doc por
 * usuário (`user:<uid>`), tempo real via onSnapshot, ninguém além do dono
 * consegue ler o doc dele (mesma regra de acesso já usada pro quadro pessoal
 * de Notas precisa valer aqui também — replicar no console do Firebase).
 * Ao contrário de Notas, aqui um doc guarda uma LISTA de projetos, não um
 * texto só — por isso as operações são todas por índice dentro do array.
 */
export function useProjetosPessoais(uid: string) {
  const [ready, setReady] = useState(false);
  const [projetos, setProjetos] = useState<ProjetoPessoal[]>([]);

  useEffect(() => {
    setReady(false);
    setProjetos([]);
    const { db } = getFirebase();
    const ref = doc(db, COL, `user:${uid}`);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const data = (snap.data() as { projetos?: ProjetoPessoal[] } | undefined) ?? {};
        setProjetos(Array.isArray(data.projetos) ? data.projetos : []);
        setReady(true);
      },
      (err) => console.error(`[ProjetosPessoais] "${uid}":`, err),
    );
    return unsub;
  }, [uid]);

  async function persist(next: ProjetoPessoal[]) {
    setProjetos(next);
    const { db } = getFirebase();
    await setDoc(doc(db, COL, `user:${uid}`), { projetos: next }, { merge: true });
  }

  async function addProjeto(dados: Omit<ProjetoPessoal, "id" | "criadoEm">) {
    await persist([...projetos, { ...dados, id: novoId(), criadoEm: Date.now() }]);
  }

  async function updateProjeto(id: string, patch: Partial<ProjetoPessoal>) {
    await persist(projetos.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  async function removeProjeto(id: string) {
    await persist(projetos.filter((p) => p.id !== id));
  }

  function todosDe(id: string): Todo[] {
    return projetos.find((p) => p.id === id)?.todos ?? [];
  }

  async function addTodo(projetoId: string, texto: string) {
    const t = texto.trim();
    if (!t) return;
    const todos = [...todosDe(projetoId), { texto: t, feito: false, criadoEm: Date.now() }];
    await updateProjeto(projetoId, { todos });
  }

  async function toggleTodo(projetoId: string, index: number, feito: boolean) {
    const todos = todosDe(projetoId).map((t, i) => (i === index ? { ...t, feito } : t));
    await updateProjeto(projetoId, { todos });
  }

  async function removeTodo(projetoId: string, index: number) {
    const todos = todosDe(projetoId).filter((_, i) => i !== index);
    await updateProjeto(projetoId, { todos });
  }

  async function updateTodo(projetoId: string, index: number, patch: Partial<Todo>) {
    const todos = todosDe(projetoId).map((t, i) => (i === index ? { ...t, ...patch } : t));
    await updateProjeto(projetoId, { todos });
  }

  async function reorderTodos(projetoId: string, next: Todo[]) {
    await updateProjeto(projetoId, { todos: next });
  }

  return {
    ready,
    projetos,
    addProjeto,
    updateProjeto,
    removeProjeto,
    addTodo,
    toggleTodo,
    removeTodo,
    updateTodo,
    reorderTodos,
  };
}
