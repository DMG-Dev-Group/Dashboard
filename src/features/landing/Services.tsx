import { motion } from "framer-motion";
import { Code2, Smartphone, Cloud, Shield, LayoutDashboard, BarChart3 } from "lucide-react";
import type { ComponentType } from "react";

interface Service {
  icon: ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  span?: string;
}

const services: Service[] = [
  {
    icon: Code2,
    title: "Desenvolvimento Web",
    desc: "Sites, e-commerces e aplicações web de alta performance — do institucional ao produto completo.",
    span: "md:col-span-2 md:row-span-2",
  },
  {
    icon: Smartphone,
    title: "Apps Mobile",
    desc: "Aplicativos nativos e multiplataforma com Flutter, integrados a backends escaláveis.",
  },
  {
    icon: Cloud,
    title: "Infra & Cloud",
    desc: "Arquitetura em nuvem, containers e CI/CD. AWS, Kubernetes e Docker operando 24/7.",
  },
  {
    icon: Shield,
    title: "Segurança",
    desc: "Proteção de dados, autenticação e boas práticas defensivas em conformidade com a LGPD.",
  },
  {
    icon: LayoutDashboard,
    title: "Sistemas & SaaS",
    desc: "ERPs, CRMs e plataformas sob medida — sistemas que viram o coração da operação do cliente.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    desc: "Dashboards e métricas que transformam dados em decisão — visibilidade total do negócio.",
  },
];

export function Services() {
  return (
    <section id="servicos" className="mx-auto max-w-[1440px] px-6 md:px-12 py-24 md:py-32">
      <p className="mono-label">O que fazemos</p>
      <h2
        className="mt-4 font-extrabold leading-[1.06] tracking-[-0.02em]"
        style={{ fontSize: "clamp(32px, 4.6vw, 56px)" }}
      >
        Serviços<span className="dmg-cursor">_</span>
      </h2>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-4 auto-rows-[minmax(180px,auto)] gap-4">
        {services.map((s, i) => (
          <motion.article
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, delay: i * 0.05 }}
            className={`group relative overflow-hidden rounded-lg border border-dmg-border bg-dmg-surface px-6 py-8 transition-all hover:-translate-y-1 hover:border-dmg-border-strong ${
              s.span ?? ""
            }`}
          >
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(400px 200px at var(--mx,50%) var(--my,50%), rgba(192,24,26,0.12), transparent 60%)",
              }}
            />
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded border border-dmg-border text-dmg-red">
              <s.icon className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-extrabold tracking-[0.1em] uppercase">{s.title}</h4>
            <p className="mt-3 text-[13.5px] leading-[1.7] text-dmg-text-2">{s.desc}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
