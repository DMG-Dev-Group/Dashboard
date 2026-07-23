import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Activity, Briefcase, CalendarDays, DollarSign, Server, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store/StoreProvider";
import { STATUS } from "@/lib/store/constants";
import type { Evento, ProjectStatus } from "@/lib/store/types";
import { RevenueChart } from "../components/RevenueChart";
import { StatusBadge } from "../components/StatusBadge";
import { EventoModal } from "../modals/EventoModal";
import { ProjetoModal } from "../modals/ProjetoModal";
import { useModal } from "../modals/ModalProvider";
import { BRL, fmtDataBR, fmtK, isoDay, mesKey, tempoRelativo } from "@/lib/format";

/**
 * Painel "clássico": mais denso, tipografia mono forte, mini-cards.
 * Mesmos dados do moderno — apenas roupa diferente.
 */
export function DashboardOverviewClassic() {
  const { projetos, clientes, receitas, atividades, eventos } = useStore();
  const modal = useModal();

  const stats = useMemo(() => {
    const hojeK = mesKey(isoDay(new Date()));
    const doMes = receitas.filter((r) => mesKey(r.data) === hojeK);
    const entradas = doMes.filter((r) => r.tipo === "entrada").reduce((s, r) => s + Number(r.valor), 0);
    const saidas = doMes.filter((r) => r.tipo === "saida").reduce((s, r) => s + Number(r.valor), 0);
    const ativos = projetos.filter((p) => p.status !== "done").length;
    const hoje = isoDay(new Date());
    const emSeteDias = isoDay(new Date(Date.now() + 7 * 86400000));
    const eventosSemana = eventos.filter((e) => e.data >= hoje && e.data <= emSeteDias).length;
    const proximoEvento = eventos
      .filter((e) => e.data >= hoje)
      .slice()
      .sort((a, b) => `${a.data}${a.hora ?? ""}`.localeCompare(`${b.data}${b.hora ?? ""}`))[0];

    const now = new Date();
    const labels: string[] = [];
    const serie: number[] = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7);
      labels.push(d.toLocaleDateString("pt-BR", { month: "short" }));
      serie.push(
        receitas
          .filter((r) => r.tipo === "entrada" && mesKey(r.data) === key)
          .reduce((s, r) => s + Number(r.valor), 0),
      );
    }
    const mesAnterior = serie.length > 1 ? serie[serie.length - 2] : 0;
    const deltaReceita = mesAnterior > 0 ? ((entradas - mesAnterior) / mesAnterior) * 100 : 0;
    return {
      entradas,
      saidas,
      saldo: entradas - saidas,
      ativos,
      eventosSemana,
      proximoEvento,
      labels,
      serie,
      deltaReceita,
    };
  }, [projetos, receitas, eventos]);

  const revBars = useMemo(() => {
    const max = Math.max(1, ...stats.serie);
    return stats.serie.map((valor, index) => ({
      key: `${stats.labels[index]}-${index}`,
      label: stats.labels[index],
      height: Math.max(12, (valor / max) * 96),
    }));
  }, [stats.labels, stats.serie]);

  const projetosEmAndamento = useMemo(
    () => projetos.filter((p) => p.status !== "done").slice(0, 6),
    [projetos],
  );

  const proximosEventos = useMemo(
    () =>
      eventos
        .filter((e) => e.data >= isoDay(new Date()))
        .slice()
        .sort((a, b) => `${a.data}${a.hora ?? ""}`.localeCompare(`${b.data}${b.hora ?? ""}`))
        .slice(0, 3),
    [eventos],
  );

  const openProjetoModal = () => modal.open("Novo projeto", (close) => <ProjetoModal onClose={close} />);
  const openEventoModal = () => modal.open("Novo evento", (close) => <EventoModal onClose={close} />);

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[28px] border border-dmg-border-strong bg-[linear-gradient(135deg,var(--dmg-surface),var(--dmg-bg)_44%,rgba(192,24,26,.28))] p-5 shadow-[0_22px_80px_rgba(0,0,0,.52)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-[linear-gradient(to_right,transparent,var(--dmg-red-solid),transparent)] after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-[linear-gradient(to_right,var(--dmg-red-solid),var(--dmg-border-strong),transparent)]">
        <div className="pointer-events-none absolute left-0 top-0 h-full w-24 bg-[linear-gradient(90deg,rgba(192,24,26,.22),transparent)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
          <div className="flex min-h-[280px] flex-col justify-between rounded-3xl border border-dmg-border bg-dmg-bg/40 p-5">
            <div className="flex flex-wrap gap-2">
              <Pill>Damage OS</Pill>
              <Pill muted>Painel interno</Pill>
            </div>

            <div className="py-8">
              <p className="font-serif text-[64px] font-bold leading-none tracking-normal text-dmg-red-solid drop-shadow-[0_0_22px_rgba(192,24,26,.65)] md:text-[96px]">
                DMG
              </p>
              <p className="mt-1 font-serif text-xl font-bold uppercase tracking-[0.52em] text-dmg-text md:text-2xl">
                Damage
              </p>
              <p className="mt-1 font-serif text-xs font-bold uppercase tracking-[0.72em] text-dmg-red">
                Group
              </p>
              <p className="mt-5 max-w-xl text-sm leading-6 text-dmg-text-2">
                Centro de comando da DMG — projetos, clientes, financeiro, calendário e
                infraestrutura em leitura executiva.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={openProjetoModal} className="h-11 rounded-xl border border-dmg-red-dark bg-dmg-red-solid px-5 font-semibold text-primary-foreground shadow-[0_0_38px_rgba(192,24,26,.28)] hover:bg-dmg-red-hover">
                + Novo projeto
              </Button>
              <Button onClick={openEventoModal} variant="outline" className="h-11 rounded-xl border-dmg-border bg-dmg-surface-2 px-5 text-dmg-text-2 hover:bg-dmg-surface-3 hover:text-dmg-text">
                + Novo evento
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            <HeroTile
              to="/calendario"
              icon={<CalendarDays className="h-5 w-5" />}
              label="Próximo evento"
              value={stats.proximoEvento?.titulo ?? "—"}
              meta={eventMeta(stats.proximoEvento)}
            />
            <HeroTile
              to="/financeiro"
              icon={<DollarSign className="h-5 w-5" />}
              label="Saldo do mês"
              value={BRL(stats.saldo)}
              meta="entradas − saídas"
            />
            <HeroTile
              to="/projetos"
              icon={<Briefcase className="h-5 w-5" />}
              label="Em desenvolvimento"
              value={String(stats.ativos)}
              meta="projetos em andamento"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<DollarSign className="h-5 w-5" />}
          badge={stats.deltaReceita >= 0 ? "online" : "atenção"}
          badgeTone={stats.deltaReceita >= 0 ? "success" : "warn"}
          label="Receita mensal"
          value={fmtK(stats.entradas)}
          delta={<><b>{formatDelta(stats.deltaReceita)}</b> vs. mês anterior</>}
        />
        <MetricCard
          icon={<Briefcase className="h-5 w-5" />}
          badge="ativos"
          label="Projetos ativos"
          value={String(stats.ativos)}
          delta={<><b>{projetos.length}</b> no portfólio</>}
        />
        <MetricCard
          icon={<Users className="h-5 w-5" />}
          badge="base ativa"
          badgeTone="success"
          label="Clientes"
          value={String(clientes.length)}
          delta="carteira da DMG"
        />
        <MetricCard
          icon={<CalendarDays className="h-5 w-5" />}
          badge="7 dias"
          badgeTone="muted"
          label="Eventos da semana"
          value={String(stats.eventosSemana)}
          delta={stats.eventosSemana > 0 ? "agenda em movimento" : "sem eventos próximos"}
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
        <ClassicPanel
          title="Performance dos sistemas"
          sub="Receita mensal consolidada"
          action={<ClassicMore to="/financeiro">últimos 8 meses →</ClassicMore>}
        >
          <RevenueChart labels={stats.labels} serie={stats.serie} formatValue={(v) => BRL(v)} height={300} />
          <div className="mt-3 flex gap-5 text-xs text-dmg-text-3">
            <span className="inline-flex items-center gap-2">
              <i className="h-1 w-5 rounded-full bg-gradient-to-r from-dmg-red-solid to-dmg-red" />
              Receita (entradas)
            </span>
          </div>
        </ClassicPanel>

        <ClassicPanel
          title="Timeline"
          sub="Atividades recentes"
          action={<ClassicMore to="/atividades">tudo →</ClassicMore>}
        >
          <ActivityList items={atividades.slice(0, 4)} />
        </ClassicPanel>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <ClassicPanel title="Receita mensal" sub="últimos 12 meses">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[28px] font-semibold tracking-normal text-dmg-text">{BRL(stats.entradas)}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-dmg-text-3">
                <Pill success>{formatDelta(stats.deltaReceita)}</Pill>
                <span>vs. mês anterior</span>
              </div>
            </div>
            <div className="flex h-24 items-end gap-1.5">
              {revBars.map((bar) => (
                <span
                  key={bar.key}
                  className="w-2 rounded-full bg-gradient-to-b from-dmg-red via-dmg-red-solid to-dmg-red-solid/20"
                  style={{ height: `${bar.height}px` }}
                  title={bar.label}
                />
              ))}
            </div>
          </div>
        </ClassicPanel>

        <ClassicPanel title="Uso da infraestrutura" sub="capacidade em tempo real">
          <div className="space-y-[18px]">
            <Usage label="CPU" value={62} />
            <Usage label="Memória" value={48} />
            <Usage label="Storage" value={71} />
          </div>
          <div className="mt-[18px] space-y-2">
            <ServerLine name="api.dmg" latency="32ms" />
            <ServerLine name="cdn-edge" latency="140ms" warn />
          </div>
        </ClassicPanel>

        <ClassicPanel
          title="Próximos eventos"
          sub="agenda da equipe"
          action={<ClassicMore to="/calendario">abrir →</ClassicMore>}
        >
          <EventList eventos={proximosEventos} />
        </ClassicPanel>

        <ClassicPanel title="Equipe" sub="status dos fundadores" action={<ClassicMore to="/equipe">ver →</ClassicMore>}>
          <TeamRow initial="D" name="Daniel" stack="fullstack · react / node" />
          <TeamRow initial="M" name="Miguel" stack="backend · python / go / aws" />
          <TeamRow initial="G" name="Guilherme" stack="infra · rust / k8s" warn />
        </ClassicPanel>
      </section>

      <ClassicPanel title="Projetos em andamento" sub="portfólio da DMG" action={<ClassicMore to="/projetos">ver todos →</ClassicMore>}>
        <div className="-mx-5 -mb-5 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-y border-dmg-border bg-dmg-surface-2/60">
                <ClassicTh>Projeto</ClassicTh>
                <ClassicTh>Responsável</ClassicTh>
                <ClassicTh>Status</ClassicTh>
                <ClassicTh>Progresso</ClassicTh>
              </tr>
            </thead>
            <tbody>
              {projetosEmAndamento.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-5 text-center text-sm text-dmg-text-3">
                    Nenhum projeto em andamento.
                  </td>
                </tr>
              ) : (
                projetosEmAndamento.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-dmg-surface-2/60">
                    <td className="border-b border-dmg-border px-5 py-3.5 text-sm text-dmg-text-2">
                      <Link to="/projetos/$id" params={{ id: p.id }} className="group block">
                        <span className="font-medium text-dmg-text group-hover:text-dmg-red">{p.nome}</span>
                        <span className="mt-1 block text-xs text-dmg-text-3">
                          {p.tipo || "Projeto"} <span className="inline-block text-dmg-red opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100">→</span>
                        </span>
                      </Link>
                    </td>
                    <td className="border-b border-dmg-border px-5 py-3.5 text-sm text-dmg-text-2">
                      <span className="inline-grid h-8 w-8 place-items-center rounded-full border border-dmg-red-dark bg-dmg-red-solid/10 text-xs font-semibold text-dmg-text">
                        {(p.resp || "?").slice(0, 1)}
                      </span>
                    </td>
                    <td className="border-b border-dmg-border px-5 py-3.5">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="border-b border-dmg-border px-5 py-3.5 text-sm text-dmg-text-2">
                      <span className="inline-block h-2 w-28 overflow-hidden rounded-full bg-dmg-surface-3 align-middle">
                        <i className="block h-full rounded-full bg-dmg-red-solid" style={{ width: `${p.progresso}%` }} />
                      </span>
                      <span className="ml-2 text-[13px] text-dmg-text-2">{p.progresso}%</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ClassicPanel>
    </div>
  );
}

