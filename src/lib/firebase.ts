import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCYPZBy_sVo6ZI-RdMZ4wXZ6P7WZx98RNQ",
  authDomain: "dmgdev-group.firebaseapp.com",
  projectId: "dmgdev-group",
  storageBucket: "dmgdev-group.appspot.com",
  messagingSenderId: "705819967455",
  appId: "1:705819967455:web:f3a40d0053ae7ac5b3ce6a",
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
