import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ModalRenderer = (close: () => void) => ReactNode;

interface ModalContextValue {
  open: (title: string, render: ModalRenderer) => void;
  close: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ title: string; render: ModalRenderer } | null>(null);

  const close = useCallback(() => setState(null), []);
  const open = useCallback((title: string, render: ModalRenderer) => setState({ title, render }), []);

  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <ModalContext.Provider value={value}>
      {children}
      <Dialog open={!!state} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-w-lg bg-dmg-surface border-dmg-border text-dmg-text">
          <DialogHeader>
            <DialogTitle className="font-extrabold tracking-tight">{state?.title}</DialogTitle>
          </DialogHeader>
          {state?.render(close)}
        </DialogContent>
      </Dialog>
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal requer <ModalProvider>");
  return ctx;
}
