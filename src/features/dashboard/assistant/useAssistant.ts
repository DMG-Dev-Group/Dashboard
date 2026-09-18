import { useState } from "react";
import { useStore } from "@/lib/store/StoreProvider";
import {
  askAssistant,
  type AssistantContext,
  type AssistantMessage,
  type AssistantToolCall,
  type Json,
} from "@/lib/assistant/askAssistant";
import { isoDay } from "@/lib/format";
import { dmgToast } from "@/lib/toast";
import {
  receitaVeioDoBanco,
  type Cliente,
  type Evento,
  type ModeloCobranca,
  type Projeto,
  type ProjectStatus,
  type Receita,
} from "@/lib/store/types";

export interface ChatEntry {
  role: "user" | "assistant";
  content: string;
}

type Acao = "criar" | "editar" | "excluir";
type Entidade = "projeto" | "evento" | "lancamento" | "cliente";

/** Nome da tool segue `${acao}_${entidade}` — todo o dispatch abaixo é
 * genérico em cima disso, então uma tool nova só precisa seguir a convenção
 * (ver TOOLS em askAssistant.ts) em vez de crescer um switch por tool. */
function parseTool(nome: AssistantToolCall["nome"]): { acao: Acao; entidade: Entidade } {
  const i = nome.indexOf("_");
  return { acao: nome.slice(0, i) as Acao, entidade: nome.slice(i + 1) as Entidade };
}

const COLECAO_POR_ENTIDADE = {
  projeto: "projetos",
  evento: "eventos",
  lancamento: "receitas",
  cliente: "clientes",
} as const;

const ROTULO_ENTIDADE: Record<Entidade, string> = {
  projeto: "Projeto",
  evento: "Evento",
  lancamento: "Lançamento",
  cliente: "Cliente",
};

/** `tipo` do log de atividades — mesma convenção que os modais normais já usam. */
const LOG_TIPO: Record<Entidade, string> = {
  projeto: "projeto",
  evento: "calendario",
  lancamento: "financeiro",
  cliente: "cliente",
};

interface Listas {
  projetos: Pick<Projeto, "id" | "nome">[];
  eventos: Pick<Evento, "id" | "titulo">[];
  clientes: Pick<Cliente, "id" | "nome">[];
  receitas: Pick<Receita, "id" | "desc" | "origem">[];
}

/** Campos que um lançamento sincronizado do banco não aceita editar — mesma
 * trava do LancamentoModal. */
const CAMPOS_TRAVADOS_BANCO = new Set(["valor", "tipo", "data"]);

function nomeRegistro(entidade: Entidade, id: string, listas: Listas): string {
  switch (entidade) {
    case "projeto":
      return listas.projetos.find((p) => p.id === id)?.nome ?? "projeto";
    case "evento":
      return listas.eventos.find((e) => e.id === id)?.titulo ?? "evento";
    case "lancamento":
      return listas.receitas.find((r) => r.id === id)?.desc ?? "lançamento";
    case "cliente":
      return listas.clientes.find((c) => c.id === id)?.nome ?? "cliente";
  }
}

const CAMPO_LABEL: Record<string, string> = {
  nome: "Nome",
  status: "Status",
  clienteId: "Cliente",
  modeloCobranca: "Cobrança",
  valor: "Valor",
  valorMensal: "Mensalidade",
  desc: "Descrição",
  titulo: "Título",
  data: "Data",
  hora: "Hora",
  tipo: "Tipo",
  categoria: "Categoria",
  projetoId: "Projeto",
  celular: "Celular",
  email: "E-mail",
  instagram: "Instagram",
  empresa: "Empresa",
  nascimento: "Nascimento",
};

function formataValorCampo(campo: string, valor: Json, listas: Listas): string {
  if (campo === "clienteId")
    return listas.clientes.find((c) => c.id === valor)?.nome ?? String(valor);
  if (campo === "projetoId")
    return listas.projetos.find((p) => p.id === valor)?.nome ?? String(valor);
  if (campo === "valor" || campo === "valorMensal") return `R$${Number(valor).toFixed(2)}`;
  if (campo === "tipo" && valor === "saida") return "saída";
  return String(valor);
}

/** Resumo legível da ação proposta, mostrado no card de confirmação — pra
 * dar pro usuário conferir antes de executar de verdade. */
