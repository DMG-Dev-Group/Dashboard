import type { User } from "firebase/auth";

/** Miguel usa o painel clássico; demais UIDs caem no painel novo. */
export const PAINEL_POR_UID: Record<string, "classic" | "modern"> = {
  "5McOaiX7HfPzVWhhs9I9YSFa6mj1": "classic",
};

export function layoutParaUser(user: User | null): "classic" | "modern" {
  if (!user) return "modern";
  return PAINEL_POR_UID[user.uid] ?? "modern";
}

export function nomeDoUsuario(user: User): string {
  if (user.displayName?.trim()) return user.displayName.trim();
  const local = (user.email || "").split("@")[0];
  if (!local) return "Usuário";
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join(" ");
}

export function iniciaisDoUsuario(nome: string): string {
  const partes = nome.split(/\s+/).filter(Boolean);
  if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
  return (partes[0]?.[0] || "?").toUpperCase();
}
