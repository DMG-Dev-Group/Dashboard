import { useState } from "react";
import { useStore } from "@/lib/store/StoreProvider";
import { Actions, Field, Input, Select } from "./ProjetoModal";
import { isoDay } from "@/lib/format";
import { dmgToast } from "@/lib/toast";
import { receitaVeioDoBanco, type Receita } from "@/lib/store/types";

export function LancamentoModal({ receita, onClose }: { receita?: Receita; onClose: () => void }) {
  const { add, update, log, projetos, receitas } = useStore();
  const [f, setF] = useState({
    desc: receita?.desc ?? "",
    valor: String(receita?.valor ?? 0),
    tipo: (receita?.tipo ?? "entrada") as "entrada" | "saida",
    data: receita?.data ?? isoDay(new Date()),
    projetoId: receita?.projetoId ?? "",
    categoria: receita?.categoria ?? "",
  });

  // categorias já usadas em outros lançamentos — sugestão via datalist, sem taxonomia fixa
  const categoriasSugeridas = Array.from(new Set(receitas.map((r) => r.categoria).filter(Boolean))) as string[];

  const travado = receita ? receitaVeioDoBanco(receita) : false;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const proj = projetos.find((p) => p.id === f.projetoId);
    if (receita) {
      // transação vinda do banco: só classificação (projeto/categoria/desc) é editável
      const payload = travado
        ? {
            desc: f.desc,
            projetoId: f.projetoId || undefined,
            projeto: proj?.nome,
            categoria: f.categoria || undefined,
          }
        : {
            desc: f.desc,
            valor: Number(f.valor) || 0,
            tipo: f.tipo,
            data: f.data,
            projetoId: f.projetoId || undefined,
            projeto: proj?.nome,
            categoria: f.categoria || undefined,
          };
      await update("receitas", receita.id, payload);
      await log(`<b>Lançamento</b> — ${f.desc} atualizado`, "financeiro");
      dmgToast.success("Lançamento atualizado");
    } else {
      await add("receitas", {
        desc: f.desc,
        valor: Number(f.valor) || 0,
        tipo: f.tipo,
        data: f.data,
        projetoId: f.projetoId || undefined,
        projeto: proj?.nome,
        categoria: f.categoria || undefined,
        origem: "manual",
      });
      await log(`<b>Lançamento</b> — ${f.desc} (${f.tipo})`, "financeiro");
      dmgToast.success("Lançamento registrado");
    }
    onClose();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {travado && (
        <p className="rounded border border-dmg-border-strong bg-dmg-surface-2 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-dmg-text-3">
          // transação sincronizada do banco — valor, tipo e data não podem ser alterados
        </p>
      )}
      <Field label="Descrição">
        <Input value={f.desc} onChange={(v) => setF({ ...f, desc: v })} required />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Valor (R$)">
          <Input type="number" value={f.valor} onChange={(v) => setF({ ...f, valor: v })} disabled={travado} />
        </Field>
        <Field label="Tipo">
          <Select
            value={f.tipo}
            onChange={(v) => setF({ ...f, tipo: v as "entrada" | "saida" })}
            disabled={travado}
          >
            <option value="entrada">entrada</option>
            <option value="saida">saída</option>
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Data">
          <Input type="date" value={f.data} onChange={(v) => setF({ ...f, data: v })} disabled={travado} />
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
      <Field label="Categoria">
        <Input
          value={f.categoria}
          onChange={(v) => setF({ ...f, categoria: v })}
          placeholder="Infra, Marketing, Impostos…"
          list="categorias-financeiro"
        />
        <datalist id="categorias-financeiro">
          {categoriasSugeridas.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </Field>
      <Actions onClose={onClose} submitLabel={receita ? "salvar alterações" : "salvar"} />
    </form>
  );
}
