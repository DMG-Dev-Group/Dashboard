import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store/StoreProvider";
import { Panel, PanelTitle } from "../components/Panel";
import { Kpi } from "../components/Kpi";
import { BRL, fmtDataBR, isoDay, mesKey } from "@/lib/format";
import { useModal } from "../modals/ModalProvider";
import { useConfirm } from "../components/ConfirmProvider";
import { LancamentoModal } from "../modals/LancamentoModal";
import { dmgToast } from "@/lib/toast";
import { receitaVeioDoBanco } from "@/lib/store/types";
import { Building2, Pencil, Plus, Trash2, UserPen } from "lucide-react";

type FiltroOrigem = "todos" | "manual" | "banco";

export function FinanceiroView() {
  const { receitas, projetos, remove, log } = useStore();
  const { open } = useModal();
  const confirm = useConfirm();
  const [filtroOrigem, setFiltroOrigem] = useState<FiltroOrigem>("todos");
  const k = mesKey(isoDay(new Date()));
  const doMes = receitas.filter((l) => mesKey(l.data) === k);
  const entradas = doMes
    .filter((l) => l.tipo === "entrada")
    .reduce((s, l) => s + Number(l.valor), 0);
  const saidas = doMes.filter((l) => l.tipo === "saida").reduce((s, l) => s + Number(l.valor), 0);

  const filtrada = receitas.filter((l) => {
    if (filtroOrigem === "manual") return !receitaVeioDoBanco(l);
    if (filtroOrigem === "banco") return receitaVeioDoBanco(l);
    return true;
  });
  const lista = filtrada
    .slice()
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 25);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Kpi label="Entradas // mês" value={BRL(entradas)} tone="ok" />
        <Kpi label="Saídas // mês" value={BRL(saidas)} tone="bad" />
        <Kpi label="Saldo // mês" value={BRL(entradas - saidas)} />
      </div>

      <Panel>
        <PanelTitle
          title="Lançamentos"
          sub="entradas e saídas da DMG"
          action={
            <div className="flex items-center gap-2">
              <select
                value={filtroOrigem}
                onChange={(e) => setFiltroOrigem(e.target.value as FiltroOrigem)}
                className="rounded border border-dmg-border-strong bg-dmg-surface-2 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-dmg-text-2 outline-none focus:border-dmg-red"
              >
                <option value="todos">todas origens</option>
                <option value="manual">manual</option>
                <option value="banco">banco</option>
              </select>
              <button
                onClick={() =>
                  open("Novo lançamento", (close) => <LancamentoModal onClose={close} />)
                }
                className="inline-flex items-center gap-1.5 rounded border border-dmg-border-strong bg-dmg-surface-2 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] hover:border-dmg-red-dark"
              >
                <Plus className="h-3.5 w-3.5" /> novo lançamento
              </button>
            </div>
          }
        />
        {lista.length === 0 ? (
          <p className="font-mono text-sm text-dmg-text-3">
            Nenhum lançamento — registre a primeira entrada.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dmg-border text-left font-mono text-[10px] uppercase tracking-[0.16em] text-dmg-text-3">
                  <th className="pb-3 pr-4">Descrição</th>
                  <th className="pb-3 pr-4">Origem</th>
                  <th className="pb-3 pr-4">Categoria</th>
                  <th className="pb-3 pr-4">Data</th>
                  <th className="pb-3 pr-4">Tipo</th>
                  <th className="pb-3 pr-4">Valor</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-dmg-border">
                {lista.map((l) => {
                  const proj = l.projetoId ? projetos.find((p) => p.id === l.projetoId) : null;
                  const banco = receitaVeioDoBanco(l);
                  return (
                    <tr key={l.id}>
                      <td className="py-2 pr-4">
                        <div className="font-semibold">{l.desc}</div>
                        {proj ? (
                          <Link
                            to="/projetos/$id"
                            params={{ id: proj.id }}
                            className="font-mono text-[11px] text-dmg-text-3 hover:text-dmg-red"
                          >
                            {proj.nome} →
                          </Link>
                        ) : (
                          <span className="font-mono text-[11px] text-dmg-text-3">
                            {l.projeto || "—"}
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${
                            banco
                              ? "border-sky-500/30 bg-sky-500/10 text-sky-300"
                              : "border-dmg-border-strong bg-dmg-surface-2 text-dmg-text-2"
                          }`}
                        >
                          {banco ? (
                            <Building2 className="h-3 w-3" />
                          ) : (
                            <UserPen className="h-3 w-3" />
                          )}
                          {banco ? "banco" : "manual"}
                        </span>
                      </td>
                      <td className="py-2 pr-4 font-mono text-[11px] text-dmg-text-2">
                        {l.categoria || "—"}
                      </td>
                      <td className="py-2 pr-4 font-mono text-xs text-dmg-text-2">
                        {fmtDataBR(l.data)}
                      </td>
                      <td className="py-2 pr-4">
                        <span
                          className={`inline-flex rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${
                            l.tipo === "entrada"
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                              : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                          }`}
                        >
                          {l.tipo}
                        </span>
                      </td>
                      <td
                        className={`py-2 pr-4 tabular-nums ${
                          l.tipo === "entrada" ? "text-emerald-400" : "text-dmg-red"
                        }`}
                      >
                        {l.tipo === "entrada" ? "+" : "−"} {BRL(Number(l.valor))}
                      </td>
                      <td className="py-2 text-right">
                        <div className="inline-flex gap-1">
                          <button
                            onClick={() =>
                              open("Editar lançamento", (close) => (
                                <LancamentoModal receita={l} onClose={close} />
                              ))
                            }
                            className="rounded p-1.5 text-dmg-text-3 hover:text-dmg-text"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              if (
                                await confirm({ title: "Excluir este lançamento?", danger: true })
                              ) {
                                await remove("receitas", l.id);
                                await log(`<b>Lançamento</b> — ${l.desc} excluído`, "financeiro");
                                dmgToast.success("Lançamento excluído");
                              }
                            }}
                            className="rounded p-1.5 text-dmg-text-3 hover:text-dmg-red"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
