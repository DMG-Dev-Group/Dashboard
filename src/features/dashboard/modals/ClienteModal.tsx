import { useState } from "react";
import { useStore } from "@/lib/store/StoreProvider";
import { Actions, Field, Input } from "./ProjetoModal";
import { dmgToast } from "@/lib/toast";
import type { Cliente } from "@/lib/store/types";

export function ClienteModal({ cliente, onClose }: { cliente?: Cliente; onClose: () => void }) {
  const { add, update, log } = useStore();
  const [f, setF] = useState({
    nome: cliente?.nome ?? "",
    nomeCompleto: cliente?.nomeCompleto ?? "",
    celular: cliente?.celular ?? cliente?.contato ?? "",
    email: cliente?.email ?? "",
    instagram: cliente?.instagram ?? "",
    nascimento: cliente?.nascimento ?? "",
    empresa: cliente?.empresa ?? "",
    desde: cliente?.desde ?? new Date().getFullYear().toString(),
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (cliente) {
      await update("clientes", cliente.id, f);
      await log(`<b>Cliente</b> — ${f.nome} atualizado`, "cliente");
      dmgToast.success("Cliente atualizado");
    } else {
      await add("clientes", f);
      await log(`<b>Cliente</b> — ${f.nome} adicionado`, "cliente");
      dmgToast.success("Cliente cadastrado");
    }
    onClose();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Nome (como aparece no painel)">
        <Input value={f.nome} onChange={(v) => setF({ ...f, nome: v })} required />
      </Field>
      <Field label="Nome completo">
        <Input value={f.nomeCompleto} onChange={(v) => setF({ ...f, nomeCompleto: v })} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Celular / WhatsApp">
          <Input value={f.celular} onChange={(v) => setF({ ...f, celular: v })} placeholder="(11) 91234-5678" />
        </Field>
        <Field label="E-mail">
          <Input type="email" value={f.email} onChange={(v) => setF({ ...f, email: v })} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Instagram">
          <Input value={f.instagram} onChange={(v) => setF({ ...f, instagram: v })} placeholder="@usuario" />
        </Field>
        <Field label="Data de nascimento">
          <Input type="date" value={f.nascimento} onChange={(v) => setF({ ...f, nascimento: v })} />
        </Field>
      </div>
      <Field label="Empresa / loja">
        <Input
          value={f.empresa}
          onChange={(v) => setF({ ...f, empresa: v })}
          placeholder="Empresa que é dono ou que estamos atendendo"
        />
      </Field>
      <Field label="Cliente desde (ano)">
        <Input value={f.desde} onChange={(v) => setF({ ...f, desde: v })} />
      </Field>
      <Actions onClose={onClose} submitLabel={cliente ? "salvar alterações" : "salvar"} />
    </form>
  );
}
