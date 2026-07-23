import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import danImg from "@/assets/dan.png";
import migoImg from "@/assets/migo.png";
import guiguiImg from "@/assets/guigui.png";

interface Member {
  id: "d" | "m" | "g";
  letter: string;
  name: string;
  age: string;
  photo: string;
  stack: string[];
}

const members: Member[] = [
  {
    id: "d",
    letter: "D",
    name: "Daniel",
    age: "22 anos",
    photo: danImg,
    stack: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker"],
  },
  {
    id: "m",
    letter: "M",
    name: "Miguel",
    age: "21 anos",
    photo: migoImg,
    stack: ["Python", "Flutter", "Firebase", "Go", "AWS"],
  },
  {
    id: "g",
    letter: "G",
    name: "Guilherme",
    age: "23 anos",
    photo: guiguiImg,
    stack: ["Rust", "Next.js", "Redis", "Kubernetes", "GraphQL"],
  },
];

export function MembersShowcase() {
  const [active, setActive] = useState<Member["id"] | null>(null);

  return (
    <section id="membros" className="mx-auto max-w-[1600px] px-6 md:px-12 py-24 md:py-32">
      <p className="mono-label">Quem somos</p>
      <h2
        className="mt-4 font-extrabold leading-[1.06] tracking-[-0.02em]"
        style={{ fontSize: "clamp(32px, 4.6vw, 56px)" }}
      >
        Os fundadores da DMG Group<span className="dmg-cursor">_</span>
      </h2>

      <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
        {members.map((m) => {
          const isActive = active === m.id;
          const isInactive = active !== null && !isActive;
          return (
            <motion.button
              key={m.id}
              layout
              onClick={() => setActive(isActive ? null : m.id)}
              animate={{
                opacity: isInactive ? 0.35 : 1,
                scale: isActive ? 1.02 : 1,
              }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className={`relative flex items-center gap-6 overflow-hidden rounded-lg border bg-dmg-surface px-6 py-6 text-left transition-colors ${
                isActive
                  ? "border-dmg-red-dark"
                  : "border-dmg-border hover:border-dmg-border-strong"
              }`}
            >
              <span className="absolute -top-6 -right-4 select-none font-black leading-none tracking-[-0.04em] text-white/[0.04]" style={{ fontSize: 180 }}>
                {m.letter}
              </span>
              <div className="relative flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded border border-dmg-border bg-dmg-surface-2">
                <img src={m.photo} alt={m.name} className="h-full w-full object-cover" />
              </div>

              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.div
                    key="info"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="min-w-[220px] rounded border border-dmg-border bg-dmg-bg/60 p-5 backdrop-blur-sm">
                      <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-dmg-text-3">
                        // membro
                      </span>
                      <h3 className="mt-1 text-xl font-extrabold">{m.name}</h3>
                      <span className="font-mono text-xs text-dmg-text-3">{m.age}</span>
                      <div className="my-4 h-px bg-dmg-border" />
                      <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-dmg-red">
                        Stack
                      </span>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {m.stack.map((s) => (
                          <span
                            key={s}
                            className="rounded border border-dmg-border-strong bg-dmg-surface-2 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-dmg-text-2"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!isActive && (
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-dmg-text-3">
                    // {m.name.toLowerCase()}
                  </span>
                  <div className="mt-1 text-2xl font-extrabold">{m.name}</div>
                  <div className="font-mono text-xs text-dmg-text-3">{m.age}</div>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
