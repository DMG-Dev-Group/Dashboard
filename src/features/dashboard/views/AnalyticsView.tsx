import { useMemo } from "react";
import { Panel, PanelTitle } from "../components/Panel";
import { Kpi } from "../components/Kpi";
import { RevenueChart } from "../components/RevenueChart";

export function AnalyticsView() {
  const { visitas, labels } = useMemo(() => {
    const visitas = [86, 102, 94, 120, 133, 141, 98, 110, 125, 152, 169, 148, 171, 190];
    const labels: string[] = [];
    for (let i = visitas.length - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      labels.push(d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }));
    }
    return { visitas, labels };
  }, []);

  const ult7 = visitas.slice(-7).reduce((a, b) => a + b, 0);
  const fontes = [
    { nome: "Direto", pct: 38 },
    { nome: "Google", pct: 31 },
    { nome: "Instagram", pct: 19 },
    { nome: "GitHub", pct: 12 },
  ];

  return (
    <div className="space-y-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-amber-400">
        // dados de exemplo — aguardando integração com o site principal
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Kpi label="Visitas // 7 dias" value={ult7.toLocaleString("pt-BR")} meta="site principal — dmg" />
        <Kpi
          label="Visitantes únicos"
          value={Math.round(ult7 * 0.62).toLocaleString("pt-BR")}
          meta="últimos 7 dias"
        />
        <Kpi label="Tempo médio" value="1m 42s" meta="por sessão" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel>
          <PanelTitle title="Acessos // site principal" sub="últimos 14 dias" />
          <RevenueChart labels={labels} serie={visitas} formatValue={(v) => `${v} acessos`} height={240} />
        </Panel>
        <Panel>
          <PanelTitle title="Fontes de tráfego" />
          <div className="space-y-4">
            {fontes.map((f) => (
              <div key={f.nome}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-dmg-text-2">{f.nome}</span>
                  <b className="tabular-nums text-dmg-text">{f.pct}%</b>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-dmg-surface-3">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-dmg-red-solid to-dmg-red"
                    style={{ width: `${f.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
