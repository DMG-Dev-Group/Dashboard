import { useState } from "react";
import { useStore } from "@/lib/store/StoreProvider";
import { Actions, Field, Input, Select } from "./ProjetoModal";
import { isoDay } from "@/lib/format";
import { dmgToast } from "@/lib/toast";
import type { Evento } from "@/lib/store/types";

export function EventoModal({
  evento,
  dataInicial,
  onClose,
}: {
  evento?: Evento;
  dataInicial?: string;
  onClose: () => void;
}) {
  const { add, update, log } = useStore();
  const [f, setF] = useState({
    titulo: evento?.titulo ?? "",
    data: evento?.data ?? dataInicial ?? isoDay(new Date()),
    hora: evento?.hora ?? "",
    tipo: (evento?.tipo ?? "reuniao") as "reuniao" | "entrega" | "deadline" | "outro",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (evento) {
      await update("eventos", evento.id, f);
      await log(`<b>Evento</b> — ${f.titulo} atualizado`, "calendario");
      dmgToast.success("Evento atualizado");
    } else {
      await add("eventos", f);
      await log(`<b>Evento</b> — ${f.titulo} agendado`, "calendario");
      dmgToast.success("Evento agendado");
    }
    onClose();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Título">
        <Input value={f.titulo} onChange={(v) => setF({ ...f, titulo: v })} required />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Data">
          <Input type="date" value={f.data} onChange={(v) => setF({ ...f, data: v })} />
        </Field>
        <Field label="Hora">
          <Input type="time" value={f.hora} onChange={(v) => setF({ ...f, hora: v })} />
        </Field>
      </div>
      <Field label="Tipo">
        <Select value={f.tipo} onChange={(v) => setF({ ...f, tipo: v as typeof f.tipo })}>
          <option value="reuniao">Reunião</option>
          <option value="entrega">Entrega</option>
          <option value="deadline">Deadline</option>
          <option value="outro">Outro</option>
        </Select>
      </Field>
      <Actions onClose={onClose} submitLabel={evento ? "salvar alterações" : "salvar"} />
    </form>
  );
}
