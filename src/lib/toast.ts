import { toast as sonnerToast } from "sonner";

/**
 * Camada única de notificações do painel — troca alert()/confirm() nativos
 * por toasts com a identidade da DMG. Erro nunca some sozinho (precisa ser
 * fechado manualmente); sucesso/aviso/info somem depois de um tempo.
 */
export const dmgToast = {
  success(message: string, description?: string) {
    sonnerToast.success(message, { description, duration: 4000 });
  },
  error(message: string, description?: string) {
    sonnerToast.error(message, { description, duration: Infinity, closeButton: true });
  },
  warning(message: string, description?: string) {
    sonnerToast.warning(message, { description, duration: 6000 });
  },
  info(message: string, description?: string) {
    sonnerToast.info(message, { description, duration: 4500 });
  },
};
