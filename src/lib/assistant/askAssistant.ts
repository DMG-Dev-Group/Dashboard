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
  eventosProximos: { id: string; titulo: string; data: string; hora?: string; tipo?: string }[];
  projetos: { id: string; nome: string; status: string; clienteId?: string }[];
  /** Só os projetos pessoais do usuário logado — são privados por natureza. */
  projetosPessoais: { id: string; nome: string; status: string }[];
  clientes: { id: string; nome: string }[];
  /** Últimos lançamentos (não só o mês atual) — precisa ter id pra editar/excluir um específico. */
  lancamentosRecentes: {
    id: string;
    desc: string;
    valor: number;
    tipo: string;
    data: string;
    projetoId?: string;
    origem?: string;
  }[];
  financeiroMes: { entradas: number; saidas: number };
  /** Leads vêm do site — só dá pra excluir/marcar como lido/converter, nunca criar ou editar campo. */
  leadsRecentes: { id: string; nome: string; categoria: string; lida: boolean }[];
  /** Texto atual dos dois quadros de notas — pra o Trevor conseguir ler, não só escrever. */
  notaEquipe: string;
  notaPessoal: string;
}

/**
 * Convenção de nome: `${acao}_${entidade}`, acao em "criar"|"editar"|"excluir",
 * entidade em "projeto"|"evento"|"lancamento"|"cliente" — o client (useAssistant.ts)
 * faz o dispatch genérico a partir desse padrão, então uma tool nova só precisa
 * seguir a convenção aqui.
 */
export type AssistantToolName =
  | "criar_projeto"
  | "editar_projeto"
  | "excluir_projeto"
  | "criar_projeto_pessoal"
  | "editar_projeto_pessoal"
  | "excluir_projeto_pessoal"
  | "criar_evento"
  | "editar_evento"
  | "excluir_evento"
  | "criar_lancamento"
  | "editar_lancamento"
  | "excluir_lancamento"
  | "criar_cliente"
  | "editar_cliente"
  | "excluir_cliente"
  | "adicionar_nota"
  | "excluir_lead"
  | "marcar_lead_lida"
  | "converter_lead";

export interface AssistantToolCall {
  id: string;
  nome: AssistantToolName;
  args: Record<string, Json>;
}

export interface AssistantResponse {
  texto: string | null;
  toolCall: AssistantToolCall | null;
}

// Modelo com tool-calling na Groq. Configurável por env var porque a Groq
// descontinua modelo com alguma frequência — trocar o GROQ_MODEL na Vercel
// resolve sem precisar de deploy de código.
//
// IMPORTANTE: nem todo modelo da Groq aceita a tool customizada que a gente
// manda aqui ("local tool calling"). Os sistemas "groq/compound*" só aceitam
// as ferramentas embutidas deles (busca web etc.) e recusam a nossa com 400.
// Confirmado na doc oficial (https://console.groq.com/docs/tool-use/built-in-tools)
// que openai/gpt-oss-120b e openai/gpt-oss-20b aceitam local tool calling —
// por isso o fallback abaixo. Se trocar, confira essa compatibilidade, não só
// se o modelo existe.
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

