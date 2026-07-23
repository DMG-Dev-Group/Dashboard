export const BRL = (v: number) =>
  Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const fmtK = (v: number) =>
  v >= 1000 ? "R$ " + (v / 1000).toFixed(1).replace(".", ",") + "K" : BRL(v);

export function isoDay(d: Date | string | number): string {
  const x = new Date(d);
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().slice(0, 10);
}

export const mesKey = (iso: string) => iso.slice(0, 7);

export function tempoRelativo(ts: number): string {
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 1) return "agora";
  if (m < 60) return `há ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.round(h / 24)}d`;
}

export function fmtDia(iso: string): string {
  return new Date(iso + "T12:00").toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

export function fmtDataBR(iso: string): string {
  return new Date(iso + "T12:00").toLocaleDateString("pt-BR");
}
