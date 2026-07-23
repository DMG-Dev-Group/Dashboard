import { Link } from "@tanstack/react-router";

export function CtaBanner() {
  return (
    <section className="mx-auto max-w-[1440px] px-6 md:px-12 py-24 md:py-32">
      <div className="dmg-conic-border relative flex flex-wrap items-center justify-between gap-8 overflow-hidden rounded-lg border border-dmg-red-dark bg-dmg-surface px-8 md:px-12 py-16">
        <div className="max-w-lg">
          <p className="mono-label">// painel dmg</p>
          <h2
            className="mt-3 font-extrabold tracking-[-0.02em]"
            style={{ fontSize: "clamp(26px, 3vw, 40px)" }}
          >
            O centro de operações da DMG
          </h2>
          <p className="mt-3 leading-[1.7] text-dmg-text-2">
            Projetos, clientes, receita, infraestrutura e segurança — tudo em um único painel com a
            cara da marca.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="inline-flex min-h-[44px] items-center rounded bg-dmg-red-solid px-6 font-mono text-xs uppercase tracking-[0.14em] text-white transition hover:bg-dmg-red-hover hover:-translate-y-px"
        >
          Abrir Dashboard
        </Link>
      </div>
    </section>
  );
}
