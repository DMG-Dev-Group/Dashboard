import { useState } from "react";
import { useStore } from "@/lib/store/StoreProvider";
import { useConfirm } from "../components/ConfirmProvider";
import { EventoModal } from "./EventoModal";
import { EV_TIPOS } from "@/lib/store/constants";
import { dmgToast } from "@/lib/toast";
import type { Evento } from "@/lib/store/types";
import { Pencil, Trash2 } from "lucide-react";

/**
 * Clicar num evento abre isso — detalhes com opção de editar/excluir, em
 * vez de ir direto pro formulário de criação (que é só pro clique no dia).
 */
export function EventoDetalheModal({ evento, onClose }: { evento: Evento; onClose: () => void }) {
  const { remove, log } = useStore();
  const confirm = useConfirm();
  const [editando, setEditando] = useState(false);

  if (editando) return <EventoModal evento={evento} onClose={onClose} />;

  const dataFmt = new Date(evento.data + "T12:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-4">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-dmg-text-3">
          {EV_TIPOS[evento.tipo || "outro"] || "Evento"}
        </p>
        <h3 className="mt-1 text-lg font-bold text-dmg-text">{evento.titulo}</h3>
      </div>
      <div className="space-y-1 text-sm text-dmg-text-2">
        <p className="capitalize">{dataFmt}</p>
        {evento.hora && <p>{evento.hora}</p>}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button
          onClick={async () => {
            if (await confirm({ title: `Excluir o evento "${evento.titulo}"?`, danger: true })) {
              await remove("eventos", evento.id);
              await log(`<b>Evento</b> — ${evento.titulo} excluído`, "calendario");
              dmgToast.success("Evento excluído");
              onClose();
            }
          }}
          className="inline-flex items-center gap-1.5 rounded border border-dmg-red-dark bg-dmg-red-dark/20 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-dmg-red hover:bg-dmg-red-dark/40"
        >
          <Trash2 className="h-3.5 w-3.5" /> excluir
        </button>
        <button
          onClick={() => setEditando(true)}
          className="inline-flex items-center gap-1.5 rounded bg-dmg-red-solid px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white hover:bg-dmg-red-hover"
        >
          <Pencil className="h-3.5 w-3.5" /> editar
        </button>
      </div>
    </div>
  );
}
