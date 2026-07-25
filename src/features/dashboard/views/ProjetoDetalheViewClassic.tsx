import { Link } from "@tanstack/react-router";
import { BRL, fmtDataBR } from "@/lib/format";
import { useModal } from "../modals/ModalProvider";
import { ProjetoModal } from "../modals/ProjetoModal";
import { ArrowLeft, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { useProjetoDetalhe, type RepoInfo } from "./useProjetoDetalhe";
import {
  ClassicButtonSm,
  ClassicEmpty,
  ClassicIconMini,
  ClassicPanel,
  ClassicPanelTitle,
  ClassicProgress,
  ClassicStatusBadge,
  ClassicTh,
} from "../components/classic/ClassicUI";

export function ProjetoDetalheViewClassic() {
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
      <div className="py-12 text-center text-sm text-dmg-text-3">
        Projeto não encontrado.
        <Link to="/projetos" className="ml-2 text-dmg-red hover:underline">
          voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link
          to="/projetos"
          className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-dmg-text-3 hover:text-dmg-text"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> projetos
        </Link>
        <div className="mt-3 grid grid-cols-1 items-center gap-4 md:grid-cols-[1fr_auto]">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-[28px] font-bold tracking-tight text-dmg-text md:text-[32px]">
              {p.nome}
              <span className="dmg-cursor">_</span>
            </h1>
            <ClassicStatusBadge status={p.status} />
            <span className="text-[13px] text-dmg-text-3">
              {p.tipo || "—"} · resp: <b className="font-semibold text-dmg-text">{p.resp || "—"}</b>
            </span>
          </div>
          <div className="flex gap-2.5">
            <ClassicButtonSm outline onClick={() => open("Editar projeto", (close) => <ProjetoModal projeto={p} onClose={close} />)}>
              <Pencil className="h-3.5 w-3.5" /> editar
            </ClassicButtonSm>
            <ClassicButtonSm danger onClick={excluirProjeto}>
              <Trash2 className="h-3.5 w-3.5" /> excluir
            </ClassicButtonSm>
          </div>
        </div>
      </div>

      <ClassicPanel>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-dmg-text-3">Progresso</span>
          <b className="tabular-nums text-dmg-text">{prog}%</b>
        </div>
        <div className="mt-2.5">
          <ClassicProgress value={prog} />
        </div>
        <p className="mt-2.5 text-[11px] text-dmg-text-3">
          {todos.length
            ? `calculado pelas to-dos · ${feitas}/${todos.length} concluídas`
            : "adicione to-dos abaixo para calcular o progresso"}
        </p>
      </ClassicPanel>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ClassicPanel title="Como foi feito">
          {p.desc ? (
            <p className="whitespace-pre-wrap text-sm leading-[1.8] text-dmg-text-2">{p.desc}</p>
          ) : (
            <p className="text-sm text-dmg-text-3">
              Sem notas ainda — clique em "editar" e conte como o projeto foi construído.
            </p>
          )}
          <div className="mb-3 mt-6 text-[11px] font-medium uppercase tracking-[0.18em] text-dmg-text-3">
            Stack utilizada
          </div>
          {stack.length ? (
            <div className="flex flex-wrap gap-2">
              {stack.map((s) => (
                <span
                  key={s}
                  className="rounded-lg border border-white/10 bg-white/[.04] px-3 py-1.5 text-[12px] text-dmg-text-2"
                >
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-dmg-text-3">Stack não informada.</p>
          )}
        </ClassicPanel>

        <ClassicPanel title="Ficha técnica">
          <dl className="flex flex-col">
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
              <b className="font-mono text-[13px] text-dmg-text">{p.valor ? BRL(Number(p.valor)) : "—"}</b>
            </KV>
            <KV label="Faturado">
              <b className="font-mono text-[13px] text-emerald-300">{BRL(faturado)}</b>
            </KV>
            <KV label="Gastos">
              <b className="font-mono text-[13px] text-dmg-red">{BRL(gastos)}</b>
            </KV>
            <KV label="Resultado">
              <b className="font-mono text-[13px] text-dmg-text">{BRL(faturado - gastos)}</b>
            </KV>
          </dl>
        </ClassicPanel>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ClassicPanel
          title="Bloco de notas"
          sub="rascunho livre — salva sozinho"
          action={<span className="text-[11px] text-dmg-text-3">{notasStatus}</span>}
        >
          <textarea
            value={notas}
            onChange={(e) => onNotasChange(e.target.value)}
            onBlur={flushNotas}
            rows={12}
            placeholder="Senhas de homologação, combinados com o cliente, pendências..."
            className="w-full resize-y rounded-[10px] border border-white/10 bg-black/28 p-3.5 text-[13px] leading-[1.65] text-[#eaeaea] outline-none placeholder:text-white/26 focus:border-dmg-red-solid/55"
          />
        </ClassicPanel>

        <ClassicPanel title="To-do" sub={`${feitas}/${todos.length} concluídas`}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const t = novaTarefa;
              setNovaTarefa("");
              await addTodo(t);
            }}
            className="mb-3.5 flex gap-2"
          >
            <input
              value={novaTarefa}
              onChange={(e) => setNovaTarefa(e.target.value)}
              placeholder="nova tarefa..."
              className="flex-1 rounded-lg border border-white/10 bg-black/28 px-3 py-2.5 text-[13px] text-[#eaeaea] outline-none placeholder:text-white/26 focus:border-dmg-red-solid/55"
            />
            <ClassicButtonSm type="submit">+ add</ClassicButtonSm>
          </form>
          {todos.length === 0 ? (
            <ClassicEmpty>Nenhuma tarefa.</ClassicEmpty>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {todos.map((t, i) => (
                <li
                  key={i}
                  className={`group/todo flex items-center gap-2.5 border-b border-white/5 py-2.5 last:border-none ${
                    t.feito ? "opacity-60" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={t.feito}
                    onChange={(e) => toggleTodo(i, e.target.checked)}
                    className="h-4 w-4 shrink-0 accent-dmg-red-solid"
                  />
                  <span className={`flex-1 text-[13.5px] leading-snug ${t.feito ? "text-dmg-text-3 line-through" : "text-dmg-text"}`}>
                    {t.texto}
                  </span>
                  <ClassicIconMini
                    className="opacity-0 group-hover/todo:opacity-100"
                    onClick={() => removeTodo(i)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </ClassicIconMini>
                </li>
              ))}
            </ul>
          )}
        </ClassicPanel>
      </div>

      <ClassicPanel title="Repositório">
        {!p.repo ? (
          <p className="text-sm text-dmg-text-3">
            Nenhum repositório vinculado — edite o projeto e informe a URL do GitHub.
          </p>
        ) : repo.state === "loading" ? (
          <p className="text-sm text-dmg-text-3">Carregando…</p>
        ) : repo.state === "err" ? (
          <p className="text-sm text-dmg-text-2">{repo.msg}</p>
        ) : repo.data ? (
          <RepoCard data={repo.data} />
        ) : null}
      </ClassicPanel>

      <ClassicPanel title="Lançamentos do projeto">
        <div className="-mx-5 -mb-5 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-y border-white/10 bg-white/[.035]">
                <ClassicTh>Descrição</ClassicTh>
                <ClassicTh>Data</ClassicTh>
                <ClassicTh>Tipo</ClassicTh>
                <ClassicTh>Valor</ClassicTh>
              </tr>
            </thead>
            <tbody>
              {lanc.length === 0 ? (
                <ClassicEmpty colSpan={4}>
                  Nenhum lançamento vinculado — no Financeiro, escolha "{p.nome}" ao lançar.
                </ClassicEmpty>
              ) : (
                lanc.map((l) => (
                  <tr key={l.id}>
                    <td className="border-b border-white/8 px-5 py-3 text-sm text-dmg-text-2">{l.desc}</td>
                    <td className="border-b border-white/8 px-5 py-3 font-mono text-xs text-dmg-text-3">
                      {fmtDataBR(l.data)}
                    </td>
                    <td className="border-b border-white/8 px-5 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.1em] ${
                          l.tipo === "entrada"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                            : "border-amber-400/30 bg-amber-400/10 text-amber-200"
                        }`}
                      >
                        {l.tipo}
                      </span>
                    </td>
                    <td
                      className={`border-b border-white/8 px-5 py-3 tabular-nums ${
                        l.tipo === "entrada" ? "text-emerald-300" : "text-dmg-red"
                      }`}
                    >
                      {l.tipo === "entrada" ? "+" : "−"} {BRL(Number(l.valor))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ClassicPanel>
    </div>
  );
}

function KV({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/8 py-3 text-[13px] last:border-none">
      <dt className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-dmg-text-3">{label}</dt>
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
      className="inline-flex max-w-[60%] items-center gap-1 truncate font-mono text-xs text-dmg-red hover:underline"
    >
      {url.replace(/^https?:\/\//, "")} <ExternalLink className="h-3 w-3 shrink-0" />
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
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[15px] text-dmg-text">{repoInfo.full_name}</span>
        <a
          href={repoInfo.html_url}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1 text-[12px] font-medium text-dmg-red hover:underline"
        >
          abrir no GitHub <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      {repoInfo.description && <p className="text-[13px] text-dmg-text-2">{repoInfo.description}</p>}
      <div className="flex flex-wrap gap-4 text-[13px] text-dmg-text-3">
        <span>
          branch <b className="font-semibold text-dmg-text">{repoInfo.default_branch}</b>
        </span>
        <span>
          lang <b className="font-semibold text-dmg-text">{repoInfo.language || "—"}</b>
        </span>
        <span>
          issues <b className="font-semibold text-dmg-text">{repoInfo.open_issues_count}</b>
        </span>
        <span>
          ★ <b className="font-semibold text-dmg-text">{repoInfo.stargazers_count}</b>
        </span>
      </div>
      {ultimoCommit && (
        <div className="flex items-start gap-3 rounded-[10px] border border-white/10 bg-white/[.03] p-3.5">
          {ultimoCommit.author?.avatar_url && (
            <img src={ultimoCommit.author.avatar_url} alt="" className="h-8 w-8 shrink-0 rounded-full" />
          )}
          <div className="text-[13px]">
            <div className="text-dmg-text">{(ultimoCommit.commit.message || "").split("\n")[0]}</div>
            <div className="mt-0.5 font-mono text-[11px] text-dmg-text-3">
              {ultimoCommit.commit.author.name} ·{" "}
              {new Date(ultimoCommit.commit.author.date).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              · <span>{atualizado}</span> ·{" "}
              <a href={ultimoCommit.html_url} target="_blank" rel="noopener" className="text-dmg-red hover:underline">
                {ultimoCommit.sha.slice(0, 7)}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
