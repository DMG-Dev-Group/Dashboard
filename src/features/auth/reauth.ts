import { EmailAuthProvider, reauthenticateWithCredential, type User } from "firebase/auth";

/** Exigido pelo Firebase antes de trocar email/senha ou mexer em 2FA — a sessão precisa ser "recente". */
export async function reautenticar(user: User, senhaAtual: string) {
  if (!user.email) throw new Error("Usuário sem email — não é possível reautenticar.");
  const cred = EmailAuthProvider.credential(user.email, senhaAtual);
  await reauthenticateWithCredential(user, cred);
}
