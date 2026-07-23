import { useState } from "react";
import { useStore } from "@/lib/store/StoreProvider";
import { Actions, Field, Input, Select } from "./ProjetoModal";
import { isoDay } from "@/lib/format";

export function LancamentoModal({ onClose }: { onClose: () => void }) {
  const { add, log, projetos } = useStore();
  const [f, setF] = useState({
    desc: "",
    valor: "0",
    tipo: "entrada" as "entrada" | "saida",
    data: isoDay(new Date()),
    projetoId: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const proj = projetos.find((p) => p.id === f.projetoId);
    await add("receitas", {
      desc: f.desc,
      valor: Number(f.valor) || 0,
      tipo: f.tipo,
      data: f.data,
      projetoId: f.projetoId || undefined,
      projeto: proj?.nome,
    });
    await log(`<b>Lançamento</b> — ${f.desc} (${f.tipo})`, "financeiro");
    onClose();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Descrição">
        <Input value={f.desc} onChange={(v) => setF({ ...f, desc: v })} required />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Valor (R$)">
          <Input type="number" value={f.valor} onChange={(v) => setF({ ...f, valor: v })} />
        </Field>
        <Field label="Tipo">
          <Select
            value={f.tipo}
            onChange={(v) => setF({ ...f, tipo: v as "entrada" | "saida" })}
          >
            <option value="entrada">entrada</option>
            <option value="saida">saída</option>
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Data">
          <Input type="date" value={f.data} onChange={(v) => setF({ ...f, data: v })} />
        </Field>
        <Field label="Projeto">
          <Select value={f.projetoId} onChange={(v) => setF({ ...f, projetoId: v })}>
            <option value="">— nenhum —</option>
            {projetos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Actions onClose={onClose} />
    </form>
  );
}
