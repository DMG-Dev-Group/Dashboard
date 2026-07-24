import type { Cliente, Projeto, Receita, Todo } from "./types";

/**
 * Progresso do projeto derivado 100% das To-Dos: (feitas / total) * 100.
 * Sem To-Dos = 0%. O cálculo é feito em cima do array atual, então reflete
 * em tempo real qualquer adição/remoção/marcação de tarefa.
 */
export function calcProgresso(todos?: Todo[]): number {
  if (!todos || todos.length === 0) return 0;
  const feitas = todos.filter((t) => t.feito).length;
  return Math.round((feitas / todos.length) * 100);
}

export function progressoDoProjeto(p: Pick<Projeto, "todos">): number {
  return calcProgresso(p.todos);
}

export function clienteDoProjeto(p: Projeto, clientes: Cliente[]): Cliente | null {
  return clientes.find((c) => c.id === p.clienteId) ?? null;
}

export function projetosDoCliente(c: Cliente, projetos: Projeto[]): Projeto[] {
  return projetos.filter((p) => p.clienteId === c.id);
}

export function lancamentosDoProjeto(p: Projeto, receitas: Receita[]): Receita[] {
  return receitas.filter((l) =>
    l.projetoId ? l.projetoId === p.id : l.projeto && l.projeto === p.nome
  );
}