function ClassicPanel({
  title,
  sub,
  action,
  children,
}: {
  title: string;
  sub?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dmg-border bg-[linear-gradient(145deg,rgba(255,255,255,.09),rgba(255,255,255,.025)),var(--dmg-bg)] p-5 shadow-[0_22px_70px_rgba(0,0,0,.48),inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-lg">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold tracking-normal text-dmg-text">{title}</h3>
          {sub && <span className="mt-1 block text-[13px] text-dmg-text-3">{sub}</span>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function ClassicMore({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="whitespace-nowrap text-xs font-medium text-dmg-red hover:underline">
      {children}
    </Link>
  );
}

function Pill({ children, muted, success }: { children: React.ReactNode; muted?: boolean; success?: boolean }) {
  return (
    <span
      className={
        success
          ? "inline-flex items-center gap-1 rounded-full border border-dmg-ok/30 bg-dmg-ok/10 px-2.5 py-1 text-xs font-medium text-dmg-ok"
          : muted
            ? "inline-flex items-center gap-1 rounded-full border border-dmg-border bg-dmg-surface-2 px-2.5 py-1 text-xs font-medium text-dmg-text-2"
            : "inline-flex items-center gap-1 rounded-full border border-dmg-red-dark bg-dmg-red-solid/15 px-2.5 py-1 text-xs font-medium text-dmg-text"
      }
    >
      {children}
    </span>
  );
}

function HeroTile({
  to,
  icon,
  label,
  value,
  meta,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  meta: string;
}) {
  return (
    <Link
      to={to}
      className="block rounded-3xl border border-dmg-border bg-dmg-surface-2/55 p-4 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-dmg-red-dark hover:bg-dmg-red-solid/10"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl border border-dmg-red-dark bg-dmg-red-solid/15 text-dmg-red">
          {icon}
        </span>
        <span className="h-2 w-16 rounded-full bg-gradient-to-r from-dmg-red-solid to-dmg-border-strong" />
      </div>
      <p className="mt-5 text-xs uppercase tracking-[0.22em] text-dmg-text-3">{label}</p>
      <p className="mt-2 truncate text-[26px] font-semibold tracking-normal text-dmg-text">{value}</p>
      <p className="mt-1 text-[13px] text-dmg-text-3">{meta}</p>
    </Link>
  );
}

function MetricCard({
  icon,
  badge,
  badgeTone,
  label,
  value,
  delta,
}: {
  icon: React.ReactNode;
  badge: string;
  badgeTone?: "success" | "warn" | "muted";
  label: string;
  value: string;
  delta: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[150px] overflow-hidden rounded-2xl border border-dmg-border bg-[linear-gradient(145deg,rgba(255,255,255,.09),rgba(255,255,255,.025)),var(--dmg-bg)] p-4 shadow-[0_22px_70px_rgba(0,0,0,.48),inset_0_1px_0_rgba(255,255,255,.08)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-[linear-gradient(to_right,transparent,var(--dmg-red-solid),transparent)] after:pointer-events-none after:absolute after:inset-0 after:animate-[scan_6s_ease-in-out_infinite] after:bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,.07)_48%,transparent_58%)]">
      <div className="relative flex items-start justify-between gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl border border-dmg-red-dark bg-dmg-red-solid/15 text-dmg-red">
          {icon}
        </span>
        <Pill muted={badgeTone === "muted"} success={badgeTone === "success"}>{badge}</Pill>
      </div>
      <p className="relative mt-5 text-xs font-medium uppercase tracking-[0.18em] text-dmg-text-3">{label}</p>
      <p className="relative mt-2 text-2xl font-semibold tracking-normal text-dmg-text">{value}</p>
      <p className="relative mt-2 text-[13px] text-dmg-text-2 [&_b]:font-semibold [&_b]:text-dmg-ok">{delta}</p>
    </div>
  );
}

function ActivityList({ items }: { items: { id: string; texto: string; ts: number }[] }) {
  if (items.length === 0) {
    return <p className="rounded-2xl border border-dmg-border bg-dmg-surface-2/60 p-3 text-[13px] text-dmg-text-3">Sem atividades recentes.</p>;
  }
  return (
    <div className="space-y-3.5">
      {items.map((a) => (
        <div key={a.id} className="flex gap-3.5">
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-dmg-red-dark bg-dmg-red-solid/15 text-[13px] text-dmg-red">
            <Activity className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 flex-1 rounded-2xl border border-dmg-border bg-dmg-surface-2/60 p-3 text-[13.5px] leading-6 text-dmg-text-2 [&_b]:font-semibold [&_b]:text-dmg-text">
            <div dangerouslySetInnerHTML={{ __html: a.texto }} />
            <span className="mt-2 block text-xs text-dmg-text-3">{tempoRelativo(a.ts)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function EventList({ eventos }: { eventos: Evento[] }) {
  if (eventos.length === 0) {
    return <p className="rounded-2xl border border-dmg-border bg-dmg-surface-2/60 p-3 text-[13px] text-dmg-text-3">Calendário livre.</p>;
  }
  return (
    <div className="space-y-3.5">
      {eventos.map((evento) => (
        <div key={evento.id} className="flex gap-3.5">
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-dmg-red-dark bg-dmg-red-solid/15 text-dmg-red">
            <CalendarDays className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 flex-1 rounded-2xl border border-dmg-border bg-dmg-surface-2/60 p-3">
            <p className="truncate text-[13.5px] font-semibold text-dmg-text">{evento.titulo}</p>
            <span className="mt-2 block text-xs text-dmg-text-3">
              {fmtDataBR(evento.data)}{evento.hora ? ` · ${evento.hora}` : ""}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Usage({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[13px] text-dmg-text-2">
        <span>{label}</span>
        <b className="font-semibold text-dmg-text">{value}%</b>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-dmg-surface-3">
        <i className="block h-full rounded-full bg-gradient-to-r from-dmg-red-solid to-dmg-red shadow-[0_0_38px_rgba(192,24,26,.28)]" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function ServerLine({ name, latency, warn }: { name: string; latency: string; warn?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-dmg-border bg-dmg-surface-2/60 px-3 py-2.5 font-mono text-xs text-dmg-text-2">
      <Server className="h-3.5 w-3.5 text-dmg-text-3" />
      <span className={`h-2 w-2 rounded-full ${warn ? "bg-dmg-warn shadow-[0_0_8px_var(--dmg-warn)]" : "bg-dmg-ok shadow-[0_0_8px_var(--dmg-ok)]"}`} />
      {name}
      <span className="ml-auto text-[11px] text-dmg-text-3">{latency}</span>
    </div>
  );
}

function TeamRow({ initial, name, stack, warn }: { initial: string; name: string; stack: string; warn?: boolean }) {
  return (
    <div className="mb-2 flex items-center gap-3 rounded-xl border border-dmg-border bg-dmg-surface-2/60 px-3 py-2.5">
      <div className="grid h-9 w-9 place-items-center rounded-xl border border-dmg-red-dark bg-dmg-red-solid/15 text-sm font-extrabold text-dmg-red">
        {initial}
      </div>
      <div className="text-[13.5px] font-semibold text-dmg-text">
        {name}
        <span className="mt-0.5 block text-[11.5px] font-normal text-dmg-text-3">{stack}</span>
      </div>
      <span className={`ml-auto h-2 w-2 rounded-full ${warn ? "bg-dmg-warn shadow-[0_0_8px_var(--dmg-warn)]" : "bg-dmg-ok shadow-[0_0_8px_var(--dmg-ok)]"}`} />
    </div>
  );
}

function ClassicTh({ children }: { children: React.ReactNode }) {
  return <th className="px-5 py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] text-dmg-text-3">{children}</th>;
}

function eventMeta(evento?: Evento) {
  if (!evento) return "calendário livre";
  return `${fmtDataBR(evento.data)}${evento.hora ? ` · ${evento.hora}` : ""}`;
}

function formatDelta(delta: number) {
  if (!Number.isFinite(delta) || delta === 0) return "0%";
  return `${delta > 0 ? "+" : ""}${delta.toFixed(0)}%`;
}

function statusClass(status: ProjectStatus) {
  return STATUS[status]?.cls ?? STATUS.plan.cls;
}

void statusClass;

    </div>
  );
}
