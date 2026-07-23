import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PanelProps {
  children: ReactNode;
  className?: string;
}

export function Panel({ children, className }: PanelProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dmg-border bg-dmg-surface p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface PanelTitleProps {
  title: string;
  sub?: string;
  action?: ReactNode;
}

export function PanelTitle({ title, sub, action }: PanelTitleProps) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h3 className="text-base font-bold tracking-tight">{title}</h3>
        {sub && (
          <span className="mt-0.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-dmg-text-3">
            {sub}
          </span>
        )}
      </div>
      {action}
    </div>
  );
}
