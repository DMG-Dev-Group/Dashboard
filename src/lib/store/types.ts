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
  contato?: string;
  desde?: string;
}

export interface Receita {
  id: string;
  desc: string;
  valor: number;
  tipo: "entrada" | "saida";
  data: string; // ISO date
  projeto?: string;
  projetoId?: string;
  origem?: string;
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
