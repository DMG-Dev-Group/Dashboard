import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function Hero() {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY * 0.15);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="relative flex min-h-screen flex-col justify-center overflow-hidden px-6 md:px-12 pt-40 pb-24">
      {/* Outline "DMG" gigante com parallax sutil */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-end pr-[2vw] select-none"
        style={{ transform: `translateY(${offset}px)` }}
      >
        <span
          className="font-black leading-none tracking-[-0.06em] text-transparent"
          style={{
            fontSize: "clamp(200px, 32vw, 500px)",
            WebkitTextStroke: "1px rgba(255,77,79,0.1)",
          }}
        >
          DMG
        </span>
      </div>

      <div className="relative z-[2] max-w-4xl">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mono-label"
        >
          // damage group
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="mt-6 mb-8 font-black uppercase leading-[0.98] tracking-[-0.03em]"
          style={{ fontSize: "clamp(48px, 7.5vw, 104px)" }}
        >
          Força.<br />Inovação.<br />
          Liderança <span className="text-dmg-red">tecnológica</span>
          <span className="dmg-cursor">_</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 max-w-lg text-[17px] leading-[1.75] text-dmg-text-2"
        >
          A DMG constrói produtos digitais com impacto, precisão e domínio — do design ao deploy. Uma
          marca feita para qualquer ambiente onde atua.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap gap-4"
        >
          <Link
            to="/dashboard"
            className="inline-flex min-h-[44px] items-center rounded border border-dmg-red-solid bg-dmg-red-solid px-6 font-mono text-xs uppercase tracking-[0.14em] text-white transition hover:bg-dmg-red-hover hover:-translate-y-px"
          >
            Acessar o painel
          </Link>
          <a
            href="#membros"
            className="inline-flex min-h-[44px] items-center rounded border border-dmg-border-strong px-6 font-mono text-xs uppercase tracking-[0.14em] transition hover:border-dmg-red-dark hover:-translate-y-px"
          >
            Conheça a equipe
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 flex max-w-lg gap-8 md:gap-16 border-t border-dmg-border pt-6"
        >
          {[
            { n: "0", s: "3", l: "Fundadores" },
            { n: "10", s: "0%", l: "Comprometimento" },
            { n: "24", s: "/7", l: "Operação" },
          ].map((m) => (
            <div key={m.l}>
              <div className="text-[30px] font-extrabold tracking-[-0.02em] tabular-nums">
                {m.n}
                <span className="text-dmg-red">{m.s}</span>
              </div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.24em] text-dmg-text-3">
                {m.l}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </header>
  );
}
