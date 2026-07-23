import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useStore } from "@/lib/store/StoreProvider";
import { Panel, PanelTitle } from "../components/Panel";
import { Kpi } from "../components/Kpi";
import { StatusBadge } from "../components/StatusBadge";
import { ProgressBar } from "../components/ProgressBar";
import { RevenueChart } from "../components/RevenueChart";
import { WorkspacePad } from "../components/WorkspacePad";
import { BRL, fmtK, isoDay, mesKey, tempoRelativo } from "@/lib/format";

export function DashboardOverviewModern() {
  const { projetos, clientes, receitas, atividades } = useStore();

  const stats = useMemo(() => {
    const hojeK = mesKey(isoDay(new Date()));
    const doMes = receitas.filter((r) => mesKey(r.data) === hojeK);
    const entradas = doMes.filter((r) => r.tipo === "entrada").reduce((s, r) => s + Number(r.valor), 0);
    const saidas = doMes.filter((r) => r.tipo === "saida").reduce((s, r) => s + Number(r.valor), 0);
    const ativos = projetos.filter((p) => p.status !== "done").length;

    // Serie últimos 6 meses (entradas)
    const now = new Date();
    const labels: string[] = [];
    const serie: number[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7);
      labels.push(d.toLocaleDateString("pt-BR", { month: "short" }));
      serie.push(
        receitas
          .filter((r) => r.tipo === "entrada" && mesKey(r.data) === key)
          .reduce((s, r) => s + Number(r.valor), 0),
      );
    }
    return { entradas, saidas, ativos, labels, serie };
  }, [projetos, receitas]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Kpi label="Projetos ativos" value={String(stats.ativos)} meta={`${clientes.length} clientes`} />
        <Kpi label="Entradas // mês" value={fmtK(stats.entradas)} tone="ok" />
        <Kpi label="Saídas // mês" value={fmtK(stats.saidas)} tone="bad" />
        <Kpi label="Saldo // mês" value={BRL(stats.entradas - stats.saidas)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <Panel>
          <PanelTitle title="Faturamento // 6 meses" sub="entradas confirmadas" />
          <RevenueChart labels={stats.labels} serie={stats.serie} formatValue={BRL} />
        </Panel>

        <Panel>
          <PanelTitle title="Atividades recentes" sub="tempo real" />
          {atividades.length === 0 ? (
            <p className="font-mono text-sm text-dmg-text-3">Sem atividades ainda.</p>
          ) : (
            <ul className="space-y-3">
              {atividades.slice(0, 6).map((a) => (
                <li key={a.id} className="flex items-start gap-3">
                  <span className="mt-1 text-dmg-red">▸</span>
                  <div className="flex-1">
                    <div
                      className="text-sm leading-snug text-dmg-text-2 [&_b]:font-semibold [&_b]:text-dmg-text"
                      dangerouslySetInnerHTML={{ __html: a.texto }}
                    />
                    <small className="font-mono text-[10px] uppercase tracking-[0.14em] text-dmg-text-3">
                      {tempoRelativo(a.ts)}
                    </small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel>
        <PanelTitle title="Projetos em andamento" sub="ordenados por progresso" />
        {projetos.length === 0 ? (
          <p className="font-mono text-sm text-dmg-text-3">Nenhum projeto cadastrado.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {projetos
              .filter((p) => p.status !== "done")
              .slice()
              .sort((a, b) => b.progresso - a.progresso)
              .slice(0, 6)
              .map((p) => (
                <Link
                  key={p.id}
                  to="/projetos/$id"
                  params={{ id: p.id }}
                  className="rounded-lg border border-dmg-border bg-dmg-surface-2/40 p-4 transition-colors hover:border-dmg-red-dark"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <b className="truncate">{p.nome}</b>
                    <StatusBadge status={p.status} />
                  </div>
                  <ProgressBar value={p.progresso} />
                  <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-dmg-text-3">
                    <span>{p.tipo || "—"}</span>
                    <span>{p.progresso}%</span>
                  </div>
                </Link>
              ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
