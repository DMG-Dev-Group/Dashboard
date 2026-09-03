import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, CalendarDays, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotificacoes } from "../notificacoes/useNotificacoes";
import { ClassicPill } from "../components/classic/ClassicUI";

export function NotificationsBellClassic() {
  const [open, setOpen] = useState(false);
  const { items, dismissLead } = useNotificacoes();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          title="Notificações"
          className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[.03] text-white/70 hover:bg-white/10 hover:text-white"
        >
          <Bell className="h-4 w-4" />
          {items.length > 0 && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-dmg-red-solid shadow-[0_0_8px_rgba(192,24,26,.9)]" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[360px] rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,.09),rgba(255,255,255,.025)),var(--dmg-bg)] p-0 text-dmg-text shadow-[0_22px_70px_rgba(0,0,0,.48),inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-lg"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
          <span className="text-sm font-semibold text-dmg-text">Notificações</span>
          {items.length > 0 && <ClassicPill>{items.length}</ClassicPill>}
        </div>

        <div className="max-h-[320px] overflow-y-auto">
          {items.length === 0 ? (
            <p className="px-4 py-6 text-center text-[13px] text-dmg-text-3">
              Nenhuma notificação por enquanto.
            </p>
          ) : (
            <ul className="divide-y divide-white/8">
              {items.map((n) => (
                <li key={n.id} className="group relative">
                  <Link
                    to={n.href}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 pr-9 hover:bg-white/[.04]"
                  >
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-dmg-red-dark bg-dmg-red-solid/[.12] text-dmg-red">
                      <CalendarDays className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] text-dmg-text">{n.titulo}</span>
                      <span className="mt-0.5 block text-[11px] text-dmg-text-3">{n.meta}</span>
                    </span>
                  </Link>
                  {n.tipo === "lead" && (
                    <button
                      type="button"
                      title="Esconder essa notificação"
                      onClick={() => dismissLead(n.id)}
                      className="absolute right-3 top-3 rounded-full p-1 text-white/40 opacity-0 hover:bg-white/10 hover:text-white group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="border-t border-white/10 px-4 py-2.5 text-[11px] leading-relaxed text-dmg-text-3">
          Pedidos de contato pelo site e pagamentos confirmados vão aparecer aqui em breve.
        </p>
      </PopoverContent>
    </Popover>
  );
}
