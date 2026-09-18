import { createServerFn } from "@tanstack/react-start";

export interface AssistantMessage {
  role: "user" | "assistant";
  content: string;
}

/** Os argumentos de uma tool-call vêm de `JSON.parse` — `unknown` não passa
 * na checagem de serializável do createServerFn, então tipamos como JSON. */
export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export interface AssistantContext {
  hoje: string;
  eventosProximos: { titulo: string; data: string; hora?: string; tipo?: string }[];
  projetos: { id: string; nome: string; status: string; clienteId?: string }[];
  clientes: { id: string; nome: string }[];
  financeiroMes: { entradas: number; saidas: number };
}

export type AssistantToolName = "criar_projeto" | "lancar_financeiro";

export interface AssistantToolCall {
  id: string;
  nome: AssistantToolName;
  args: Record<string, Json>;
}

export interface AssistantResponse {
  texto: string | null;
  toolCall: AssistantToolCall | null;
}

// Modelo com tool-calling na Groq — rápido o bastante pra chat, suporta o
// function-calling que as ações de escrita precisam.
const GROQ_MODEL = "llama-3.3-70b-versatile";

const TOOLS = [
  {
    type: "function",
    function: {
      name: "criar_projeto",
      description: "Cria um novo projeto de cliente no dashboard da DMG.",
      parameters: {
        type: "object",
        properties: {
          nome: { type: "string", description: "nome do projeto" },
          clienteId: {
            type: "string",
            description: "id do cliente, se der pra identificar pela lista de clientes do contexto",
          },
          status: { type: "string", enum: ["plan", "dev", "producao", "done"] },
          modeloCobranca: {
            type: "string",
            enum: ["unico", "mensal", "hibrido"],
            description:
              "unico = pagamento único; mensal = assinatura pura; hibrido = entrada + mensalidade",
          },
          valor: { type: "number", description: "valor único, ou valor de entrada se hibrido" },
          valorMensal: { type: "number", description: "mensalidade, se modelo mensal ou hibrido" },
          desc: { type: "string" },
        },
        required: ["nome"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "lancar_financeiro",
      description: "Lança uma entrada (receita) ou saída (gasto) no financeiro.",
      parameters: {
        type: "object",
        properties: {
          tipo: { type: "string", enum: ["entrada", "saida"] },
          desc: { type: "string", description: "descrição do lançamento" },
          valor: { type: "number" },
          projetoId: { type: "string", description: "id do projeto relacionado, se houver" },
          categoria: { type: "string" },
        },
        required: ["tipo", "desc", "valor"],
      },
    },
  },
] as const;

function montaSystemPrompt(ctx: AssistantContext): string {
  return [
    "Você é o assistente do DMG Command Center, o painel interno da DMG (estúdio de desenvolvimento).",
    "Responda sempre em português, direto e curto.",
    `Hoje é ${ctx.hoje}.`,
    "",
    "Dados atuais do painel (só isso — nunca invente dado que não está aqui):",
    `Eventos próximos: ${JSON.stringify(ctx.eventosProximos)}`,
    `Projetos: ${JSON.stringify(ctx.projetos)}`,
    `Clientes: ${JSON.stringify(ctx.clientes)}`,
    `Financeiro do mês atual: entradas R$${ctx.financeiroMes.entradas.toFixed(2)}, saídas R$${ctx.financeiroMes.saidas.toFixed(2)}.`,
    "",
    "Regras:",
    "- Pergunta informativa (eventos, projetos, financeiro) → responda em texto direto, sem tool.",
    "- Pedido pra criar projeto ou lançar entrada/saída → SEMPRE chame a tool correspondente, nunca diga que já fez sem chamar a tool — quem executa de verdade é o painel, depois que o usuário confirmar.",
    "- Se faltar informação essencial pra tool (ex.: valor do lançamento), pergunte antes de chamar a tool.",
  ].join("\n");
}

export const askAssistant = createServerFn({ method: "POST" })
  .validator((data: { messages: AssistantMessage[]; contexto: AssistantContext }) => data)
  .handler(async ({ data }): Promise<AssistantResponse> => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return {
        texto: "Assistente ainda não configurado — falta a GROQ_API_KEY no servidor.",
        toolCall: null,
      };
    }

    let res: Response;
    try {
      res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: "system", content: montaSystemPrompt(data.contexto) },
            ...data.messages,
          ],
          tools: TOOLS,
          tool_choice: "auto",
          temperature: 0.3,
        }),
      });
    } catch (err) {
      console.error("[assistant] falha de rede ao chamar a Groq:", err);
      return {
        texto: "Não consegui me conectar à IA agora — tenta de novo em instantes.",
        toolCall: null,
      };
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("[assistant] Groq respondeu erro:", res.status, errText);
      return {
        texto: "A IA recusou a pergunta (erro no servidor) — tenta de novo em instantes.",
        toolCall: null,
      };
    }

    const json = (await res.json()) as {
      choices?: Array<{
        message?: {
          content?: string | null;
          tool_calls?: Array<{ id: string; function: { name: string; arguments: string } }>;
        };
      }>;
    };
    const msg = json.choices?.[0]?.message;
    const call = msg?.tool_calls?.[0];
    if (call) {
      let args: Record<string, Json> = {};
      try {
        args = JSON.parse(call.function.arguments);
      } catch (err) {
        console.error("[assistant] argumentos de tool malformados:", call.function.arguments, err);
      }
      return {
        texto: msg?.content ?? null,
        toolCall: { id: call.id, nome: call.function.name as AssistantToolName, args },
      };
    }
    return { texto: msg?.content ?? "Não entendi — pode reformular?", toolCall: null };
  });
