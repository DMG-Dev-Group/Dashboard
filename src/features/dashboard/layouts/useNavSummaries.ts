import { useMemo } from "react";
import { useStore } from "@/lib/store/StoreProvider";
import { BRL, isoDay, mesKey } from "@/lib/format";
import { STATUS } from "@/lib/store/constants";
import type { ViewId } from "./navItems";

export interface NavSummary {
  lines: string[];
}

/**
 * Resumos pro preview ao passar o mouse na sidebar — derivados 100% dos
 * dados que o StoreProvider já mantém em cache (onSnapshot), então passar
 * o mouse não dispara nenhuma consulta nova.
 */
export function useNavSummaries(): Partial<Record<ViewId, NavSummary>> {
  const { projetos, clientes, receitas, eventos, atividades } = useStore();

  return useMemo(() => {
    const hojeISO = isoDay(new Date());
    const k = mesKey(hojeISO);
    const doMes = receitas.filter((l) => mesKey(l.data) === k);
    const entradas = doMes
      .filter((l) => l.tipo === "entrada")
      .reduce((s, l) => s + Number(l.valor), 0);
    const saidas = doMes.filter((l) => l.tipo === "saida").reduce((s, l) => s + Number(l.valor), 0);

    const proximo = eventos
      .filter((ev) => ev.data >= hojeISO)
      .sort((a, b) => (a.data + (a.hora || "")).localeCompare(b.data + (b.hora || "")))[0];

    const ultimosProjetos = projetos.slice(0, 3);

    const ultimaAtividade = atividades[0];

    return {
      financeiro: { lines: [`Saldo do mês: ${BRL(entradas - saidas)}`] },
      calendario: {
        lines: proximo
          ? [
              proximo.titulo,
              new Date(proximo.data + "T12:00").toLocaleDateString("pt-BR", {
                weekday: "short",
                day: "2-digit",
                month: "short",
              }) + (proximo.hora ? ` · ${proximo.hora}` : ""),
            ]
          : ["Nenhum evento futuro"],
      },
      projetos: {
        lines:
          ultimosProjetos.length > 0
            ? ultimosProjetos.map((p) => `${p.nome} · ${STATUS[p.status]?.label ?? p.status}`)
            : ["Nenhum projeto ainda"],
      },
      clientes: {
        lines: [
          `${clientes.length} cliente${clientes.length === 1 ? "" : "s"}`,
          clientes.length > 0 ? `último: ${clientes[clientes.length - 1].nome}` : "",
        ].filter(Boolean),
      },
      atividades: {
        lines: [
          ultimaAtividade
            ? ultimaAtividade.texto.replace(/<[^>]+>/g, "")
            : "Nenhuma atividade ainda",
        ],
      },
    };
  }, [projetos, clientes, receitas, eventos, atividades]);
}
