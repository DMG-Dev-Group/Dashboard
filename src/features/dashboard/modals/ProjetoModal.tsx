import { useState, type ReactNode } from "react";
import { useStore } from "@/lib/store/StoreProvider";
import type { ModeloCobranca, Projeto, ProjectStatus } from "@/lib/store/types";
import { calcProgresso } from "@/lib/store/relations";
import { RESPONSAVEIS } from "@/lib/store/constants";

interface Props {
  projeto?: Projeto;
  onClose: () => void;
}

export function ProjetoModal({ projeto, onClose }: Props) {
  const { add, update, log, clientes } = useStore();
  const [f, setF] = useState<Partial<Projeto>>({
    nome: projeto?.nome ?? "",
    tipo: projeto?.tipo ?? "",
    resp: projeto?.resp ?? RESPONSAVEIS[0],
    clienteId: projeto?.clienteId ?? "",
    status: projeto?.status ?? "plan",
    valor: projeto?.valor ?? 0,
    modeloCobranca: projeto?.modeloCobranca ?? "unico",
    valorMensal: projeto?.valorMensal ?? 0,
    stack: projeto?.stack ?? "",
    repo: projeto?.repo ?? "",
    url: projeto?.url ?? "",
    desc: projeto?.desc ?? "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    // Progresso é sempre derivado das To-Dos do projeto (não é editável à mão).
    const modelo = f.modeloCobranca ?? "unico";
    const payload = {
      ...f,
      progresso: calcProgresso(projeto?.todos),
      // valor/valorMensal só fazem sentido pro modelo escolhido — zera o que
      // não se aplica em vez de deixar lixo de uma troca de modelo anterior.
      valor: modelo === "mensal" ? 0 : Number(f.valor) || 0,
      valorMensal: modelo === "unico" ? 0 : Number(f.valorMensal) || 0,
    };
    if (projeto) {
      await update("projetos", projeto.id, payload);
      await log(`<b>Projeto</b> — ${payload.nome} atualizado`, "projeto");
    } else {
      await add("projetos", payload);
      await log(`<b>Projeto</b> — ${payload.nome} criado`, "projeto");
    }
    onClose();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Nome do projeto">
        <Input value={f.nome ?? ""} onChange={(v) => setF({ ...f, nome: v })} required />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tipo">
          <Input
            value={f.tipo ?? ""}
            onChange={(v) => setF({ ...f, tipo: v })}
            placeholder="Web, App, API…"
          />
        </Field>
        <Field label="Responsável">
          <Select value={f.resp ?? ""} onChange={(v) => setF({ ...f, resp: v })}>
            {RESPONSAVEIS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Cliente">
        <Select value={f.clienteId ?? ""} onChange={(v) => setF({ ...f, clienteId: v })}>
          <option value="">— nenhum —</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Status">
        <Select
          value={f.status ?? "plan"}
          onChange={(v) => setF({ ...f, status: v as ProjectStatus })}
        >
          <option value="plan">planejamento</option>
          <option value="dev">desenvolvimento</option>
          <option value="producao">produção</option>
          <option value="done">concluído</option>
        </Select>
      </Field>
      <p className="-mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-dmg-text-3">
        // progresso é calculado automaticamente pelas to-dos do projeto
      </p>
      <Field label="Modelo de cobrança">
        <Select
          value={f.modeloCobranca ?? "unico"}
          onChange={(v) => setF({ ...f, modeloCobranca: v as ModeloCobranca })}
        >
          <option value="unico">pagamento único</option>
          <option value="mensal">mensalidade</option>
          <option value="hibrido">entrada + mensalidade</option>
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        {f.modeloCobranca !== "mensal" && (
          <Field
            label={
              f.modeloCobranca === "hibrido" ? "Valor de entrada (R$)" : "Valor contratado (R$)"
            }
          >
            <Input
              type="number"
              value={String(f.valor ?? 0)}
              onChange={(v) => setF({ ...f, valor: Number(v) })}
            />
          </Field>
        )}
        {(f.modeloCobranca === "mensal" || f.modeloCobranca === "hibrido") && (
          <Field label="Mensalidade (R$)">
            <Input
              type="number"
              value={String(f.valorMensal ?? 0)}
              onChange={(v) => setF({ ...f, valorMensal: Number(v) })}
            />
          </Field>
        )}
      </div>
      <Field label="Stack (separada por vírgulas)">
        <Input
          value={f.stack ?? ""}
          onChange={(v) => setF({ ...f, stack: v })}
          placeholder="React, Node, Postgres"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Repositório (GitHub)">
          <Input
            value={f.repo ?? ""}
            onChange={(v) => setF({ ...f, repo: v })}
            placeholder="https://github.com/..."
          />
        </Field>
        <Field label="URL de produção">
          <Input
            value={f.url ?? ""}
            onChange={(v) => setF({ ...f, url: v })}
            placeholder="https://"
          />
        </Field>
      </div>
      <Field label="Descrição / como foi feito">
        <textarea
          value={f.desc ?? ""}
          onChange={(e) => setF({ ...f, desc: e.target.value })}
          rows={4}
          className="w-full rounded border border-dmg-border bg-dmg-surface-2 px-3 py-2 text-sm outline-none focus:border-dmg-red"
        />
      </Field>
      <Actions onClose={onClose} />
    </form>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-dmg-text-3">
        {label}
      </span>
      {children}
    </label>
  );
}

export function Input({
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  disabled,
  list,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  list?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      list={list}
      className="w-full rounded border border-dmg-border bg-dmg-surface-2 px-3 py-2 text-sm outline-none focus:border-dmg-red disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
}

export function Select({
  value,
  onChange,
  children,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full rounded border border-dmg-border bg-dmg-surface-2 px-3 py-2 text-sm outline-none focus:border-dmg-red disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </select>
  );
}

export function Actions({
  onClose,
  submitLabel = "salvar",
}: {
  onClose: () => void;
  submitLabel?: string;
}) {
  return (
    <div className="mt-4 flex justify-end gap-2">
      <button
        type="button"
        onClick={onClose}
        className="rounded border border-dmg-border-strong px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-dmg-text-2 hover:bg-dmg-surface-2"
      >
        cancelar
      </button>
      <button
        type="submit"
        className="rounded bg-dmg-red-solid px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white hover:bg-dmg-red-hover"
      >
        {submitLabel}
      </button>
    </div>
  );
}
