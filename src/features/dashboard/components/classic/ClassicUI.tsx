import { Link } from "@tanstack/react-router";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { STATUS } from "@/lib/store/constants";
import type { ProjectStatus } from "@/lib/store/types";
import { cn } from "@/lib/utils";

/**
 * Kit de UI do painel "clássico" (visual do Miguel) — glass panels escuros,
 * cantos arredondados, vermelho de destaque. Reconstrução fiel do
 * dashboard-classic.css original em Tailwind, para reuso em todas as
 * páginas do layout clássico (evita reimplementar o mesmo glass em cada view).
 */

const GLASS =
  "rounded-2xl border border-dmg-border bg-[linear-gradient(145deg,rgba(255,255,255,.09),rgba(255,255,255,.025)),var(--dmg-bg)] shadow-[0_22px_70px_rgba(0,0,0,.48),inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-lg";

export function ClassicPanelTitle({
  title,
  sub,
  action,
}: {
  title: ReactNode;
  sub?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h3 className="text-sm font-semibold tracking-normal text-dmg-text">{title}</h3>
        {sub && <span className="mt-1 block text-[13px] text-dmg-text-3">{sub}</span>}
      </div>
      {action}
    </div>
  );
}

/** Glass card. Passe `title`/`sub`/`action` para um header pronto, ou
 * componha você mesmo com <ClassicPanelTitle> antes dos children. */
export function ClassicPanel({
  title,
  sub,
  action,
  children,
  className,
}: {
  title?: ReactNode;
  sub?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(GLASS, "p-5", className)}>
      {(title || action) && <ClassicPanelTitle title={title} sub={sub} action={action} />}
      {children}
    </div>
  );
}

export function ClassicMore({
  to,
  children,
  onClick,
}: {
  to?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  const cls = "whitespace-nowrap text-xs font-medium text-dmg-red hover:underline";
  if (onClick && !to) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        {children}
      </button>
    );
  }
  return (
    <Link to={to as string} className={cls}>
      {children}
    </Link>
  );
}

type Tone = "default" | "success" | "warn" | "muted";

const TONE_CLS: Record<Tone, string> = {
  default: "border-dmg-red-dark/50 bg-dmg-red-solid/15 text-[#fee2e2]",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  warn: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  muted: "border-dmg-border-strong bg-white/[.055] text-dmg-text-2",
};

export function ClassicPill({ tone = "default", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium",
        TONE_CLS[tone],
      )}
    >
      {children}
    </span>
  );
}

const STATUS_TONE: Record<ProjectStatus, Tone> = {
  plan: "muted",
  dev: "warn",
  producao: "success",
  done: "success",
};

export function ClassicStatusBadge({ status }: { status: ProjectStatus }) {
  const s = STATUS[status] ?? STATUS.plan;
  return <ClassicPill tone={STATUS_TONE[status] ?? "default"}>{s.label}</ClassicPill>;
}

export function ClassicProgress({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <span className="inline-flex items-center gap-2.5 align-middle">
      <span className="inline-block h-2 w-28 overflow-hidden rounded-full bg-dmg-surface-3">
        <i className="block h-full rounded-full bg-dmg-red-solid" style={{ width: `${v}%` }} />
      </span>
      <span className="text-[13px] text-dmg-text-2 tabular-nums">{v}%</span>
    </span>
  );
}

export function ClassicTh({ children }: { children?: ReactNode }) {
  return (
    <th className="px-5 py-3.5 text-left text-[11px] font-medium uppercase tracking-[0.2em] text-dmg-text-3">
      {children}
    </th>
  );
}

export function ClassicEmpty({ children, colSpan }: { children: ReactNode; colSpan?: number }) {
  if (colSpan) {
    return (
      <tr>
        <td colSpan={colSpan} className="px-5 py-8 text-center text-sm text-dmg-text-3">
          {children}
        </td>
      </tr>
    );
  }
  return <p className="py-8 text-center text-[13px] text-dmg-text-3">{children}</p>;
}

/* ============ BOTÕES ============ */

export function ClassicButtonPrimary({
  className,
  outline,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { outline?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-all",
        outline
          ? "border border-dmg-border bg-white/[.03] text-dmg-text-2 hover:bg-white/[.08] hover:text-dmg-text"
          : "border border-dmg-red-dark bg-dmg-red-solid text-white shadow-[0_0_38px_rgba(192,24,26,.28)] hover:-translate-y-px hover:bg-dmg-red-hover",
        className,
      )}
    />
  );
}

export function ClassicButtonSm({
  className,
  danger,
  outline,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean; outline?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "inline-flex h-[38px] items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-4 text-[13px] font-semibold transition-all",
        danger || outline
          ? "border border-dmg-border bg-white/[.03] text-dmg-text-2 hover:border-dmg-red-dark hover:text-dmg-red"
          : "border border-dmg-red-dark bg-dmg-red-solid text-white shadow-[0_0_38px_rgba(192,24,26,.28)] hover:-translate-y-px hover:bg-dmg-red-hover",
        className,
      )}
    />
  );
}

export function ClassicIconBtn({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-dmg-border bg-white/[.03] text-dmg-text-2 transition-colors hover:bg-white/[.1] hover:text-dmg-text",
        className,
      )}
    />
  );
}

export function ClassicIconMini({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "grid h-7 w-7 shrink-0 place-items-center rounded-[9px] border border-dmg-border bg-transparent text-dmg-text-3 transition-colors hover:border-dmg-red-dark/50 hover:bg-dmg-red-solid/[.08] hover:text-dmg-red",
        className,
      )}
    />
  );
}

/* ============ AVATARES ============ */

export function ClassicAvatarDot({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-grid h-8 w-8 shrink-0 place-items-center rounded-full border border-dmg-red-dark bg-dmg-red-solid/[.12] text-xs font-semibold text-dmg-text",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ============ TIMELINE / ATIVIDADES ============ */

export function ClassicActivityItem({
  icon,
  children,
  time,
  timeTitle,
}: {
  icon: ReactNode;
  children: ReactNode;
  time?: string;
  timeTitle?: string;
}) {
  return (
    <div className="flex gap-3.5">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-dmg-red-dark bg-dmg-red-solid/[.12] text-dmg-red">
        {icon}
      </span>
      <div className="min-w-0 flex-1 rounded-2xl border border-dmg-border bg-white/[.035] p-3 text-[13.5px] leading-6 text-dmg-text-2 [&_b]:font-semibold [&_b]:text-dmg-text">
        {children}
        {time && (
          <span className="mt-2 block text-xs text-dmg-text-3" title={timeTitle}>
            {time}
          </span>
        )}
      </div>
    </div>
  );
}

/* ============ AVISO ============ */

export function ClassicAviso({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-amber-400/35 bg-amber-400/5 px-4 py-3 text-[11px] font-medium uppercase tracking-[0.12em] text-amber-200">
      {children}
    </p>
  );
}

export function ClassicLinkTile({
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { to?: string }) {
  return (
    <a
      {...props}
      className={cn(
        "block rounded-2xl border border-dmg-border bg-white/[.035] p-4 transition-all hover:-translate-y-0.5 hover:border-dmg-red-dark",
        className,
      )}
    />
  );
}