const idField = (desc: string) => ({ type: "string", description: desc }) as const;

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
          clienteId: idField(
            "id do cliente, se der pra identificar pela lista de clientes do contexto",
          ),
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
      name: "editar_projeto",
      description:
        "Muda um ou mais campos de um projeto já existente. Inclua só os campos que o usuário pediu pra mudar.",
      parameters: {
        type: "object",
        properties: {
          id: idField("id do projeto, da lista de projetos do contexto"),
          nome: { type: "string" },
          clienteId: idField("id do cliente"),
          status: { type: "string", enum: ["plan", "dev", "producao", "done"] },
          modeloCobranca: { type: "string", enum: ["unico", "mensal", "hibrido"] },
          valor: { type: "number" },
          valorMensal: { type: "number" },
          desc: { type: "string" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "excluir_projeto",
      description: "Exclui um projeto permanentemente. Ação irreversível.",
      parameters: {
        type: "object",
        properties: { id: idField("id do projeto, da lista de projetos do contexto") },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "criar_projeto_pessoal",
      description:
        "Cria um projeto pessoal do usuário atual — iniciativa própria, privada, sem cliente/valor/responsável (não é projeto de cliente).",
      parameters: {
        type: "object",
        properties: {
          nome: { type: "string" },
          status: { type: "string", enum: ["plan", "dev", "producao", "done"] },
          stack: { type: "string" },
          repo: { type: "string" },
          url: { type: "string" },
          desc: { type: "string" },
        },
        required: ["nome"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "editar_projeto_pessoal",
      description:
        "Muda um ou mais campos de um projeto pessoal já existente. Inclua só os campos que o usuário pediu pra mudar.",
      parameters: {
        type: "object",
        properties: {
          id: idField("id do projeto pessoal, da lista de projetos pessoais do contexto"),
          nome: { type: "string" },
          status: { type: "string", enum: ["plan", "dev", "producao", "done"] },
          stack: { type: "string" },
          repo: { type: "string" },
          url: { type: "string" },
          desc: { type: "string" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "excluir_projeto_pessoal",
      description: "Exclui um projeto pessoal permanentemente. Ação irreversível.",
      parameters: {
        type: "object",
        properties: {
          id: idField("id do projeto pessoal, da lista de projetos pessoais do contexto"),
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "criar_evento",
      description: "Cria um evento no calendário (reunião, entrega, deadline...).",
      parameters: {
        type: "object",
        properties: {
          titulo: { type: "string" },
          data: {
            type: "string",
            description:
              "data ISO (AAAA-MM-DD) — calcule a partir de 'hoje' do contexto pra termos relativos tipo amanhã/semana que vem",
          },
          hora: { type: "string", description: "HH:MM, se mencionado" },
          tipo: { type: "string", enum: ["reuniao", "entrega", "deadline", "outro"] },
        },
        required: ["titulo", "data"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "editar_evento",
      description:
        "Muda um ou mais campos de um evento já existente. Inclua só os campos que o usuário pediu pra mudar.",
      parameters: {
        type: "object",
        properties: {
          id: idField("id do evento, da lista de eventos próximos do contexto"),
          titulo: { type: "string" },
          data: { type: "string", description: "data ISO (AAAA-MM-DD)" },
          hora: { type: "string" },
          tipo: { type: "string", enum: ["reuniao", "entrega", "deadline", "outro"] },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "excluir_evento",
      description: "Exclui um evento permanentemente. Ação irreversível.",
      parameters: {
        type: "object",
        properties: { id: idField("id do evento, da lista de eventos próximos do contexto") },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "criar_lancamento",
      description: "Lança uma entrada (receita) ou saída (gasto) no financeiro.",
      parameters: {
        type: "object",
        properties: {
          tipo: { type: "string", enum: ["entrada", "saida"] },
          desc: { type: "string", description: "descrição do lançamento" },
          valor: { type: "number" },
          projetoId: idField("id do projeto relacionado, se houver"),
          categoria: { type: "string" },
        },
        required: ["tipo", "desc", "valor"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "editar_lancamento",
      description:
        "Muda um ou mais campos de um lançamento já existente. Inclua só os campos que o usuário pediu pra mudar. Lançamento sincronizado do banco (origem != manual) só aceita mudar desc/projetoId/categoria — avise o usuário se ele pedir pra mudar valor/tipo/data desse tipo de lançamento.",
      parameters: {
        type: "object",
        properties: {
          id: idField("id do lançamento, da lista de lançamentos recentes do contexto"),
          desc: { type: "string" },
          valor: { type: "number" },
          tipo: { type: "string", enum: ["entrada", "saida"] },
          data: { type: "string", description: "data ISO (AAAA-MM-DD)" },
          projetoId: idField("id do projeto relacionado"),
          categoria: { type: "string" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "excluir_lancamento",
      description: "Exclui um lançamento financeiro permanentemente. Ação irreversível.",
      parameters: {
        type: "object",
        properties: {
          id: idField("id do lançamento, da lista de lançamentos recentes do contexto"),
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "criar_cliente",
      description: "Cadastra um novo cliente.",
      parameters: {
        type: "object",
        properties: {
          nome: { type: "string" },
          celular: { type: "string" },
          email: { type: "string" },
          instagram: { type: "string" },
          empresa: { type: "string" },
          nascimento: { type: "string", description: "data ISO (AAAA-MM-DD)" },
        },
        required: ["nome"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "editar_cliente",
      description:
        "Muda um ou mais campos de um cliente já existente. Inclua só os campos que o usuário pediu pra mudar.",
      parameters: {
        type: "object",
        properties: {
          id: idField("id do cliente, da lista de clientes do contexto"),
          nome: { type: "string" },
          celular: { type: "string" },
          email: { type: "string" },
          instagram: { type: "string" },
          empresa: { type: "string" },
          nascimento: { type: "string" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "excluir_cliente",
      description: "Exclui um cliente permanentemente. Ação irreversível.",
      parameters: {
        type: "object",
        properties: { id: idField("id do cliente, da lista de clientes do contexto") },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "adicionar_nota",
      description:
        "Acrescenta um texto ao quadro de notas (equipe ou pessoal). Só adiciona ao final do que já existe — não apaga nem reescreve o que já está lá.",
      parameters: {
        type: "object",
        properties: {
          quadro: {
            type: "string",
            enum: ["equipe", "pessoal"],
            description:
              "equipe = quadro compartilhado com todo mundo; pessoal = só do usuário atual",
          },
          texto: { type: "string", description: "texto a acrescentar" },
        },
        required: ["quadro", "texto"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "excluir_lead",
      description: "Exclui um lead (contato vindo do site) permanentemente. Ação irreversível.",
      parameters: {
        type: "object",
        properties: { id: idField("id do lead, da lista de leads recentes do contexto") },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "marcar_lead_lida",
      description: "Marca um lead como lido/visto.",
      parameters: {
        type: "object",
        properties: { id: idField("id do lead, da lista de leads recentes do contexto") },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "converter_lead",
      description:
        "Converte um lead em cliente + projeto — cria um cliente novo a partir dos dados do lead e um projeto vinculado a ele (mesma ação do botão 'adicionar aos projetos' na tela de leads).",
      parameters: {
        type: "object",
        properties: { id: idField("id do lead, da lista de leads recentes do contexto") },
        required: ["id"],
      },
    },
  },
] as const;

function montaSystemPrompt(ctx: AssistantContext): string {
  return [
    "Você é o Trevor, o assistente do DMG Command Center — o painel interno da DMG (estúdio de desenvolvimento). Tom direto, sem enrolação, com uma pontinha de atitude, mas sempre útil e preciso.",
    "Responda sempre em português, direto e curto.",
    `Hoje é ${ctx.hoje}.`,
    "",
    "Dados atuais do painel (só isso — nunca invente dado que não está aqui, e nunca invente um id):",
    `Eventos próximos: ${JSON.stringify(ctx.eventosProximos)}`,
    `Projetos: ${JSON.stringify(ctx.projetos)}`,
    `Projetos pessoais (privados do usuário atual): ${JSON.stringify(ctx.projetosPessoais)}`,
    `Clientes: ${JSON.stringify(ctx.clientes)}`,
    `Lançamentos recentes: ${JSON.stringify(ctx.lancamentosRecentes)}`,
    `Financeiro do mês atual: entradas R$${ctx.financeiroMes.entradas.toFixed(2)}, saídas R$${ctx.financeiroMes.saidas.toFixed(2)}.`,
    `Leads recentes (contatos vindos do site): ${JSON.stringify(ctx.leadsRecentes)}`,
    `Nota da equipe (quadro compartilhado): ${JSON.stringify(ctx.notaEquipe)}`,
    `Nota pessoal (só do usuário atual): ${JSON.stringify(ctx.notaPessoal)}`,
    "",
    "Regras:",
    "- Pergunta informativa (eventos, projetos, financeiro, notas, leads) → responda em texto direto, sem tool.",
    "- Pedido de criar/editar/excluir algo → SEMPRE chame a tool correspondente, nunca diga que já fez sem chamar a tool — quem executa de verdade é o painel, depois que o usuário confirmar.",
    "- Editar: inclua só os campos que o usuário pediu pra mudar, não repita os que continuam iguais.",
    "- Excluir: é uma ação permanente — deixe isso claro na sua resposta em texto antes/durante a chamada da tool.",
    "- Pra identificar QUAL registro editar/excluir, use só os ids que aparecem no contexto acima (por nome/título/descrição batendo) — nunca invente um id. Se não tiver certeza de qual registro é, pergunte antes de chamar a tool.",
    "- Se faltar informação essencial pra tool (ex.: valor do lançamento), pergunte antes de chamar a tool.",
    "- Lead vem do site — nunca crie ou edite campo de lead. Só dá pra excluir_lead, marcar_lead_lida ou converter_lead (vira cliente + projeto).",
    "- Nota (adicionar_nota) é só de acrescentar — nunca apague ou reescreva o texto existente, e nunca invente o texto atual, use o que está no contexto.",
    "- Projeto pessoal é diferente de projeto de cliente: não tem cliente, valor nem responsável. Não confunda as tools de projeto com as de projeto_pessoal.",
  ].join("\n");
}

export const askAssistant = createServerFn({ method: "POST" })
  .validator((data: { messages: AssistantMessage[]; contexto: AssistantContext }) => data)
  .handler(async ({ data }): Promise<AssistantResponse> => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return {
        texto: "Trevor ainda não está configurado — falta a GROQ_API_KEY no servidor.",
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
        texto: "Não consegui falar com o Trevor agora — tenta de novo em instantes.",
        toolCall: null,
      };
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("[assistant] Groq respondeu erro:", res.status, errText);
      // Mostra o motivo real (mensagem da Groq, sem a key) no próprio chat —
      // sem isso, o único jeito de saber por que falhou seria olhar o log do
      // servidor, que quem estiver testando pode não ter acesso.
      let motivo = errText;
      try {
        const parsed = JSON.parse(errText) as { error?: { message?: string } };
        if (parsed.error?.message) motivo = parsed.error.message;
      } catch {
        // corpo não era JSON — usa o texto cru mesmo
      }
      return {
        texto: `Trevor recusou a pergunta (erro ${res.status}): ${motivo || "sem detalhe"}`,
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
