import { useState } from "react";
import { useStore } from "@/lib/store/StoreProvider";
import { Actions, Field, Input } from "./ProjetoModal";

export function ClienteModal({ onClose }: { onClose: () => void }) {
  const { add, log } = useStore();
  const [f, setF] = useState({
    nome: "",
    contato: "",
    desde: new Date().getFullYear().toString(),
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await add("clientes", f);
    await log(`<b>Cliente</b> — ${f.nome} adicionado`, "cliente");
    onClose();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Nome do cliente">
        <Input value={f.nome} onChange={(v) => setF({ ...f, nome: v })} required />
      </Field>
      <Field label="Contato (e-mail, telefone…)">
        <Input value={f.contato} onChange={(v) => setF({ ...f, contato: v })} />
      </Field>
      <Field label="Cliente desde (ano)">
        <Input value={f.desde} onChange={(v) => setF({ ...f, desde: v })} />
      </Field>
      <Actions onClose={onClose} />
    </form>
  );
}
