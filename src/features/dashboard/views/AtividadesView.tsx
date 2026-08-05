import { useStore } from "@/lib/store/StoreProvider";
import { Panel, PanelTitle } from "../components/Panel";
import { fmtAtividadeTexto, fmtDataHoraCompleta } from "@/lib/format";

export function AtividadesView() {
  const { atividades } = useStore();
  return (
    <Panel>
      <PanelTitle title="Registro de atividades" sub="tudo que aconteceu no painel" />
      {atividades.length === 0 ? (
        <p className="font-mono text-sm text-dmg-text-3">Nenhuma atividade registrada.</p>
      ) : (
        <div className="space-y-3">
          {atividades.map((a) => (
            <div
              key={a.id}
              className="flex items-start gap-3 rounded border border-dmg-border bg-dmg-surface-2/50 px-4 py-3"
            >
              <span className="mt-1 text-dmg-red">▸</span>
              <div className="flex-1">
                <div
                  className="text-sm leading-relaxed text-dmg-text-2 [&_b]:font-semibold [&_b]:text-dmg-text"
                  dangerouslySetInnerHTML={{ __html: a.texto }}
                />
                <span
                  className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-dmg-text-3"
                  title={fmtDataHoraCompleta(a.ts)}
                >
                  {fmtAtividadeTexto(a.ts)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
