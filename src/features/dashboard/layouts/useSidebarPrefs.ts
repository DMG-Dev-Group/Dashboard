import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import type { ViewId } from "./navItems";

const COL = "preferencias";

/**
 * Ordem/visibilidade da sidebar são por usuário (não globais) — guardadas
 * no Firestore (não localStorage) pra acompanhar o membro entre
 * dispositivos, igual às notas pessoais.
 */
export interface SidebarPrefs {
  ready: boolean;
  order: ViewId[];
  hidden: ViewId[];
  setOrder: (next: ViewId[]) => Promise<void>;
  toggleHidden: (id: ViewId) => Promise<void>;
}

export function useSidebarPrefs(uid: string | undefined): SidebarPrefs {
  const [ready, setReady] = useState(false);
  const [order, setOrderState] = useState<ViewId[]>([]);
  const [hidden, setHiddenState] = useState<ViewId[]>([]);

  useEffect(() => {
    if (!uid) {
      setReady(true);
      return;
    }
    setReady(false);
    const { db } = getFirebase();
    const ref = doc(db, COL, uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const data =
          (snap.data() as { sidebarOrder?: ViewId[]; sidebarHidden?: ViewId[] } | undefined) ?? {};
        setOrderState(Array.isArray(data.sidebarOrder) ? data.sidebarOrder : []);
        setHiddenState(Array.isArray(data.sidebarHidden) ? data.sidebarHidden : []);
        setReady(true);
      },
      (err) => console.error("[SidebarPrefs]", err),
    );
    return unsub;
  }, [uid]);

  async function persist(patch: { sidebarOrder?: ViewId[]; sidebarHidden?: ViewId[] }) {
    if (!uid || typeof window === "undefined") return;
    const { db } = getFirebase();
    await setDoc(doc(db, COL, uid), patch, { merge: true });
  }

  async function setOrder(next: ViewId[]) {
    setOrderState(next);
    await persist({ sidebarOrder: next });
  }

  async function toggleHidden(id: ViewId) {
    const next = hidden.includes(id) ? hidden.filter((h) => h !== id) : [...hidden, id];
    setHiddenState(next);
    await persist({ sidebarHidden: next });
  }

  return { ready, order, hidden, setOrder, toggleHidden };
}

/** Ordena `items` pela posição salva em `order`; o que não foi customizado mantém a ordem original (NAV_ITEMS). */
export function sortByOrder<T extends { id: ViewId }>(items: T[], order: ViewId[]): T[] {
  if (order.length === 0) return items;
  const rank = new Map(order.map((id, i) => [id, i]));
  return items.slice().sort((a, b) => {
    const ra = rank.has(a.id)
      ? rank.get(a.id)!
      : order.length + items.findIndex((x) => x.id === a.id);
    const rb = rank.has(b.id)
      ? rank.get(b.id)!
      : order.length + items.findIndex((x) => x.id === b.id);
    return ra - rb;
  });
}
