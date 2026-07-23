import { useMemo, useRef, useState } from "react";

interface ChartProps {
  labels: string[];
  serie: number[];
  formatValue: (v: number, label: string) => string;
  height?: number;
}

/**
 * Reprodução do gráfico do painel original: curva Catmull-Rom → Bézier,
 * grid pontilhado, tooltip no hover. Sem libs externas.
 */
export function RevenueChart({ labels, serie, formatValue, height = 260 }: ChartProps) {
  const W = 800;
  const H = height;
  const PAD = 30;
  const svgRef = useRef<SVGSVGElement>(null);
  const [tip, setTip] = useState<{ x: number; y: number; label: string; value: string } | null>(null);

  const { curva, area, pts, stepX } = useMemo(() => {
    const max = Math.max(...serie, 1) * 1.15;
    const step = (W - PAD * 2) / Math.max(1, serie.length - 1);
    const x = (i: number) => PAD + i * step;
    const y = (v: number) => H - PAD - (v / max) * (H - PAD * 2);
    const pts = serie.map((v, i) => ({ x: x(i), y: y(v) }));

    let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const c1x = p1.x + (p2.x - p0.x) / 6;
      const c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6;
      const c2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }
    const areaPath = d + ` L${pts[pts.length - 1].x.toFixed(1)},${H - PAD} L${pts[0].x.toFixed(1)},${H - PAD} Z`;
    return { curva: d, area: areaPath, pts, stepX: step };
  }, [serie, H]);

  const passo = Math.max(1, Math.ceil(labels.length / 10));

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const r = svgRef.current.getBoundingClientRect();
    const fx = ((e.clientX - r.left) / r.width) * W;
    const i = Math.max(0, Math.min(serie.length - 1, Math.round((fx - PAD) / stepX)));
    setTip({
      x: (pts[i].x / W) * r.width,
      y: (pts[i].y / H) * r.height,
      label: labels[i],
      value: formatValue(serie[i], labels[i]),
    });
  };

  return (
    <div className="relative w-full" style={{ height }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-full w-full"
        onMouseMove={onMove}
        onMouseLeave={() => setTip(null)}
      >
        <defs>
          <linearGradient id="dmg-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.05" stopColor="#C0181A" stopOpacity="0.72" />
            <stop offset="0.95" stopColor="#C0181A" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="dmg-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#C0181A" />
            <stop offset="1" stopColor="#ff4d4f" />
          </linearGradient>
        </defs>

        {[0, 1, 2, 3, 4].map((g) => {
          const gy = PAD + (g * (H - PAD * 2)) / 4;
          return (
            <line
              key={g}
              x1={PAD}
              y1={gy}
              x2={W - PAD}
              y2={gy}
              stroke="rgba(255,255,255,0.08)"
              strokeDasharray="4 8"
            />
          );
        })}
        {labels.map((l, i) => {
          if (i % passo !== 0) return null;
          return (
            <text
              key={i}
              x={pts[i].x}
              y={H - 8}
              fill="rgba(255,255,255,.42)"
              fontSize={11}
              fontFamily="Geist Mono, ui-monospace, monospace"
              textAnchor="middle"
            >
              {l}
            </text>
          );
        })}

        <path d={area} fill="url(#dmg-fill)" />
        <path
          d={curva}
          fill="none"
          stroke="url(#dmg-line)"
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {tip && (
          <>
            <line
              x1={pts[Math.max(0, Math.min(serie.length - 1, Math.round(tip.x / (svgRef.current!.getBoundingClientRect().width / W)) - 0))].x}
              x2={pts[Math.max(0, Math.min(serie.length - 1, Math.round(tip.x / (svgRef.current!.getBoundingClientRect().width / W)) - 0))].x}
              y1={PAD}
              y2={H - PAD}
              stroke="rgba(192,24,26,.45)"
              strokeWidth={1}
            />
          </>
        )}
      </svg>

      {tip && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded border border-dmg-border bg-dmg-surface-2 px-3 py-2 text-xs shadow-lg backdrop-blur-sm"
          style={{ left: Math.min(Math.max(tip.x, 64), 700), top: Math.max(tip.y - 8, 40) }}
        >
          <b className="mb-0.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-dmg-text-3">
            {tip.label}
          </b>
          <span className="font-bold text-dmg-text">{tip.value}</span>
        </div>
      )}
    </div>
  );
}
