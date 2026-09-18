import { useState } from "react";
import { useStore } from "@/lib/store/StoreProvider";
import {
  askAssistant,
  type AssistantContext,
  type AssistantMessage,
  type AssistantToolCall,
} from "@/lib/assistant/askAssistant";
import { isoDay } from "@/lib/format";
import { dmgToast } from "@/lib/toast";
import type { ModeloCobranca, ProjectStatus } from "@/lib/store/types";

export interface ChatEntry {
  role: "user" | "assistant";
  content: string;
}

/** Resumo legível da ação proposta, mostrado no card de confirmação —
 * pra dar pro usuário conferir antes de executar de verdade. */
export function resumoAcao(
  call: AssistantToolCall,
  clientes: { id: string; nome: string }[],
): { titulo: string; linhas: string[] } {
  const { nome, args } = call;
  if (nome === "criar_projeto") {
    const cliente = args.clienteId ? clientes.find((c) => c.id === args.clienteId)?.nome : null;
    const linhas = [
      `Nome: ${String(args.nome ?? "—")}`,
      cliente ? `Cliente: ${cliente}` : null,
      args.modeloCobranca ? `Cobrança: ${String(args.modeloCobranca)}` : null,
      args.valor ? `Valor: R$${Number(args.valor).toFixed(2)}` : null,
      args.valorMensal ? `Mensalidade: R$${Number(args.valorMensal).toFixed(2)}` : null,
    ].filter((l): l is string => !!l);
    return { titulo: "Criar projeto", linhas };
  }
  if (nome === "lancar_financeiro") {
    const linhas = [
      `Tipo: ${args.tipo === "saida" ? "saída" : "entrada"}`,
      `Descrição: ${String(args.desc ?? "—")}`,
      `Valor: R$${Number(args.valor ?? 0).toFixed(2)}`,
    ];
    return { titulo: "Lançar no financeiro", linhas };
  }
  return { titulo: nome, linhas: [] };
}

/**
 * Assistente do dashboard: manda a pergunta + um resumo dos dados atuais
 * (eventos, projetos, clientes, financeiro do mês) pro servidor, que chama a
 * Groq. Pergunta informativa volta como texto puro. Pedido de ação (criar
 * projeto, lançar financeiro) volta como uma tool-call PENDENTE — só vira
 * escrita de verdade no Firestore depois que o usuário confirmar aqui no
 * client (mesmo `add()` que os modais normais usam).
 */
export function useAssistant() {
  const { eventos, projetos, clientes, receitas, add, log } = useStore();
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [pending, setPending] = useState<AssistantToolCall | null>(null);
  const [loading, setLoading] = useState(false);

  function buildContexto(): AssistantContext {
    const hoje = isoDay(new Date());
    const eventosProximos = eventos
      .filter((e) => e.data >= hoje)
      .sort((a, b) => a.data.localeCompare(b.data))
      .slice(0, 8)
      .map((e) => ({ titulo: e.titulo, data: e.data, hora: e.hora, tipo: e.tipo }));
    const mesAtual = hoje.slice(0, 7);
    const doMes = receitas.filter((r) => r.data.startsWith(mesAtual));
    const entradas = doMes
      .filter((r) => r.tipo === "entrada")
      .reduce((s, r) => s + Number(r.valor), 0);
    const saidas = doMes.filter((r) => r.tipo === "saida").reduce((s, r) => s + Number(r.valor), 0);
    return {
      hoje,
      eventosProximos,
      projetos: projetos.map((p) => ({
        id: p.id,
        nome: p.nome,
        status: p.status,
        clienteId: p.clienteId,
      })),
      clientes: clientes.map((c) => ({ id: c.id, nome: c.nome })),
      financeiroMes: { entradas, saidas },
    };
  }

  async function send(texto: string) {
    const t = texto.trim();
    if (!t || loading) return;
    const next = [...messages, { role: "user" as const, content: t }];
    setMessages(next);
    setLoading(true);
    try {
      const resp = await askAssistant({
        data: {
          messages: next as AssistantMessage[],
          contexto: buildContexto(),
        },
      });
      if (resp.texto) setMessages((cur) => [...cur, { role: "assistant", content: resp.texto! }]);
      if (resp.toolCall) setPending(resp.toolCall);
    } catch (err) {
      console.error("[assistant]", err);
      setMessages((cur) => [
        ...cur,
        { role: "assistant", content: "Deu erro ao falar com a IA — tenta de novo." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function confirmar() {
    if (!pending) return;
    const { nome, args } = pending;
    try {
      if (nome === "criar_projeto") {
        const projetoNome = String(args.nome ?? "Novo projeto");
        await add("projetos", {
          nome: projetoNome,
          clienteId: args.clienteId ? String(args.clienteId) : undefined,
          status: (args.status as ProjectStatus) ?? "plan",
          progresso: 0,
          modeloCobranca: (args.modeloCobranca as ModeloCobranca) ?? "unico",
          valor: Number(args.valor) || 0,
          valorMensal: Number(args.valorMensal) || 0,
          desc: args.desc ? String(args.desc) : undefined,
        });
        await log(`<b>Projeto</b> — ${projetoNome} criado pelo assistente`, "projeto");
        setMessages((cur) => [
          ...cur,
          { role: "assistant", content: `✓ Projeto "${projetoNome}" criado.` },
        ]);
      } else if (nome === "lancar_financeiro") {
        const tipo = args.tipo === "saida" ? "saida" : "entrada";
        const valor = Number(args.valor) || 0;
        const desc = String(args.desc ?? "Lançamento");
        await add("receitas", {
          desc,
          valor,
          tipo,
          data: isoDay(new Date()),
          projetoId: args.projetoId ? String(args.projetoId) : undefined,
          categoria: args.categoria ? String(args.categoria) : undefined,
          origem: "manual",
        });
        await log(
          `<b>Financeiro</b> — ${tipo === "entrada" ? "entrada" : "saída"} de ${desc} lançada pelo assistente`,
          "financeiro",
        );
        setMessages((cur) => [
          ...cur,
          {
            role: "assistant",
            content: `✓ ${tipo === "entrada" ? "Entrada" : "Saída"} de R$${valor.toFixed(2)} lançada.`,
          },
        ]);
      }
      dmgToast.success("Feito");
    } catch (err) {
      console.error("[assistant] falha ao executar ação confirmada:", err);
      dmgToast.error("Não consegui executar essa ação");
    } finally {
      setPending(null);
    }
  }

  function cancelar() {
    setPending(null);
    setMessages((cur) => [...cur, { role: "assistant", content: "Ação cancelada." }]);
  }

  return { messages, send, loading, pending, confirmar, cancelar };
}
