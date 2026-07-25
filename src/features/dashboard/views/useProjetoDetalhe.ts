import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useStore } from "@/lib/store/StoreProvider";
import { calcProgresso, clienteDoProjeto, lancamentosDoProjeto } from "@/lib/store/relations";

export interface RepoInfo {
  repoInfo: any;
  ultimoCommit: any | null;
}

const repoCache: Record<string, RepoInfo> = {};

function parseGithubUrl(url?: string) {
  if (!url) return null;
  const m = url.match(/github\.com\/([^/]+)\/([^/#?]+)/i);
  if (!m) return null;
  return { owner: m[1], repo: m[2].replace(/\.git$/, "") };
}

/**
 * Estado e lógica de negócio da página de detalhe de um projeto — usado
 * pelas versões Modern e Classic (visual é 100% separado, os dados e as
 * regras — github, notas com autosave, to-dos e progresso — são únicos).
 */
export function useProjetoDetalhe() {
  const { id } = useParams({ from: "/_auth/projetos/$id" });
  const navigate = useNavigate();
  const { projetos, clientes, receitas, update, remove, log } = useStore();
  const p = projetos.find((x) => x.id === id);

  const [notas, setNotas] = useState(p?.notas ?? "");
  const [notasStatus, setNotasStatus] = useState("");
  const notasTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [novaTarefa, setNovaTarefa] = useState("");
  const [repo, setRepo] = useState<{ state: "idle" | "loading" | "ok" | "err"; data?: RepoInfo; msg?: string }>({
    state: "idle",
  });

  useEffect(() => {
    if (p && p.notas !== undefined && p.notas !== notas) setNotas(p.notas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p?.id]);

  const cliente = useMemo(() => (p ? clienteDoProjeto(p, clientes) : null), [p, clientes]);
  const lanc = useMemo(
    () =>
      p
        ? lancamentosDoProjeto(p, receitas)
            .slice()
            .sort((a, b) => b.data.localeCompare(a.data))
        : [],
    [p, receitas],
  );

  useEffect(() => {
    if (!p?.repo) return;
    const parsed = parseGithubUrl(p.repo);
    if (!parsed) {
      setRepo({ state: "err", msg: "URL do GitHub não reconhecida." });
      return;
    }
    const key = `${parsed.owner}/${parsed.repo}`;
    if (repoCache[key]) {
      setRepo({ state: "ok", data: repoCache[key] });
      return;
    }
    setRepo({ state: "loading" });
    (async () => {
      try {
        const [rRepo, rCommits] = await Promise.all([
          fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`),
          fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}/commits?per_page=1`),
        ]);
        if (rRepo.status === 404) {
          setRepo({ state: "err", msg: "Repositório não encontrado — confira a URL." });
          return;
        }
        if (rRepo.status === 403) {
          setRepo({ state: "err", msg: "GitHub bloqueou a consulta (limite de requisições)." });
          return;
        }
        if (!rRepo.ok) {
          setRepo({ state: "err", msg: `Erro ao consultar (${rRepo.status}).` });
          return;
        }
        const repoInfo = await rRepo.json();
        const commits = rCommits.ok ? await rCommits.json() : [];
        const data: RepoInfo = { repoInfo, ultimoCommit: commits[0] || null };
        repoCache[key] = data;
        setRepo({ state: "ok", data });
      } catch {
        setRepo({ state: "err", msg: "Erro de conexão com o GitHub." });
      }
    })();
  }, [p?.repo]);

  const stack = (p?.stack || "").split(",").map((s) => s.trim()).filter(Boolean);
  const faturado = lanc.filter((l) => l.tipo === "entrada").reduce((s, l) => s + Number(l.valor), 0);
  const gastos = lanc.filter((l) => l.tipo === "saida").reduce((s, l) => s + Number(l.valor), 0);
  const todos = Array.isArray(p?.todos) ? p!.todos : [];
  const feitas = todos.filter((t) => t.feito).length;
  const prog = calcProgresso(todos);

  function onNotasChange(texto: string) {
    setNotas(texto);
    setNotasStatus("digitando…");
    if (notasTimer.current) clearTimeout(notasTimer.current);
    notasTimer.current = setTimeout(() => saveNotas(texto), 800);
  }

  function saveNotas(texto: string) {
    if (!p) return;
    if (notasTimer.current) clearTimeout(notasTimer.current);
    (async () => {
      await update("projetos", p.id, { notas: texto });
      setNotasStatus("salvo ✓");
      setTimeout(() => setNotasStatus(""), 2000);
    })();
  }

  function flushNotas() {
    saveNotas(notas);
  }

  async function addTodo(texto: string) {
    if (!p || !texto.trim()) return;
    const t = [...todos, { texto: texto.trim(), feito: false, criadoEm: Date.now() }];
    await update("projetos", p.id, { todos: t, progresso: calcProgresso(t) });
  }

  async function toggleTodo(index: number, feito: boolean) {
    if (!p) return;
    const t2 = todos.map((x, idx) => (idx === index ? { ...x, feito } : x));
    await update("projetos", p.id, { todos: t2, progresso: calcProgresso(t2) });
  }

  async function removeTodo(index: number) {
    if (!p) return;
    const t3 = todos.filter((_, idx) => idx !== index);
    await update("projetos", p.id, { todos: t3, progresso: calcProgresso(t3) });
  }

  async function excluirProjeto() {
    if (!p) return;
    if (!confirm(`Excluir o projeto "${p.nome}"?`)) return;
    await remove("projetos", p.id);
    await log(`<b>Projeto</b> — ${p.nome} excluído`, "projeto");
    navigate({ to: "/projetos" });
  }

  return {
    p,
    cliente,
    lanc,
    stack,
    faturado,
    gastos,
    todos,
    feitas,
    prog,
    notas,
    notasStatus,
    onNotasChange,
    flushNotas,
    novaTarefa,
    setNovaTarefa,
    addTodo,
    toggleTodo,
    removeTodo,
    repo,
    excluirProjeto,
  };
}
