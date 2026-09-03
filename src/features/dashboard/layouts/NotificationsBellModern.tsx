import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, CalendarDays, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotificacoes } from "../notificacoes/useNotificacoes";

export function NotificationsBellModern() {
  const [open, setOpen] = useState(false);
  const { items, dismissLead } = useNotificacoes();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          title="Notificações"
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-dmg-border-strong bg-dmg-surface text-dmg-text-2 hover:border-dmg-red-dark hover:text-dmg-text"
        >
          <Bell className="h-4 w-4" />
          {items.length > 0 && (
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-dmg-red" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[340px] rounded-lg border border-dmg-border bg-dmg-surface-2 p-0 text-dmg-text shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-dmg-border px-4 py-3">
          <span className="text-sm font-bold">Notificações</span>
          {items.length > 0 && (
            <span className="rounded-full bg-dmg-red-solid/15 px-2 py-0.5 font-mono text-[10px] font-bold text-dmg-red">
              {items.length}
            </span>
          )}
        </div>

        <div className="max-h-[320px] overflow-y-auto">
          {items.length === 0 ? (
            <p className="px-4 py-6 text-center font-mono text-xs text-dmg-text-3">
              Nenhuma notificação por enquanto.
            </p>
          ) : (
            <ul className="divide-y divide-dmg-border">
              {items.map((n) => (
                <li key={n.id} className="group relative">
                  <Link
                    to={n.href}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 pr-9 hover:bg-dmg-surface-3"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-dmg-border-strong bg-dmg-surface text-dmg-red">
                      <CalendarDays className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-dmg-text">{n.titulo}</span>
                      <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.1em] text-dmg-text-3">
                        {n.meta}
                      </span>
                    </span>
                  </Link>
                  {n.tipo === "lead" && (
                    <button
                      type="button"
                      title="Esconder essa notificação"
                      onClick={() => dismissLead(n.id)}
                      className="absolute right-3 top-3 rounded-full p-1 text-dmg-text-3 opacity-0 hover:bg-dmg-surface hover:text-dmg-text group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="border-t border-dmg-border px-4 py-2.5 font-mono text-[10px] leading-relaxed text-dmg-text-3">
          Pedidos de contato pelo site e pagamentos confirmados vão aparecer aqui em breve.
        </p>
      </PopoverContent>
    </Popover>
  );
}
