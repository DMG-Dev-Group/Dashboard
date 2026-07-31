import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
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
    _db = getFirestore(_app);
  }
  return { app: _app, auth: _auth!, db: _db! };
}
