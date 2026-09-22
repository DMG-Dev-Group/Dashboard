import { useState } from "react";
import { FirebaseError } from "firebase/app";
import {
  getMultiFactorResolver,
  TotpMultiFactorGenerator,
  type MultiFactorError,
  type MultiFactorResolver,
} from "firebase/auth";
import { useAuth } from "./AuthProvider";
import { getFirebase } from "@/lib/firebase";
import { registrarLogin } from "@/lib/store/perfil";
import logoUrl from "@/assets/logo.svg";

export function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // 2FA (TOTP): quando o Firebase pede o segundo fator, guardamos o resolver
  // e trocamos o form por um campo de código.
  const [resolver, setResolver] = useState<MultiFactorResolver | null>(null);
  const [codigo, setCodigo] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErro(null);
    try {
      const user = await signIn(email, senha);
      await registrarLogin(user.uid).catch(() => {});
    } catch (err) {
      if (err instanceof FirebaseError && err.code === "auth/multi-factor-auth-required") {
        const { auth } = getFirebase();
        setResolver(getMultiFactorResolver(auth, err as MultiFactorError));
      } else {
        setErro("Email ou senha inválidos.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function onSubmitCodigo(e: React.FormEvent) {
    e.preventDefault();
    if (!resolver) return;
    setBusy(true);
    setErro(null);
    try {
      const hint = resolver.hints[0];
      const assertion = TotpMultiFactorGenerator.assertionForSignIn(hint.uid, codigo);
      const cred = await resolver.resolveSignIn(assertion);
      await registrarLogin(cred.user.uid).catch(() => {});
    } catch {
      setErro("Código inválido — confira o app autenticador.");
    } finally {
      setBusy(false);
    }
  }

  if (resolver) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-dmg-bg px-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(1200px 600px at 20% -10%, rgba(192,24,26,0.15), transparent 60%), radial-gradient(800px 400px at 100% 110%, rgba(192,24,26,0.1), transparent 60%)",
          }}
        />
        <form
          onSubmit={onSubmitCodigo}
          className="relative z-10 w-full max-w-sm rounded-lg border border-dmg-border bg-dmg-surface p-8 shadow-2xl"
        >
          <img src={logoUrl} alt="DMG" className="mx-auto mb-4 h-10 w-10" />
          <h2 className="text-center text-lg font-bold tracking-tight">
            Verificação em duas etapas
          </h2>
          <p className="mt-1 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-dmg-text-3">
            Código do app autenticador
          </p>

          <label className="mt-6 block text-sm">
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.24em] text-dmg-text-3">
              Código de 6 dígitos
            </span>
            <input
              type="text"
              inputMode="numeric"
              autoFocus
              required
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="w-full rounded border border-dmg-border bg-dmg-surface-2 px-3 py-2 text-center font-mono text-lg tracking-[0.3em] outline-none transition focus:border-dmg-red"
              maxLength={6}
            />
          </label>

          {erro && (
            <p className="mt-3 rounded border border-dmg-red-dark bg-dmg-red-dark/20 px-3 py-2 text-xs text-dmg-red">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-6 w-full rounded bg-dmg-red-solid px-4 py-2.5 font-mono text-xs uppercase tracking-[0.18em] text-white transition hover:bg-dmg-red-hover disabled:opacity-60"
          >
            {busy ? "Verificando…" : "Confirmar"}
          </button>
          <button
            type="button"
            onClick={() => {
              setResolver(null);
              setCodigo("");
              setErro(null);
            }}
            className="mt-3 w-full font-mono text-[10px] uppercase tracking-[0.18em] text-dmg-text-3 hover:text-dmg-text"
          >
            voltar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dmg-bg px-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(1200px 600px at 20% -10%, rgba(192,24,26,0.15), transparent 60%), radial-gradient(800px 400px at 100% 110%, rgba(192,24,26,0.1), transparent 60%)",
        }}
      />
      <form
        onSubmit={onSubmit}
        className="relative z-10 w-full max-w-sm rounded-lg border border-dmg-border bg-dmg-surface p-8 shadow-2xl"
      >
        <img src={logoUrl} alt="DMG" className="mx-auto mb-4 h-10 w-10" />
        <h2 className="text-center text-lg font-bold tracking-tight">DMG Command Center</h2>
        <p className="mt-1 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-dmg-text-3">
          Acesso restrito à equipe
        </p>

        <label className="mt-6 block text-sm">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.24em] text-dmg-text-3">
            Email
          </span>
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-dmg-border bg-dmg-surface-2 px-3 py-2 outline-none transition focus:border-dmg-red"
          />
        </label>

        <label className="mt-4 block text-sm">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.24em] text-dmg-text-3">
            Senha
          </span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full rounded border border-dmg-border bg-dmg-surface-2 px-3 py-2 outline-none transition focus:border-dmg-red"
          />
        </label>

        {erro && (
          <p className="mt-3 rounded border border-dmg-red-dark bg-dmg-red-dark/20 px-3 py-2 text-xs text-dmg-red">
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full rounded bg-dmg-red-solid px-4 py-2.5 font-mono text-xs uppercase tracking-[0.18em] text-white transition hover:bg-dmg-red-hover disabled:opacity-60"
        >
          {busy ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
