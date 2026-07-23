export function Footer() {
  return (
    <footer className="mx-auto flex max-w-[1440px] flex-wrap items-end justify-between gap-8 border-t border-dmg-border px-6 md:px-12 py-12">
      <div>
        <div className="text-[32px] font-black tracking-[-0.03em] text-dmg-red">DMG</div>
        <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.3em] text-dmg-text-3">
          Damage Group — força · inovação · liderança
        </div>
      </div>
      <div className="text-right font-mono text-[11px] leading-[1.8] tracking-[0.1em] text-dmg-text-3">
        © 2026 Damage Group.
        <br />
        Construída para o futuro da marca.
      </div>
    </footer>
  );
}
