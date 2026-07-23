import { motion } from "framer-motion";

const cards = [
  {
    letter: "D",
    tag: "// damage",
    title: "AMAGE",
    desc: "Impacto, força e determinação. A energia que move cada projeto e não aceita resultado mediano.",
  },
  {
    letter: "M",
    tag: "// method",
    title: "ETHOD",
    desc: "Estratégia, engenharia e método. Nada é improviso — cada entrega segue estrutura, processo e precisão.",
  },
  {
    letter: "G",
    tag: "// group",
    title: "ROUP",
    desc: "Equipe, união e liderança. Integração, estrutura e movimento contínuo — pilares de uma empresa preparada para o futuro.",
  },
];

export function BrandGrid() {
  return (
    <section id="marca" className="mx-auto max-w-[1440px] px-6 md:px-12 py-24 md:py-32">
      <p className="mono-label">Significado</p>
      <h2
        className="mt-4 font-extrabold leading-[1.06] tracking-[-0.02em]"
        style={{ fontSize: "clamp(32px, 4.6vw, 56px)" }}
      >
        O que é DMG<span className="dmg-cursor">_</span>
      </h2>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((c, i) => (
          <motion.article
            key={c.letter}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            className="dmg-conic-border relative overflow-hidden rounded-lg border border-dmg-border bg-dmg-surface px-6 py-10 transition-colors hover:border-dmg-border-strong"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -top-8 right-[-8px] select-none font-black leading-none tracking-[-0.04em] text-white/[0.03]"
              style={{ fontSize: 150 }}
            >
              {c.letter}
            </span>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-dmg-text-3">
              {c.tag}
            </p>
            <h3 className="mt-2 text-lg font-extrabold tracking-[0.08em]">
              <span className="text-dmg-red">{c.letter}</span>
              {c.title}
            </h3>
            <p className="mt-4 text-sm leading-[1.7] text-dmg-text-2">{c.desc}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
