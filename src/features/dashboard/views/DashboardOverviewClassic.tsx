import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useStore } from "@/lib/store/StoreProvider";
import { Panel, PanelTitle } from "../components/Panel";
import { StatusBadge } from "../components/StatusBadge";
import { BRL, fmtK, isoDay, mesKey, tempoRelativo } from "@/lib/format";

/**
 * Painel "clássico": mais denso, tipografia mono forte, mini-cards.
 * Mesmos dados do moderno — apenas roupa diferente.
 */
export function DashboardOverviewClassic() {
  const { projetos, clientes, receitas, atividades } = useStore();

  const { entradas, saidas, ativos, bars } = useMemo(() => {
    const hojeK = mesKey(isoDay(new Date()));
    const doMes = receitas.filter((r) => mesKey(r.data) === hojeK);
    const entradas = doMes.filter((r) => r.tipo === "entrada").reduce((s, r) => s + Number(r.valor), 0);
    const saidas = doMes.filter((r) => r.tipo === "saida").reduce((s, r) => s + Number(r.valor), 0);
    const ativos = projetos.filter((p) => p.status !== "done").length;

    const now = new Date();
    const bars: { label: string; valor: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7);
      bars.push({
        label: d.toLocaleDateString("pt-BR", { month: "short" }),
        valor: receitas
          .filter((r) => r.tipo === "entrada" && mesKey(r.data) === key)
          .reduce((s, r) => s + Number(r.valor), 0),
      });
    }
    return { entradas, saidas, ativos, bars };
  }, [projetos, receitas]);

  const max = Math.max(1, ...bars.map((b) => b.valor));

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-dmg-border-strong bg-gradient-to-br from-dmg-surface via-dmg-bg to-dmg-surface p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-dmg-red">
          &gt; status.core --live
        </p>
        <h2 className="mt-2 text-2xl md:text-3xl font-black">
          {ativos} projetos ativos // {clientes.length} clientes vivos
        </h2>
        <p className="mt-2 font-mono text-xs text-dmg-text-2">
          saldo do mês: <b className="text-dmg-text">{BRL(entradas - saidas)}</b> · uptime da
          equipe: <b className="text-dmg-text">100%</b>
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat label="entradas" value={fmtK(entradas)} accent="emerald" />
        <MiniStat label="saídas" value={fmtK(saidas)} accent="red" />
        <MiniStat label="ativos" value={ativos.toString()} />
        <MiniStat label="clientes" value={clientes.length.toString()} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-5">
        <Panel>
          <PanelTitle title=":: fluxo 6M" sub="entradas por mês" />
          <div className="flex items-end gap-3 h-48">
            {bars.map((b) => (
              <div key={b.label} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-dmg-red-solid to-dmg-red transition-all"
                    style={{ height: `${(b.valor / max) * 100}%`, minHeight: 4 }}
                    title={BRL(b.valor)}
                  />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-dmg-text-3">
                  {b.label}
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelTitle title=":: log" sub="últimos eventos" />
          {atividades.length === 0 ? (
            <p className="font-mono text-xs text-dmg-text-3">$ empty</p>
          ) : (
            <ul className="space-y-2 font-mono text-[12px]">
              {atividades.slice(0, 8).map((a) => (
                <li key={a.id} className="border-l-2 border-dmg-red-dark pl-3">
                  <div
                    className="text-dmg-text-2 leading-snug [&_b]:font-semibold [&_b]:text-dmg-text"
                    dangerouslySetInnerHTML={{ __html: a.texto }}
                  />
                  <small className="text-[10px] uppercase tracking-[0.14em] text-dmg-text-3">
                    {tempoRelativo(a.ts)}
                  </small>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel>
        <PanelTitle title=":: pipeline" sub="projetos em execução" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="border-b border-dmg-border-strong text-left text-[10px] uppercase tracking-[0.16em] text-dmg-text-3">
                <th className="pb-2 pr-3">projeto</th>
                <th className="pb-2 pr-3">resp</th>
                <th className="pb-2 pr-3">status</th>
                <th className="pb-2">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dmg-border">
              {projetos
                .filter((p) => p.status !== "done")
                .slice(0, 8)
                .map((p) => (
                  <tr key={p.id}>
                    <td className="py-2 pr-3">
                      <Link
                        to="/projetos/$id"
                        params={{ id: p.id }}
                        className="font-semibold hover:text-dmg-red"
                      >
                        {p.nome}
                      </Link>
                    </td>
                    <td className="py-2 pr-3 text-dmg-text-2">{p.resp || "—"}</td>
                    <td className="py-2 pr-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-2 tabular-nums text-dmg-text">{p.progresso}%</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function MiniStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "emerald" | "red";
}) {
  const color =
    accent === "emerald"
      ? "text-emerald-400"
      : accent === "red"
        ? "text-dmg-red"
        : "text-dmg-text";
  return (
    <div className="rounded border border-dmg-border bg-dmg-surface p-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-dmg-text-3">
        {label}
      </div>
      <div className={`mt-1 text-xl font-black tabular-nums ${color}`}>{value}</div>
    </div>
  );
}
