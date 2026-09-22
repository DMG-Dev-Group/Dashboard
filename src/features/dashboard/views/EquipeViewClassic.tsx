import { useState } from "react";
import danImg from "@/assets/dan.png";
import migoImg from "@/assets/migo.png";
import guiguiImg from "@/assets/guigui.png";

type PanelSide = "right" | "split" | "left";

const members: {
  id: string;
  letter: string;
  name: string;
  age: string;
  photo: string;
  mirror?: boolean;
  panel: PanelSide;
  stack: string[];
}[] = [
  {
    id: "d",
    letter: "D",
    name: "Daniel",
    age: "22 anos",
    photo: danImg,
    panel: "right",
    stack: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker"],
  },
  {
    id: "m",
    letter: "M",
    name: "Miguel",
    age: "21 anos",
    photo: migoImg,
    panel: "split",
    stack: ["Python", "Flutter", "Firebase", "Go", "AWS"],
  },
  {
    id: "g",
    letter: "G",
    name: "Guilherme",
    age: "23 anos",
    photo: guiguiImg,
    mirror: true,
    panel: "left",
    stack: ["Rust", "Next.js", "Redis", "Kubernetes", "GraphQL"],
  },
];

/**
 * Reconstrução fiel do .founder-card do dashboard-classic.css: cards
 * gigantes com a letra em marca d'água, foto com blend "overlay" e um
 * painel lateral que aparece ao clicar, revelando nome/idade/stack.
 */
export function EquipeViewClassic() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.02)),linear-gradient(110deg,rgba(192,24,26,.16),transparent_34%),#030303] p-6 shadow-[0_24px_80px_rgba(0,0,0,.58)] md:p-11">
      <p className="font-mono text-[11px] font-bold uppercase tracking-[.32em] text-dmg-red-solid">
        Quem somos
      </p>
      <h2 className="mt-2.5 max-w-3xl text-[32px] font-extrabold leading-[.94] text-white md:text-[56px]">
        Os fundadores da DMG Group
        <span className="dmg-cursor">_</span>
      </h2>

      <div className="mt-8 flex flex-col items-stretch justify-center gap-4 md:mt-14 md:flex-row md:items-center md:gap-6">
        {members.map((m) => {
          const isActive = active === m.id;
          const isInactive = active !== null && !isActive;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setActive(isActive ? null : m.id)}
              className={`group relative flex h-[420px] flex-col items-center justify-center rounded-2xl border bg-[linear-gradient(to_bottom,rgba(216,5,16,.96),rgba(8,8,8,.98)_74%),#080808] text-left shadow-[0_30px_80px_rgba(0,0,0,.58)] transition-[transform,opacity,filter,border-color] duration-300 md:h-[clamp(480px,50vw,680px)] md:w-[min(28vw,430px)] ${
                isActive
                  ? "z-10 scale-[1.03] overflow-visible border-dmg-red-solid/40 shadow-[0_0_0_1px_rgba(192,24,26,.24),0_28px_90px_rgba(192,24,26,.12)] md:scale-[1.06]"
                  : isInactive
                    ? "overflow-hidden border-white/10 opacity-40 grayscale-[.35] md:scale-[.9] md:opacity-[.12]"
                    : "overflow-hidden border-white/10 hover:scale-[1.015]"
              }`}
            >
              <span
                className="pointer-events-none absolute top-2 select-none font-black leading-[.85] text-[#f5c5c5]/80"
                style={{ fontSize: "clamp(140px,13vw,240px)" }}
              >
                {m.letter}
              </span>
              <img
                src={m.photo}
                alt={m.name}
                className={`pointer-events-none absolute inset-x-0 bottom-0 top-[10%] h-[90%] w-full object-contain object-bottom opacity-[.99] mix-blend-overlay ${
                  m.mirror ? "scale-x-[-1]" : ""
                }`}
              />

              {!isActive && (
                <div className="relative mt-auto w-full p-5">
                  <span className="block font-mono text-[10px] uppercase tracking-[.24em] text-white/45">
                    // {m.name.toLowerCase()}
                  </span>
                  <div className="mt-1 text-2xl font-extrabold text-white">{m.name}</div>
                  <div className="font-mono text-xs text-white/45">{m.age}</div>
                </div>
              )}

              {isActive && (
                <div
                  className={`absolute inset-x-3 bottom-3 z-20 flex flex-col gap-4 border border-dmg-red-solid/30 bg-black/72 p-5 text-left shadow-[0_24px_80px_rgba(0,0,0,.52)] backdrop-blur-2xl md:inset-x-auto md:bottom-auto md:top-1/2 md:w-[min(90vw,400px)] md:-translate-y-1/2 ${panelPosition(
                    m.panel,
                  )}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div>
                    <span className="block font-mono text-[10px] uppercase tracking-[3px] text-dmg-red-solid">
                      // membro
                    </span>
                    <p className="mt-0.5 text-[30px] font-bold leading-none text-white">{m.name}</p>
                    <span className="block font-mono text-[11px] tracking-[2px] text-white/48">{m.age}</span>
                  </div>
                  <div className="h-px w-full bg-dmg-red-solid/30" />
                  <div>
                    <span className="block font-mono text-[10px] uppercase tracking-[3px] text-dmg-red-solid">
                      Stack
                    </span>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {m.stack.map((s) => (
                        <span
                          key={s}
                          className="border border-dmg-red-solid/25 bg-dmg-red-solid/[.08] px-2.5 py-1 font-mono text-[10px] tracking-[1px] text-[#c47070]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function panelPosition(side: PanelSide) {
  switch (side) {
    case "left":
      return "md:left-auto md:right-full md:mr-4";
    default:
      return "md:right-auto md:left-full md:ml-4";
  }
}
