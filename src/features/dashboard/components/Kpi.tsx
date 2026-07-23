import { Panel } from "./Panel";

interface KpiProps {
  label: string;
  value: string;
  meta?: string;
  tone?: "default" | "ok" | "bad";
}

export function Kpi({ label, value, meta, tone = "default" }: KpiProps) {
  const toneCls =
    tone === "ok"
      ? "text-emerald-400"
      : tone === "bad"
        ? "text-dmg-red"
        : "text-dmg-text";
  return (
    <Panel className="min-h-[130px]">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-dmg-text-3">
        {label}
      </p>
      <p className={`mt-3 text-3xl font-extrabold tracking-[-0.02em] tabular-nums ${toneCls}`}>
        {value}
      </p>
      {meta && (
        <p className="mt-2 font-mono text-[11px] tracking-[0.06em] text-dmg-text-2">{meta}</p>
      )}
    </Panel>
  );
}
