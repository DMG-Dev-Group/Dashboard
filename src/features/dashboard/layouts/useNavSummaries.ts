import { useMemo } from "react";
import { useStore } from "@/lib/store/StoreProvider";
import { BRL, isoDay, mesKey } from "@/lib/format";
import { STATUS } from "@/lib/store/constants";
import type { ViewId } from "./navItems";

export interface NavSummary {
  lines: string[];
}

/** string segura pra evitar `.replace`/`.slice` em campo ausente/malformado (dado legado, por exemplo). */
function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

/**
 * Resumos pro preview ao passar o mouse na sidebar — derivados 100% dos
 * dados que o StoreProvider já mantém em cache (onSnapshot), então passar
 * o mouse não dispara nenhuma consulta nova.
 *
 * Roda em toda página autenticada (a sidebar monta em todas), então
 * precisa tolerar documentos com campos ausentes/malformados sem derrubar
 * o app inteiro — o pior caso aceitável aqui é o preview vir vazio, nunca
 * uma tela quebrada. O try/catch é o cinto de segurança final.
 */
export function useNavSummaries(): Partial<Record<ViewId, NavSummary>> {
  const { projetos, clientes, receitas, eventos, atividades } = useStore();

  return useMemo(() => {
    try {
      const hojeISO = isoDay(new Date());
      const k = mesKey(hojeISO);
      const doMes = receitas.filter((l) => str(l.data).slice(0, 7) === k);
      const entradas = doMes
        .filter((l) => l.tipo === "entrada")
        .reduce((s, l) => s + Number(l.valor || 0), 0);
      const saidas = doMes
        .filter((l) => l.tipo === "saida")
        .reduce((s, l) => s + Number(l.valor || 0), 0);

      const proximo = eventos
        .filter((ev) => str(ev.data) >= hojeISO)
        .sort((a, b) => (str(a.data) + str(a.hora)).localeCompare(str(b.data) + str(b.hora)))[0];

      const ultimosProjetos = projetos.slice(0, 3);

      const ultimaAtividade = atividades[0];

      return {
        financeiro: { lines: [`Saldo do mês: ${BRL(entradas - saidas)}`] },
        calendario: {
          lines: proximo
            ? [
                str(proximo.titulo) || "Evento",
                new Date(str(proximo.data) + "T12:00").toLocaleDateString("pt-BR", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                }) + (proximo.hora ? ` · ${str(proximo.hora)}` : ""),
              ]
            : ["Nenhum evento futuro"],
        },
        projetos: {
          lines:
            ultimosProjetos.length > 0
              ? ultimosProjetos.map(
                  (p) =>
                    `${str(p.nome) || "Sem nome"} · ${STATUS[p.status]?.label ?? p.status ?? "—"}`,
                )
              : ["Nenhum projeto ainda"],
        },
        clientes: {
          lines: [
            `${clientes.length} cliente${clientes.length === 1 ? "" : "s"}`,
            clientes.length > 0 ? `último: ${str(clientes[clientes.length - 1]?.nome) || "—"}` : "",
          ].filter(Boolean),
        },
        atividades: {
          lines: [
            ultimaAtividade
              ? str(ultimaAtividade.texto).replace(/<[^>]+>/g, "") || "—"
              : "Nenhuma atividade ainda",
          ],
        },
      };
    } catch (err) {
      console.error("[useNavSummaries] resumo falhou, preview fica vazio:", err);
      return {};
    }
  }, [projetos, clientes, receitas, eventos, atividades]);
}
