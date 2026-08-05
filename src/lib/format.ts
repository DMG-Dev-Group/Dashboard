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

const UMA_SEMANA_MS = 7 * 24 * 60 * 60 * 1000;

export function fmtDataHoraCompleta(ts: number): string {
  return new Date(ts).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Texto exibido para uma atividade: relativo ("há 5min") enquanto for recente,
 * e vira data absoluta depois de uma semana — senão fica impossível saber a
 * ordem real de coisas antigas. A data/hora completa sempre fica no tooltip.
 */
export function fmtAtividadeTexto(ts: number): string {
  if (Date.now() - ts > UMA_SEMANA_MS) {
    return new Date(ts).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  return tempoRelativo(ts);
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

/** Idade calculada a partir da data de nascimento (ISO) — nunca guarde a idade pronta, ela envelhece errado. */
export function calcularIdade(nascimentoISO: string): number {
  const nasc = new Date(nascimentoISO + "T12:00");
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const aindaNaoFezAniversario =
    hoje.getMonth() < nasc.getMonth() ||
    (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate());
  if (aindaNaoFezAniversario) idade--;
  return idade;
}
