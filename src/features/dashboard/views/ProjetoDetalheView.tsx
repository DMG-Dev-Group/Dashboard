import { Link } from "@tanstack/react-router";
import { Panel, PanelTitle } from "../components/Panel";
import { StatusBadge } from "../components/StatusBadge";
import { ProgressBar } from "../components/ProgressBar";
import { BRL, fmtDataBR } from "@/lib/format";
import { useModal } from "../modals/ModalProvider";
import { ProjetoModal } from "../modals/ProjetoModal";
import { ArrowLeft, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { useProjetoDetalhe, type RepoInfo } from "./useProjetoDetalhe";

export function ProjetoDetalheView() {
  const {
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
  } = useProjetoDetalhe();
  const { open } = useModal();

  if (!p) {
    return (
      <div className="py-12 text-center font-mono text-sm text-dmg-text-3">
        Projeto não encontrado.
        <Link to="/projetos" className="ml-2 text-dmg-red hover:underline">
          voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <Link
          to="/projetos"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-dmg-text-3 hover:text-dmg-text"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> projetos
        </Link>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mono-label">// projeto</p>
            <h1 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight">
              {p.nome}
              <span className="dmg-cursor">_</span>
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-dmg-text-2">
              <StatusBadge status={p.status} />
              <span>
                {p.tipo || "—"} · responsável: <b className="text-dmg-text">{p.resp || "—"}</b>
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                open("Editar projeto", (close) => <ProjetoModal projeto={p} onClose={close} />)
              }
              className="inline-flex items-center gap-1.5 rounded border border-dmg-border-strong px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] hover:border-dmg-red-dark"
            >
              <Pencil className="h-3.5 w-3.5" /> editar
            </button>
            <button
              onClick={excluirProjeto}
              className="inline-flex items-center gap-1.5 rounded border border-dmg-red-dark bg-dmg-red-dark/20 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-dmg-red hover:bg-dmg-red-dark/40"
            >
              <Trash2 className="h-3.5 w-3.5" /> excluir
            </button>
          </div>
        </div>
      </div>

      <Panel>
        <div className="flex items-center justify-between text-sm">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-dmg-text-3">
            Progresso
          </span>
          <b className="tabular-nums">{prog}%</b>
        </div>
        <div className="mt-2">
          <ProgressBar value={prog} />
        </div>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-dmg-text-3">
          {todos.length
            ? `calculado pelas to-dos · ${feitas}/${todos.length} concluídas`
            : "adicione to-dos abaixo para calcular o progresso"}
        </p>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel>
          <PanelTitle title="Como foi feito" />
          {p.desc ? (
            <p className="whitespace-pre-wrap text-sm leading-[1.7] text-dmg-text-2">{p.desc}</p>
          ) : (
            <p className="font-mono text-sm text-dmg-text-3">
              Sem notas ainda — clique em "editar" e conte como o projeto foi construído.
            </p>
          )}
          <div className="mt-6 mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-dmg-text-3">
            Stack utilizada
          </div>
          {stack.length ? (
            <div className="flex flex-wrap gap-2">
              {stack.map((s) => (
                <span
                  key={s}
                  className="rounded border border-dmg-border-strong bg-dmg-surface-2 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-dmg-text-2"
                >
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="font-mono text-sm text-dmg-text-3">Stack não informada.</p>
          )}
        </Panel>

        <Panel>
          <PanelTitle title="Ficha técnica" />
          <dl className="space-y-3 text-sm">
            <KV label="Cliente">
              {cliente ? (
                <Link to="/clientes" className="text-dmg-red hover:underline">
                  {cliente.nome} →
                </Link>
              ) : (
                <span className="text-dmg-text-3">não informado</span>
              )}
            </KV>
            <KV label="Repositório">
              <LinkOut url={p.repo} what="o repositório" />
            </KV>
            <KV label="Produção">
              <LinkOut url={p.url} what="a URL" />
            </KV>
            <KV label="Valor contratado">
              <b className="tabular-nums">{p.valor ? BRL(Number(p.valor)) : "—"}</b>
            </KV>
            <KV label="Faturado">
              <b className="tabular-nums text-emerald-400">{BRL(faturado)}</b>
            </KV>
            <KV label="Gastos">
              <b className="tabular-nums text-dmg-red">{BRL(gastos)}</b>
            </KV>
            <KV label="Resultado">
              <b className="tabular-nums">{BRL(faturado - gastos)}</b>
            </KV>
          </dl>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel>
          <PanelTitle
            title="Bloco de notas"
            sub="rascunho livre — salva sozinho"
            action={
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-dmg-text-3">
                {notasStatus}
              </span>
            }
          />
          <textarea
            value={notas}
            onChange={(e) => onNotasChange(e.target.value)}
            onBlur={flushNotas}
            rows={12}
            placeholder="Senhas de homologação, combinados com o cliente, pendências..."
            className="w-full resize-y rounded border border-dmg-border bg-dmg-surface-2 p-3 font-mono text-sm outline-none focus:border-dmg-red"
          />
        </Panel>

        <Panel>
          <PanelTitle
            title="To-do"
            sub={`${feitas}/${todos.length} concluídas`}
          />
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const t = novaTarefa;
              setNovaTarefa("");
              await addTodo(t);
            }}
            className="mb-4 flex gap-2"
          >
            <input
              value={novaTarefa}
              onChange={(e) => setNovaTarefa(e.target.value)}
              placeholder="nova tarefa..."
              className="flex-1 rounded border border-dmg-border bg-dmg-surface-2 px-3 py-2 text-sm outline-none focus:border-dmg-red"
            />
            <button
              type="submit"
              className="rounded bg-dmg-red-solid px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white hover:bg-dmg-red-hover"
            >
              + add
            </button>
          </form>
          {todos.length === 0 ? (
            <p className="font-mono text-sm text-dmg-text-3">Nenhuma tarefa.</p>
          ) : (
            <ul className="space-y-2">
              {todos.map((t, i) => (
                <li
                  key={i}
                  className={`flex items-center gap-3 rounded border border-dmg-border bg-dmg-surface-2/50 px-3 py-2 ${
                    t.feito ? "opacity-60" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={t.feito}
                    onChange={(e) => toggleTodo(i, e.target.checked)}
                    className="accent-dmg-red"
                  />
                  <span className={`flex-1 text-sm ${t.feito ? "line-through" : ""}`}>
                    {t.texto}
                  </span>
                  <button
                    onClick={() => removeTodo(i)}
                    className="rounded p-1 text-dmg-text-3 hover:text-dmg-red"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel>
        <PanelTitle title="Repositório" />
        {!p.repo ? (
          <p className="font-mono text-sm text-dmg-text-3">
            Nenhum repositório vinculado — edite o projeto e informe a URL do GitHub.
          </p>
        ) : repo.state === "loading" ? (
          <p className="font-mono text-sm text-dmg-text-3">Carregando…</p>
        ) : repo.state === "err" ? (
          <p className="font-mono text-sm text-dmg-red">{repo.msg}</p>
        ) : repo.data ? (
          <RepoCard data={repo.data} />
        ) : null}
      </Panel>

      <Panel>
        <PanelTitle title="Lançamentos do projeto" />
        {lanc.length === 0 ? (
          <p className="font-mono text-sm text-dmg-text-3">
            Nenhum lançamento vinculado — no Financeiro, escolha "{p.nome}" ao lançar.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dmg-border text-left font-mono text-[10px] uppercase tracking-[0.16em] text-dmg-text-3">
                  <th className="pb-3 pr-4">Descrição</th>
                  <th className="pb-3 pr-4">Data</th>
                  <th className="pb-3 pr-4">Tipo</th>
                  <th className="pb-3">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dmg-border">
                {lanc.map((l) => (
                  <tr key={l.id}>
                    <td className="py-2 pr-4">{l.desc}</td>
                    <td className="py-2 pr-4 font-mono text-xs text-dmg-text-2">
                      {fmtDataBR(l.data)}
                    </td>
                    <td className="py-2 pr-4">
                      <span
                        className={`inline-flex rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${
                          l.tipo === "entrada"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                            : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                        }`}
                      >
                        {l.tipo}
                      </span>
                    </td>
                    <td
                      className={`py-2 tabular-nums ${
                        l.tipo === "entrada" ? "text-emerald-400" : "text-dmg-red"
                      }`}
                    >
                      {l.tipo === "entrada" ? "+" : "−"} {BRL(Number(l.valor))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

function KV({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-dmg-border/60 pb-2 last:border-none">
      <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-dmg-text-3">
        {label}
      </dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}

function LinkOut({ url, what }: { url?: string; what: string }) {
  if (!url) return <span className="text-dmg-text-3">não informado — adicione {what}</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener"
      className="inline-flex items-center gap-1 text-dmg-red hover:underline"
    >
      {url.replace(/^https?:\/\//, "")} <ExternalLink className="h-3 w-3" />
    </a>
  );
}

function RepoCard({ data }: { data: RepoInfo }) {
  const { repoInfo, ultimoCommit } = data;
  const atualizado = new Date(repoInfo.pushed_at).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="font-semibold">{repoInfo.full_name}</span>
        <a
          href={repoInfo.html_url}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1 font-mono text-[11px] text-dmg-red hover:underline"
        >
          abrir no GitHub <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      {repoInfo.description && (
        <p className="mb-3 text-sm text-dmg-text-2">{repoInfo.description}</p>
      )}
      <div className="flex flex-wrap gap-4 font-mono text-[11px] text-dmg-text-3">
        <span>
          branch <b className="text-dmg-text">{repoInfo.default_branch}</b>
        </span>
        <span>
          lang <b className="text-dmg-text">{repoInfo.language || "—"}</b>
        </span>
        <span>
          issues <b className="text-dmg-text">{repoInfo.open_issues_count}</b>
        </span>
        <span>
          ★ <b className="text-dmg-text">{repoInfo.stargazers_count}</b>
        </span>
        <span>
          últ. atividade <b className="text-dmg-text">{atualizado}</b>
        </span>
      </div>
      {ultimoCommit && (
        <div className="mt-4 flex items-start gap-3 rounded border border-dmg-border bg-dmg-surface-2 p-3">
          {ultimoCommit.author?.avatar_url && (
            <img
              src={ultimoCommit.author.avatar_url}
              alt=""
              className="h-8 w-8 rounded-full"
            />
          )}
          <div className="text-sm">
            <div className="font-semibold">
              {(ultimoCommit.commit.message || "").split("\n")[0]}
            </div>
            <div className="mt-0.5 font-mono text-[11px] text-dmg-text-3">
              {ultimoCommit.commit.author.name} ·{" "}
              {new Date(ultimoCommit.commit.author.date).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              ·{" "}
              <a
                href={ultimoCommit.html_url}
                target="_blank"
                rel="noopener"
                className="text-dmg-red hover:underline"
              >
                {ultimoCommit.sha.slice(0, 7)}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
