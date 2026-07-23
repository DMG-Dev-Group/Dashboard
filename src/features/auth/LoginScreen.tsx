import { useState } from "react";
import { useAuth } from "./AuthProvider";
import logoUrl from "@/assets/logo.svg";

export function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErro(null);
    try {
      await signIn(email, senha);
    } catch {
      setErro("Email ou senha inválidos.");
    } finally {
      setBusy(false);
    }
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
