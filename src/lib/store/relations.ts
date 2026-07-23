import type { Cliente, Projeto, Receita } from "./types";

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
