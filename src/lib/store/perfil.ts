import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";

export interface Perfil {
  telefone?: string;
  fotoUrl?: string;
}

/** Dados de perfil que não vivem no Firebase Auth (telefone é só contato, sem verificação por SMS; foto é uma data URL — sem Storage configurado). */
export function usePerfil(uid: string | undefined) {
  const [perfil, setPerfil] = useState<Perfil>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!uid) {
      setReady(true);
      return;
    }
    setReady(false);
    const { db } = getFirebase();
    const unsub = onSnapshot(
      doc(db, "perfis", uid),
      (snap) => {
        setPerfil((snap.data() as Perfil) ?? {});
        setReady(true);
      },
      (err) => console.error("[Perfil]", err),
    );
    return unsub;
  }, [uid]);

  async function salvar(patch: Partial<Perfil>) {
    if (!uid) return;
    const { db } = getFirebase();
    await setDoc(doc(db, "perfis", uid), patch, { merge: true });
  }

  return { perfil, ready, salvar };
}

export interface LoginEvent {
  id: string;
  ts: number;
  userAgent?: string;
}

/** Chamado a cada login bem-sucedido — é o que alimenta "últimos logins" em Segurança. */
export async function registrarLogin(uid: string) {
  const { db } = getFirebase();
  await addDoc(collection(db, "perfis", uid, "logins"), {
    ts: Date.now(),
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
  });
}

export function useUltimosLogins(uid: string | undefined, max = 5) {
  const [logins, setLogins] = useState<LoginEvent[]>([]);

  useEffect(() => {
    if (!uid) return;
    const { db } = getFirebase();
    const q = query(collection(db, "perfis", uid, "logins"), orderBy("ts", "desc"), limit(max));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setLogins(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<LoginEvent, "id">) })));
      },
      (err) => console.error("[UltimosLogins]", err),
    );
    return unsub;
  }, [uid, max]);

  return logins;
}
