import { Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store/StoreProvider";
import { BRL, fmtDataBR, isoDay, mesKey } from "@/lib/format";
import { useModal } from "../modals/ModalProvider";
import { LancamentoModal } from "../modals/LancamentoModal";
import { Plus, Trash2 } from "lucide-react";
import { ClassicButtonSm, ClassicEmpty, ClassicIconMini, ClassicPanel, ClassicTh } from "../components/classic/ClassicUI";

export function FinanceiroViewClassic() {
  const { receitas, projetos, remove } = useStore();
  const { open } = useModal();
  const k = mesKey(isoDay(new Date()));
  const doMes = receitas.filter((l) => mesKey(l.data) === k);
  const entradas = doMes.filter((l) => l.tipo === "entrada").reduce((s, l) => s + Number(l.valor), 0);
  const saidas = doMes.filter((l) => l.tipo === "saida").reduce((s, l) => s + Number(l.valor), 0);

  const lista = receitas.slice().sort((a, b) => b.data.localeCompare(a.data)).slice(0, 25);

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
          <ClassicButtonSm onClick={() => open("Novo lançamento", (close) => <LancamentoModal onClose={close} />)}>
            <Plus className="h-3.5 w-3.5" /> novo lançamento
          </ClassicButtonSm>
        }
      >
        <div className="-mx-5 -mb-5 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-y border-white/10 bg-white/[.035]">
                <ClassicTh>Descrição</ClassicTh>
                <ClassicTh>Data</ClassicTh>
                <ClassicTh>Tipo</ClassicTh>
                <ClassicTh>Valor</ClassicTh>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {lista.length === 0 ? (
                <ClassicEmpty colSpan={5}>Nenhum lançamento — registre a primeira entrada.</ClassicEmpty>
              ) : (
                lista.map((l) => {
                  const proj = l.projetoId ? projetos.find((p) => p.id === l.projetoId) : null;
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
                        <ClassicIconMini
                          onClick={async () => {
                            if (confirm("Excluir este lançamento?")) await remove("receitas", l.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </ClassicIconMini>
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
