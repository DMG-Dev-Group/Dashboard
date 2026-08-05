import { useState, type ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

interface Props {
  ano: number;
  mes: number;
  onSelect: (ano: number, mes: number) => void;
  children: ReactNode;
}

/**
 * Popover ano → mês, aberto ao clicar no título do calendário ("Agosto de
 * 2026"). Escolher um mês fecha o popover e navega direto pra ele.
 */
export function MonthYearPicker({ ano, mes, onSelect, children }: Props) {
  const [open, setOpen] = useState(false);
  const [anoNaTela, setAnoNaTela] = useState(ano);

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setAnoNaTela(ano);
      }}
    >
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-64 border-dmg-border-strong bg-dmg-surface-2 p-3 text-dmg-text">
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={() => setAnoNaTela((a) => a - 1)}
            className="rounded p-1 text-dmg-text-2 hover:bg-dmg-surface-3"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-mono text-sm font-bold">{anoNaTela}</span>
          <button
            onClick={() => setAnoNaTela((a) => a + 1)}
            className="rounded p-1 text-dmg-text-2 hover:bg-dmg-surface-3"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {MESES.map((label, i) => {
            const ativo = anoNaTela === ano && i === mes;
            return (
              <button
                key={label}
                onClick={() => {
                  onSelect(anoNaTela, i);
                  setOpen(false);
                }}
                className={`rounded px-2 py-1.5 font-mono text-[11px] uppercase ${
                  ativo
                    ? "bg-dmg-red-solid text-white"
                    : "text-dmg-text-2 hover:bg-dmg-surface-3 hover:text-dmg-text"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
