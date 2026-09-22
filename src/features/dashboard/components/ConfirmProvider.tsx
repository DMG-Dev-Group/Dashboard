import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/**
 * Substitui o confirm() nativo por um dialog com a identidade da DMG.
 * Uso: const confirm = useConfirm(); if (await confirm({ title: "Excluir X?" })) { ... }
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);

  const confirm = useCallback<ConfirmFn>((opts) => {
    return new Promise((resolve) => setState({ ...opts, resolve }));
  }, []);

  function close(result: boolean) {
    state?.resolve(result);
    setState(null);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog open={!!state} onOpenChange={(o) => !o && close(false)}>
        <AlertDialogContent className="border-dmg-border bg-dmg-surface text-dmg-text">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-extrabold tracking-tight text-dmg-text">
              {state?.title}
            </AlertDialogTitle>
            {state?.description && (
              <AlertDialogDescription className="text-dmg-text-2">{state.description}</AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => close(false)}
              className="border border-dmg-border-strong bg-transparent font-mono text-[11px] uppercase tracking-[0.14em] text-dmg-text-2 hover:bg-dmg-surface-2 hover:text-dmg-text"
            >
              {state?.cancelLabel ?? "cancelar"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => close(true)}
              className="bg-dmg-red-solid font-mono text-[11px] uppercase tracking-[0.14em] text-white hover:bg-dmg-red-hover"
            >
              {state?.confirmLabel ?? "confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm precisa estar dentro de <ConfirmProvider>");
  return ctx;
}
