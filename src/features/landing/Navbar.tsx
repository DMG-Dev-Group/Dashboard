import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logoUrl from "@/assets/logo.svg";

const links = [
  { href: "#marca", label: "A Marca" },
  { href: "#membros", label: "Membros" },
  { href: "#servicos", label: "Serviços" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-3 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-lg bg-dmg-bg/85 border-b border-dmg-border"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <a href="#" className="flex items-center gap-3">
        <img src={logoUrl} alt="DMG" width={36} height={36} />
        <span className="hidden sm:inline font-mono text-[11px] uppercase tracking-[0.38em] text-dmg-text-2">
          Damage&nbsp;Group
        </span>
      </a>

      <ul className="flex items-center gap-4 md:gap-8">
        {links.map((l) => (
          <li key={l.href} className="hidden sm:block">
            <a
              href={l.href}
              className="group relative font-mono text-xs uppercase tracking-[0.16em] text-dmg-text-2 transition-colors hover:text-dmg-text"
            >
              {l.label}
              <span className="absolute bottom-[-6px] left-0 h-px w-full origin-right scale-x-0 bg-dmg-red transition-transform duration-300 group-hover:origin-left group-hover:scale-x-100" />
            </a>
          </li>
        ))}
        <li>
          <Link
            to="/dashboard"
            className="inline-flex items-center rounded border border-dmg-red-solid bg-dmg-red-solid px-4 md:px-6 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-white transition-all hover:bg-dmg-red-hover hover:border-dmg-red-hover hover:-translate-y-px"
          >
            Acessar Painel
          </Link>
        </li>
      </ul>
    </nav>
  );
}
