export type ProjectStatus = "producao" | "dev" | "plan" | "done";

export type Prioridade = "urgente" | "alta" | "media" | "baixa";

export const PRIORIDADES: Record<Prioridade, { label: string; cls: string; bar: string }> = {
  urgente: { label: "Urgente", cls: "text-red-400", bar: "bg-red-500" },
  alta: { label: "Alta", cls: "text-amber-400", bar: "bg-amber-500" },
  media: { label: "Média", cls: "text-sky-400", bar: "bg-sky-500" },
  baixa: { label: "Baixa", cls: "text-dmg-text-3", bar: "bg-dmg-text-3" },
};

export interface Todo {
  texto: string;
  feito: boolean;
  criadoEm?: number;
  prioridade?: Prioridade;
  /** data URL (imagem comprimida) — anexo mostrado abaixo do título da tarefa */
  imagem?: string;
}

export interface Projeto {
  id: string;
  nome: string;
  tipo?: string;
  clienteId?: string;
  resp?: string;
  status: ProjectStatus;
  progresso: number;
  valor?: number;
  stack?: string;
  repo?: string;
  url?: string;
  desc?: string;
  notas?: string;
  todos?: Todo[];
}

export interface Cliente {
  id: string;
  nome: string;
  nomeCompleto?: string;
  /** @deprecated legado — clientes antigos podem ter só isso, sem celular/email separados */
  contato?: string;
  celular?: string;
  email?: string;
  instagram?: string;
  /** ISO date — guarda a data de nascimento, não a idade (senão o dado envelhece errado) */
  nascimento?: string;
  empresa?: string;
  desde?: string;
}

/**
 * "manual" = digitado no painel. Qualquer outro valor (ex.: "banco", vindo da
 * sincronização Pluggy) é tratado como vindo do banco. Lançamentos antigos
 * sem `origem` são tratados como manuais (era o único jeito de lançar antes
 * da integração bancária existir).
 */
export type ReceitaOrigem = "manual" | "banco" | (string & {});

export interface Receita {
  id: string;
  desc: string;
  valor: number;
  tipo: "entrada" | "saida";
  data: string; // ISO date
  projeto?: string;
  projetoId?: string;
  categoria?: string;
  origem?: ReceitaOrigem;
}

export function receitaVeioDoBanco(r: Pick<Receita, "origem">): boolean {
  return !!r.origem && r.origem !== "manual";
}

export interface Evento {
  id: string;
  titulo: string;
  data: string;
  hora?: string;
  tipo?: "reuniao" | "entrega" | "deadline" | "outro";
}

export interface Atividade {
  id: string;
  texto: string;
  tipo?: string;
  ts: number;
}

export type LeadModalidade = "compra" | "aluguel";

export interface LeadItem {
  descricao: string;
  valor: number;
}

/**
 * Um pedido de orçamento vindo do configurador do site (damage.group).
 * Gravado pelo Route Handler do site — repo `DMG` — via Firebase Admin, não
 * pelo painel. Não tem `add`/`update` daqui: é read-only por natureza, então
 * não precisa de modal de criação/edição como Cliente ou Projeto.
 */
export interface Lead {
  id: string;
  nome: string;
  whatsapp: string;
  email: string;
  empresa?: string | null;
  categoria: string;
  item?: string | null;
  modalidade: LeadModalidade;
  /** Só preenchido quando modalidade é "aluguel". */
  planoRecorrente?: string | null;
  subtotal?: number | null;
  total?: number | null;
  /** true pros itens "sob orçamento" (ex.: robôs) — total/subtotal ficam nulos nesse caso. */
  sobOrcamento: boolean;
  comentario?: string | null;
  modulos?: LeadItem[];
  multiplicadores?: LeadItem[];
  criadoEm: number;
  /** true = escondido do sino de notificações (não apaga o lead nem o card da tela Leads). */
  lida?: boolean;
}

export interface Collections {
  projetos: Projeto;
  clientes: Cliente;
  receitas: Receita;
  eventos: Evento;
  atividades: Atividade;
  leads: Lead;
}

export type CollectionName = keyof Collections;