export function resumoAcao(
  call: AssistantToolCall,
  listas: Listas,
): { titulo: string; linhas: string[] } {
  const { acao, entidade } = parseTool(call.nome);
  const rotulo = ROTULO_ENTIDADE[entidade].toLowerCase();
  const args = call.args;

  if (acao === "excluir") {
    const label = nomeRegistro(entidade, String(args.id ?? ""), listas);
    return {
      titulo: `Excluir ${rotulo}`,
      linhas: [`"${label}" — essa ação não pode ser desfeita.`],
    };
  }

  // Lançamento sincronizado do banco só aceita editar desc/projetoId/categoria
  // (mesma trava do LancamentoModal) — não mostra no preview um campo que na
  // prática vai ser ignorado na hora de confirmar.
  const receitaAtual =
    acao === "editar" && entidade === "lancamento"
      ? listas.receitas.find((r) => r.id === args.id)
      : undefined;
  const travado = !!receitaAtual && receitaVeioDoBanco(receitaAtual);

  const linhas = Object.entries(args)
    .filter(
      ([campo, valor]) =>
        campo !== "id" &&
        valor !== undefined &&
        valor !== null &&
        valor !== "" &&
        !(travado && CAMPOS_TRAVADOS_BANCO.has(campo)),
    )
    .map(
      ([campo, valor]) =>
        `${CAMPO_LABEL[campo] ?? campo}: ${formataValorCampo(campo, valor, listas)}`,
    );

  if (travado) {
    linhas.push("(sincronizado do banco — valor/tipo/data não são editáveis)");
  }

  if (acao === "editar") {
    const label = nomeRegistro(entidade, String(args.id ?? ""), listas);
    return { titulo: `Editar ${rotulo} — ${label}`, linhas };
  }
  return { titulo: `Criar ${rotulo}`, linhas };
}

function payloadCriar(
  entidade: Entidade,
  args: Record<string, Json>,
): { payload: object; label: string } {
  switch (entidade) {
    case "projeto": {
      const nome = String(args.nome ?? "Novo projeto");
      return {
        label: nome,
        payload: {
          nome,
          clienteId: args.clienteId ? String(args.clienteId) : undefined,
          status: (args.status as ProjectStatus) ?? "plan",
          progresso: 0,
          modeloCobranca: (args.modeloCobranca as ModeloCobranca) ?? "unico",
          valor: Number(args.valor) || 0,
          valorMensal: Number(args.valorMensal) || 0,
          desc: args.desc ? String(args.desc) : undefined,
        },
      };
    }
    case "evento": {
      const titulo = String(args.titulo ?? "Novo evento");
      return {
        label: titulo,
        payload: {
          titulo,
          data: args.data ? String(args.data) : isoDay(new Date()),
          hora: args.hora ? String(args.hora) : undefined,
          tipo: (args.tipo as Evento["tipo"]) ?? "reuniao",
        },
      };
    }
    case "lancamento": {
      const desc = String(args.desc ?? "Lançamento");
      return {
        label: desc,
        payload: {
          desc,
          valor: Number(args.valor) || 0,
          tipo: args.tipo === "saida" ? "saida" : "entrada",
          data: isoDay(new Date()),
          projetoId: args.projetoId ? String(args.projetoId) : undefined,
          categoria: args.categoria ? String(args.categoria) : undefined,
          origem: "manual",
        },
      };
    }
    case "cliente": {
      const nome = String(args.nome ?? "Novo cliente");
      return {
        label: nome,
        payload: {
          nome,
          celular: args.celular ? String(args.celular) : undefined,
          email: args.email ? String(args.email) : undefined,
          instagram: args.instagram ? String(args.instagram) : undefined,
          empresa: args.empresa ? String(args.empresa) : undefined,
          nascimento: args.nascimento ? String(args.nascimento) : undefined,
        },
      };
    }
  }
}

/** Monta o patch de uma edição a partir só dos campos que vieram na
 * tool-call (a IA já foi instruída a só incluir o que mudou). Lançamento
 * sincronizado do banco só aceita desc/projetoId/categoria — mesma trava do
 * LancamentoModal — então filtra o resto se for o caso. */
function payloadEditar(entidade: Entidade, args: Record<string, Json>, receitaAtual?: Receita) {
  const { id: _omit, ...rest } = args;
  const patch: Record<string, unknown> = {};
  for (const [campo, valor] of Object.entries(rest)) {
    if (valor === undefined || valor === null || valor === "") continue;
    patch[campo] = campo === "valor" || campo === "valorMensal" ? Number(valor) : String(valor);
  }
  if (entidade === "lancamento" && receitaAtual && receitaVeioDoBanco(receitaAtual)) {
    delete patch.valor;
    delete patch.tipo;
    delete patch.data;
  }
  return patch;
}

