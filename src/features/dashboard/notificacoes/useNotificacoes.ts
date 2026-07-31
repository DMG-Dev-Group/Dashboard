import { useMemo } from "react";
import { useStore } from "@/lib/store/StoreProvider";
import { EV_TIPOS } from "@/lib/store/constants";
import { fmtDia, isoDay } from "@/lib/format";

export interface Notificacao {
  id: string;
  titulo: string;
  meta: string;
  href: string;
}

/**
 * Notificações reais derivadas dos dados já existentes no painel — hoje
 * só os próximos eventos do calendário. Outros tipos (pedido de contato
 * pelo site, pagamento confirmado etc.) entram aqui conforme os gatilhos
 * forem implementados; o hook e o painel já estão prontos para receber.
 */
export function useNotificacoes() {
  const { eventos } = useStore();

  const items = useMemo<Notificacao[]>(() => {
    const hoje = isoDay(new Date());
    return eventos
      .filter((e) => e.data >= hoje)
      .slice()
      .sort((a, b) => `${a.data}${a.hora ?? ""}`.localeCompare(`${b.data}${b.hora ?? ""}`))
      .slice(0, 6)
      .map((e) => ({
        id: e.id,
        titulo: e.titulo,
        meta: `${EV_TIPOS[e.tipo || "outro"] || "Evento"} · ${fmtDia(e.data)}${e.hora ? ` · ${e.hora}` : ""}`,
        href: "/calendario",
      }));
  }, [eventos]);

  return { items };
}
