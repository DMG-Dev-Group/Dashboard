import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/** Toasts com a identidade da DMG — superfície escura, vermelho de destaque, mono nos rótulos. */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            "group toast font-sans border rounded-lg shadow-[0_22px_60px_rgba(0,0,0,.55)] bg-dmg-surface border-dmg-border-strong text-dmg-text",
          title: "text-sm font-semibold text-dmg-text",
          description: "text-xs text-dmg-text-2",
          actionButton: "!bg-dmg-red-solid !text-white hover:!bg-dmg-red-hover",
          cancelButton: "!bg-dmg-surface-2 !text-dmg-text-2",
          closeButton: "!bg-dmg-surface-2 !border-dmg-border-strong !text-dmg-text-2",
          success: "!border-emerald-500/40 [&_[data-icon]]:!text-emerald-400",
          error: "!border-dmg-red-dark [&_[data-icon]]:!text-dmg-red",
          warning: "!border-amber-500/40 [&_[data-icon]]:!text-amber-300",
          info: "!border-sky-500/40 [&_[data-icon]]:!text-sky-300",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
