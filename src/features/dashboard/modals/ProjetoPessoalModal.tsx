import { useState } from "react";
import type { ProjetoPessoal, ProjectStatus } from "@/lib/store/types";
import { Field, Input, Select, Actions } from "./ProjetoModal";

interface Props {
  projeto?: ProjetoPessoal;
  onSave: (dados: Omit<ProjetoPessoal, "id" | "criadoEm">) => Promise<void>;
  onClose: () => void;
}

/** Cria/edita os campos básicos de um projeto pessoal — sem cliente, valor ou
 * responsável (não é um contrato, é uma iniciativa própria). As to-dos são
 * editadas à parte, no modal de detalhe. */
export function ProjetoPessoalModal({ projeto, onSave, onClose }: Props) {
  const [f, setF] = useState({
    nome: projeto?.nome ?? "",
    status: projeto?.status ?? ("plan" as ProjectStatus),
    stack: projeto?.stack ?? "",
    repo: projeto?.repo ?? "",
    url: projeto?.url ?? "",
    desc: projeto?.desc ?? "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await onSave({ ...f, todos: projeto?.todos });
    onClose();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Nome do projeto">
        <Input value={f.nome} onChange={(v) => setF({ ...f, nome: v })} required />
      </Field>
      <Field label="Status">
        <Select value={f.status} onChange={(v) => setF({ ...f, status: v as ProjectStatus })}>
          <option value="plan">planejamento</option>
          <option value="dev">desenvolvimento</option>
          <option value="producao">produção</option>
          <option value="done">concluído</option>
        </Select>
      </Field>
      <Field label="Stack (separada por vírgulas)">
        <Input
          value={f.stack}
          onChange={(v) => setF({ ...f, stack: v })}
          placeholder="React, Node, Postgres"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Repositório (GitHub)">
          <Input
            value={f.repo}
            onChange={(v) => setF({ ...f, repo: v })}
            placeholder="https://github.com/..."
          />
        </Field>
        <Field label="URL">
          <Input value={f.url} onChange={(v) => setF({ ...f, url: v })} placeholder="https://" />
        </Field>
      </div>
      <Field label="Descrição">
        <textarea
          value={f.desc}
          onChange={(e) => setF({ ...f, desc: e.target.value })}
          rows={4}
          className="w-full rounded border border-dmg-border bg-dmg-surface-2 px-3 py-2 text-sm outline-none focus:border-dmg-red"
        />
      </Field>
      <Actions onClose={onClose} />
    </form>
  );
}
