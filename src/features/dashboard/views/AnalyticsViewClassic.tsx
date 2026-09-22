import { useMemo } from "react";
import { RevenueChart } from "../components/RevenueChart";
import { ClassicAviso, ClassicPanel } from "../components/classic/ClassicUI";

export function AnalyticsViewClassic() {
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
  const paginas = [
    { rota: "/ — home", acessos: "1.204" },
    { rota: "/#membros", acessos: "486" },
    { rota: "/#servicos", acessos: "312" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <ClassicAviso>
        // dados de exemplo — aguardando integração com o site principal (Plausible / Google Analytics / Cloudflare)
      </ClassicAviso>

      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
        <AnKpi label="Visitas // 7 dias" value={ult7.toLocaleString("pt-BR")} meta="site principal — dmg" />
        <AnKpi label="Visitantes únicos" value={Math.round(ult7 * 0.62).toLocaleString("pt-BR")} meta="últimos 7 dias" />
        <AnKpi label="Tempo médio" value="1m 42s" meta="por sessão" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ClassicPanel title="Acessos // site principal" sub="últimos 14 dias">
          <RevenueChart labels={labels} serie={visitas} formatValue={(v) => `${v} acessos`} height={240} />
        </ClassicPanel>

        <ClassicPanel title="Fontes de tráfego">
          <div className="space-y-4">
            {fontes.map((f) => (
              <div key={f.nome}>
                <div className="mb-2 flex items-center justify-between text-[13px] text-dmg-text-2">
                  <span>{f.nome}</span>
                  <b className="font-semibold text-dmg-text">{f.pct}%</b>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-dmg-surface-3">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-dmg-red-solid to-dmg-red shadow-[0_0_38px_rgba(192,24,26,.28)]"
                    style={{ width: `${f.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mb-3 mt-6 text-[11px] font-medium uppercase tracking-[.18em] text-dmg-text-3">
            Páginas mais acessadas
          </div>
          <div className="space-y-2">
            {paginas.map((p) => (
              <div
                key={p.rota}
                className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/[.035] px-3 py-2.5 font-mono text-xs text-dmg-text-2"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                {p.rota}
                <span className="ml-auto text-[11px] text-dmg-text-3">{p.acessos}</span>
              </div>
            ))}
          </div>
        </ClassicPanel>
      </div>
    </div>
  );
}

function AnKpi({ label, value, meta }: { label: string; value: string; meta: string }) {
  return (
    <ClassicPanel className="min-h-[110px]">
      <p className="text-xs font-medium uppercase tracking-[.18em] text-dmg-text-3">{label}</p>
      <p className="mt-2.5 text-2xl font-semibold text-dmg-text">{value}</p>
      <p className="mt-2 text-[13px] text-dmg-text-3">{meta}</p>
    </ClassicPanel>
  );
}
