const words = [
  "Damage Group",
  "Força",
  "Inovação",
  "Liderança tecnológica",
  "Impacto",
  "Precisão",
  "Domínio",
];

export function Strip() {
  const loop = [...words, ...words];
  return (
    <div className="border-y border-dmg-border bg-dmg-surface overflow-hidden py-4">
      <div className="dmg-marquee-track flex w-max gap-12 whitespace-nowrap">
        {loop.map((w, i) => (
          <span
            key={i}
            className="font-mono text-[11px] uppercase tracking-[0.28em] text-dmg-text-3"
          >
            {w} <b className="ml-3 font-normal text-dmg-red-dark">//</b>
          </span>
        ))}
      </div>
    </div>
  );
}
