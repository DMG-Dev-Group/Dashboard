import { Panel, PanelTitle } from "../components/Panel";

interface Props {
  title: string;
  desc: string;
}

export function UnderConstruction({ title, desc }: Props) {
  return (
    <Panel className="text-center py-16">
      <p className="mono-label">// módulo em construção</p>
      <h2 className="mt-3 text-2xl font-extrabold">{title}</h2>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-[1.7] text-dmg-text-2">{desc}</p>
    </Panel>
  );
}
