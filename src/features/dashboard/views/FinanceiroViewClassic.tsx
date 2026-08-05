import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store/StoreProvider";
import { BRL, fmtDataBR, isoDay, mesKey } from "@/lib/format";
import { useModal } from "../modals/ModalProvider";
import { useConfirm } from "../components/ConfirmProvider";
import { LancamentoModal } from "../modals/LancamentoModal";
import { dmgToast } from "@/lib/toast";
import { receitaVeioDoBanco } from "@/lib/store/types";
import { Building2, Pencil, Plus, Trash2, UserPen } from "lucide-react";
import { ClassicButtonSm, ClassicEmpty, ClassicIconMini, ClassicPanel, ClassicPill, ClassicTh } from "../components/classic/ClassicUI";

type FiltroOrigem = "todos" | "manual" | "banco";

export function FinanceiroViewClassic() {
  const { receitas, projetos, remove, log } = useStore();
  const { open } = useModal();
  const confirm = useConfirm();
  const [filtroOrigem, setFiltroOrigem] = useState<FiltroOrigem>("todos");
  const k = mesKey(isoDay(new Date()));
  const doMes = receitas.filter((l) => mesKey(l.data) === k);
  const entradas = doMes.filter((l) => l.tipo === "entrada").reduce((s, l) => s + Number(l.valor), 0);
  const saidas = doMes.filter((l) => l.tipo === "saida").reduce((s, l) => s + Number(l.valor), 0);

  const filtrada = receitas.filter((l) => {
    if (filtroOrigem === "manual") return !receitaVeioDoBanco(l);
    if (filtroOrigem === "banco") return receitaVeioDoBanco(l);
    return true;
  });
  const lista = filtrada.slice().sort((a, b) => b.data.localeCompare(a.data)).slice(0, 25);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
        <FinKpi label="Entradas // mês" value={BRL(entradas)} tone="ok" />
        <FinKpi label="Saídas // mês" value={BRL(saidas)} tone="bad" />
        <FinKpi label="Saldo // mês" value={BRL(entradas - saidas)} />
      </div>

      <ClassicPanel
        title="Lançamentos"
        sub="entradas e saídas da DMG"
        action={
          <div className="flex items-center gap-2">
            <select
              value={filtroOrigem}
              onChange={(e) => setFiltroOrigem(e.target.value as FiltroOrigem)}
              className="h-[38px] rounded-xl border border-white/10 bg-white/[.03] px-3 text-[13px] text-dmg-text-2 outline-none focus:border-dmg-red-solid/55"
            >
              <option value="todos">todas origens</option>
              <option value="manual">manual</option>
              <option value="banco">banco</option>
            </select>
            <ClassicButtonSm onClick={() => open("Novo lançamento", (close) => <LancamentoModal onClose={close} />)}>
              <Plus className="h-3.5 w-3.5" /> novo lançamento
            </ClassicButtonSm>
          </div>
        }
      >
        <div className="-mx-5 -mb-5 overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-y border-white/10 bg-white/[.035]">
                <ClassicTh>Descrição</ClassicTh>
                <ClassicTh>Origem</ClassicTh>
                <ClassicTh>Categoria</ClassicTh>
                <ClassicTh>Data</ClassicTh>
                <ClassicTh>Tipo</ClassicTh>
                <ClassicTh>Valor</ClassicTh>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {lista.length === 0 ? (
                <ClassicEmpty colSpan={7}>Nenhum lançamento — registre a primeira entrada.</ClassicEmpty>
              ) : (
                lista.map((l) => {
                  const proj = l.projetoId ? projetos.find((p) => p.id === l.projetoId) : null;
                  const banco = receitaVeioDoBanco(l);
                  return (
                    <tr key={l.id} className="transition-colors hover:bg-white/[.035]">
                      <td className="border-b border-white/8 px-5 py-3">
                        <div className="text-sm font-medium text-dmg-text">{l.desc}</div>
                        {proj ? (
                          <Link
                            to="/projetos/$id"
                            params={{ id: proj.id }}
                            className="font-mono text-[11px] text-dmg-text-3 hover:text-dmg-red"
                          >
                            {proj.nome} →
                          </Link>
                        ) : (
                          <span className="font-mono text-[11px] text-dmg-text-3">{l.projeto || "—"}</span>
                        )}
                      </td>
                      <td className="border-b border-white/8 px-5 py-3">
                        <ClassicPill tone={banco ? "default" : "muted"}>
                          {banco ? <Building2 className="h-3 w-3" /> : <UserPen className="h-3 w-3" />}
                          {banco ? "banco" : "manual"}
                        </ClassicPill>
                      </td>
                      <td className="border-b border-white/8 px-5 py-3 text-[13px] text-dmg-text-3">
                        {l.categoria || "—"}
                      </td>
                      <td className="border-b border-white/8 px-5 py-3 font-mono text-xs text-dmg-text-3">
                        {fmtDataBR(l.data)}
                      </td>
                      <td className="border-b border-white/8 px-5 py-3">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.1em] ${
                            l.tipo === "entrada"
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                              : "border-amber-400/30 bg-amber-400/10 text-amber-200"
                          }`}
                        >
                          {l.tipo}
                        </span>
                      </td>
                      <td
                        className={`border-b border-white/8 px-5 py-3 tabular-nums ${
                          l.tipo === "entrada" ? "text-emerald-300" : "text-dmg-red"
                        }`}
                      >
                        {l.tipo === "entrada" ? "+" : "−"} {BRL(Number(l.valor))}
                      </td>
                      <td className="border-b border-white/8 px-5 py-3 text-right">
                        <div className="inline-flex gap-1.5">
                          <ClassicIconMini
                            onClick={() =>
                              open("Editar lançamento", (close) => <LancamentoModal receita={l} onClose={close} />)
                            }
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </ClassicIconMini>
                          <ClassicIconMini
                            onClick={async () => {
                              if (await confirm({ title: "Excluir este lançamento?", danger: true })) {
                                await remove("receitas", l.id);
                                await log(`<b>Lançamento</b> — ${l.desc} excluído`, "financeiro");
                                dmgToast.success("Lançamento excluído");
                              }
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </ClassicIconMini>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </ClassicPanel>
    </div>
  );
}

function FinKpi({ label, value, tone }: { label: string; value: string; tone?: "ok" | "bad" }) {
  const toneCls = tone === "ok" ? "text-emerald-300" : tone === "bad" ? "text-dmg-red" : "text-dmg-text";
  return (
    <ClassicPanel className="min-h-[110px]">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-dmg-text-3">{label}</p>
      <p className={`mt-2.5 text-2xl font-semibold tracking-normal ${toneCls}`}>{value}</p>
    </ClassicPanel>
  );
}
