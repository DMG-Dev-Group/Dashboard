import { useState } from "react";
import { FirebaseError } from "firebase/app";
import {
  multiFactor,
  TotpMultiFactorGenerator,
  updateEmail,
  updatePassword,
  updateProfile,
  type MultiFactorInfo,
  type TotpSecret,
} from "firebase/auth";
import { useAuth } from "@/features/auth/AuthProvider";
import { reautenticar } from "@/features/auth/reauth";
import { usePerfil, useUltimosLogins } from "@/lib/store/perfil";
import { fileToCompressedDataUrl, ImagemMuitoGrandeError } from "@/lib/imageUpload";
import { dmgToast } from "@/lib/toast";

function mensagemErroSenha(err: unknown, fallback: string): string {
  if (
    err instanceof FirebaseError &&
    (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential")
  ) {
    return "Senha atual incorreta";
  }
  return fallback;
}

/**
 * Lógica de negócio de Configurações — usada pelas versões Modern e
 * Classic. Trocar email/senha ou mexer em 2FA exige reautenticação
 * recente (senha atual), como o Firebase Auth já exige por padrão.
 */
export function useConfig() {
  const { user, signOut } = useAuth();
  const { perfil, salvar: salvarPerfil } = usePerfil(user?.uid);
  const logins = useUltimosLogins(user?.uid);

  const [busy, setBusy] = useState(false);
  const [totpSecret, setTotpSecret] = useState<TotpSecret | null>(null);

  const fatores: MultiFactorInfo[] = user ? multiFactor(user).enrolledFactors : [];
  const tem2FA = fatores.length > 0;

  async function salvarNome(nome: string) {
    if (!user) return;
    setBusy(true);
    try {
      await updateProfile(user, { displayName: nome });
      dmgToast.success("Nome atualizado");
    } catch {
      dmgToast.error("Não foi possível atualizar o nome");
    } finally {
      setBusy(false);
    }
  }

  async function salvarTelefone(telefone: string) {
    try {
      await salvarPerfil({ telefone });
      dmgToast.success("Telefone atualizado");
    } catch {
      dmgToast.error("Não foi possível atualizar o telefone");
    }
  }

  async function salvarFoto(file: File) {
    setBusy(true);
    try {
      const dataUrl = await fileToCompressedDataUrl(file, { maxDimension: 256, quality: 0.8 });
      await salvarPerfil({ fotoUrl: dataUrl });
      dmgToast.success("Foto atualizada");
    } catch (err) {
      if (err instanceof ImagemMuitoGrandeError) {
        dmgToast.error("Imagem muito grande", "Tente uma foto menor.");
      } else {
        dmgToast.error("Não foi possível atualizar a foto");
      }
    } finally {
      setBusy(false);
    }
  }

  async function alterarEmail(novoEmail: string, senhaAtual: string) {
    if (!user) return;
    setBusy(true);
    try {
      await reautenticar(user, senhaAtual);
      await updateEmail(user, novoEmail);
      dmgToast.success("Email atualizado");
    } catch (err) {
      dmgToast.error(mensagemErroSenha(err, "Não foi possível atualizar o email"));
      throw err;
    } finally {
      setBusy(false);
    }
  }

  async function alterarSenha(novaSenha: string, senhaAtual: string) {
    if (!user) return;
    setBusy(true);
    try {
      await reautenticar(user, senhaAtual);
      await updatePassword(user, novaSenha);
      dmgToast.success("Senha atualizada");
    } catch (err) {
      dmgToast.error(mensagemErroSenha(err, "Não foi possível atualizar a senha"));
      throw err;
    } finally {
      setBusy(false);
    }
  }

  async function iniciar2FA(senhaAtual: string) {
    if (!user) return;
    setBusy(true);
    try {
      await reautenticar(user, senhaAtual);
      const session = await multiFactor(user).getSession();
      const secret = await TotpMultiFactorGenerator.generateSecret(session);
      setTotpSecret(secret);
    } catch (err) {
      dmgToast.error(mensagemErroSenha(err, "Não foi possível iniciar a configuração do 2FA"));
      throw err;
    } finally {
      setBusy(false);
    }
  }

  async function confirmar2FA(codigo: string) {
    if (!user || !totpSecret) return;
    setBusy(true);
    try {
      const assertion = TotpMultiFactorGenerator.assertionForEnrollment(totpSecret, codigo);
      await multiFactor(user).enroll(assertion, "App autenticador");
      setTotpSecret(null);
      dmgToast.success("2FA ativado");
    } catch {
      dmgToast.error("Código inválido — confira o app autenticador");
      throw new Error("codigo invalido");
    } finally {
      setBusy(false);
    }
  }

  function cancelar2FA() {
    setTotpSecret(null);
  }

  async function desativar2FA(fator: MultiFactorInfo, senhaAtual: string) {
    if (!user) return;
    setBusy(true);
    try {
      await reautenticar(user, senhaAtual);
      await multiFactor(user).unenroll(fator);
      dmgToast.success("2FA desativado");
    } catch (err) {
      dmgToast.error(mensagemErroSenha(err, "Não foi possível desativar o 2FA"));
      throw err;
    } finally {
      setBusy(false);
    }
  }

  return {
    user,
    perfil,
    logins,
    busy,
    fatores,
    tem2FA,
    totpSecret,
    salvarNome,
    salvarTelefone,
    salvarFoto,
    alterarEmail,
    alterarSenha,
    iniciar2FA,
    confirmar2FA,
    cancelar2FA,
    desativar2FA,
    signOut,
  };
}