/**
 * Assistente do dashboard: manda a pergunta + um resumo dos dados atuais
 * (eventos, projetos, clientes, lançamentos recentes, financeiro do mês)
 * pro servidor, que chama a Groq. Pergunta informativa volta como texto
 * puro. Pedido de ação (criar/editar/excluir projeto, evento, lançamento ou
 * cliente) volta como uma tool-call PENDENTE — só vira escrita de verdade no
 * Firestore depois que o usuário confirmar aqui no client (mesmo
 * add/update/remove que os modais normais usam).
 */
export function useAssistant() {
  const { eventos, projetos, clientes, receitas, add, update, remove, log } = useStore();
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [pending, setPending] = useState<AssistantToolCall | null>(null);
  const [loading, setLoading] = useState(false);

  function buildContexto(): AssistantContext {
    const hoje = isoDay(new Date());
    const eventosProximos = eventos
      .filter((e) => e.data >= hoje)
      .sort((a, b) => a.data.localeCompare(b.data))
      .slice(0, 8)
      .map((e) => ({ id: e.id, titulo: e.titulo, data: e.data, hora: e.hora, tipo: e.tipo }));
    const mesAtual = hoje.slice(0, 7);
    const doMes = receitas.filter((r) => r.data.startsWith(mesAtual));
    const entradas = doMes
      .filter((r) => r.tipo === "entrada")
      .reduce((s, r) => s + Number(r.valor), 0);
    const saidas = doMes.filter((r) => r.tipo === "saida").reduce((s, r) => s + Number(r.valor), 0);
    const lancamentosRecentes = receitas
      .slice()
      .sort((a, b) => b.data.localeCompare(a.data))
      .slice(0, 15)
      .map((r) => ({
        id: r.id,
        desc: r.desc,
        valor: r.valor,
        tipo: r.tipo,
        data: r.data,
        projetoId: r.projetoId,
        origem: r.origem,
      }));
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
      lancamentosRecentes,
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
    const { acao, entidade } = parseTool(pending.nome);
    const args = pending.args;
    const colecao = COLECAO_POR_ENTIDADE[entidade];
    const listas = { projetos, eventos, clientes, receitas };
    try {
      if (acao === "criar") {
        const { payload, label } = payloadCriar(entidade, args);
        await add(colecao, payload as never);
        await log(
          `<b>${ROTULO_ENTIDADE[entidade]}</b> — ${label} criado(a) pelo assistente`,
          LOG_TIPO[entidade],
        );
        setMessages((cur) => [
          ...cur,
          { role: "assistant", content: `✓ ${ROTULO_ENTIDADE[entidade]} "${label}" criado(a).` },
        ]);
      } else if (acao === "editar") {
        const id = String(args.id ?? "");
        const receitaAtual =
          entidade === "lancamento" ? receitas.find((r) => r.id === id) : undefined;
        const patch = payloadEditar(entidade, args, receitaAtual);
        const label = nomeRegistro(entidade, id, listas);
        if (Object.keys(patch).length === 0) {
          // Só sobrou campo travado (ex.: valor de lançamento do banco) —
          // nada foi de fato alterado, não finge que deu certo.
          setMessages((cur) => [
            ...cur,
            {
              role: "assistant",
              content: `Não deu pra editar "${label}" — os campos pedidos não são editáveis nesse registro.`,
            },
          ]);
          return;
        }
        await update(colecao, id, patch as never);
        await log(
          `<b>${ROTULO_ENTIDADE[entidade]}</b> — ${label} atualizado(a) pelo assistente`,
          LOG_TIPO[entidade],
        );
        setMessages((cur) => [
          ...cur,
          {
            role: "assistant",
            content: `✓ ${ROTULO_ENTIDADE[entidade]} "${label}" atualizado(a).`,
          },
        ]);
      } else {
        const id = String(args.id ?? "");
        const label = nomeRegistro(entidade, id, listas);
        await remove(colecao, id);
        await log(
          `<b>${ROTULO_ENTIDADE[entidade]}</b> — ${label} excluído(a) pelo assistente`,
          LOG_TIPO[entidade],
        );
        setMessages((cur) => [
          ...cur,
          { role: "assistant", content: `✓ ${ROTULO_ENTIDADE[entidade]} "${label}" excluído(a).` },
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
