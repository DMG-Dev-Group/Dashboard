import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, initializeFirestore, type Firestore } from "firebase/firestore";

// Fallback pros valores originais do projeto: VITE_FIREBASE_* nunca foi configurado
// no Vercel, então em produção isso resolvia pra string vazia e o Firebase Auth
// explodia com "auth/invalid-api-key" assim que o app carregava.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCYPZBy_sVo6ZI-RdMZ4wXZ6P7WZx98RNQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dmgdev-group.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dmgdev-group",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dmgdev-group.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "705819967455",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:705819967455:web:f3a40d0053ae7ac5b3ce6a",
};

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

/** Lazy — só instancia no cliente. Firebase Web SDK explode em SSR. */
export function getFirebase() {
  if (typeof window === "undefined") {
    throw new Error("Firebase é client-only. Chame dentro de um efeito ou componente client.");
  }
  if (!_app) {
    _app = getApps()[0] ?? initializeApp(firebaseConfig);
    _auth = getAuth(_app);
    // ignoreUndefinedProperties: sem isso, salvar um campo opcional vazio
    // (ex.: lançamento sem projeto) derruba o addDoc/updateDoc inteiro.
    // initializeFirestore só pode rodar uma vez por app — em HMR o app pode
    // já ter sido inicializado numa instância anterior do módulo, então
    // cai pro getFirestore normal nesse caso.
    try {
      _db = initializeFirestore(_app, { ignoreUndefinedProperties: true });
    } catch {
      _db = getFirestore(_app);
    }
  }
  return { app: _app, auth: _auth!, db: _db! };
}
