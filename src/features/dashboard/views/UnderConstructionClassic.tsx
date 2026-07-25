import { ClassicPanel } from "../components/classic/ClassicUI";

interface Props {
  title: string;
  desc: string;
}

export function UnderConstructionClassic({ title, desc }: Props) {
  return (
    <ClassicPanel className="px-6 py-12 md:px-10 md:py-14">
      <p className="font-mono text-[11px] font-bold uppercase tracking-[.32em] text-dmg-red-solid">
        // módulo em construção
      </p>
      <h2 className="mt-3 text-2xl font-extrabold text-dmg-text">{title}</h2>
      <p className="mt-3 max-w-lg text-sm leading-[1.7] text-dmg-text-2">{desc}</p>
    </ClassicPanel>
  );
}
