export function ProgressBar({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-dmg-surface-3">
        <div
          className="h-full rounded-full bg-gradient-to-r from-dmg-red-solid to-dmg-red"
          style={{ width: `${v}%` }}
        />
      </div>
      <span className="w-10 text-right font-mono text-[11px] tabular-nums text-dmg-text-2">
        {v}%
      </span>
    </div>
  );
}
