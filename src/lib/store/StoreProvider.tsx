import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import type { Atividade, Cliente, CollectionName, Collections, Evento, Projeto, Receita } from "./types";

interface CacheState {
  projetos: Projeto[];
  clientes: Cliente[];
  receitas: Receita[];
  eventos: Evento[];
  atividades: Atividade[];
}

interface StoreContextValue extends CacheState {
  ready: boolean;
  add: <K extends CollectionName>(col: K, obj: Partial<Collections[K]>) => Promise<void>;
  update: <K extends CollectionName>(col: K, id: string, patch: Partial<Collections[K]>) => Promise<void>;
  remove: (col: CollectionName, id: string) => Promise<void>;
  log: (texto: string, tipo?: string) => Promise<void>;
}

const COLECOES: CollectionName[] = ["projetos", "clientes", "receitas", "eventos", "atividades"];

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cache, setCache] = useState<CacheState>({
    projetos: [],
    clientes: [],
    receitas: [],
    eventos: [],
    atividades: [],
  });
  const [ready, setReady] = useState(false);
  const readyRef = useRef(new Set<string>());

  useEffect(() => {
    const { db } = getFirebase();
    const unsubs = COLECOES.map((col) =>
      onSnapshot(
        collection(db, col),
        (snap) => {
          const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }));
          // ordena atividades por ts desc
          if (col === "atividades") {
            rows.sort((a: any, b: any) => (b.ts ?? 0) - (a.ts ?? 0));
          }
          setCache((prev) => ({ ...prev, [col]: rows as any }));
          if (!readyRef.current.has(col)) {
            readyRef.current.add(col);
            if (readyRef.current.size === COLECOES.length) setReady(true);
          }
        },
        (err) => console.error(`[Store] "${col}":`, err),
      ),
    );
    return () => unsubs.forEach((u) => u());
  }, []);

  const value = useMemo<StoreContextValue>(() => {
    const { db } = typeof window !== "undefined" ? getFirebase() : ({} as any);
    return {
      ...cache,
      ready,
      async add(col, obj) {
        const { id: _omit, ...rest } = obj as any;
        await addDoc(collection(db, col as string), { ...rest, criadoEm: serverTimestamp() });
      },
      async update(col, id, patch) {
        await updateDoc(doc(db, col as string, id), patch as any);
      },
      async remove(col, id) {
        await deleteDoc(doc(db, col as string, id));
      },
      async log(texto, tipo = "info") {
        await addDoc(collection(db, "atividades"), { tipo, texto, ts: Date.now() });
      },
    };
  }, [cache, ready]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore precisa estar dentro de <StoreProvider>");
  return ctx;
}
