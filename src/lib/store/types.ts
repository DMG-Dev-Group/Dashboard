export type ProjectStatus = "producao" | "dev" | "plan" | "done";

export interface Todo {
  texto: string;
  feito: boolean;
  criadoEm?: number;
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

export interface Collections {
  projetos: Projeto;
  clientes: Cliente;
  receitas: Receita;
  eventos: Evento;
  atividades: Atividade;
}

export type CollectionName = keyof Collections;
