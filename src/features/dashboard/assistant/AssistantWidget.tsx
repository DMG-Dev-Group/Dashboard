import { useEffect, useRef, useState, type FormEvent } from "react";
import { useStore } from "@/lib/store/StoreProvider";
import { useAssistant, resumoAcao } from "./useAssistant";
import { cn } from "@/lib/utils";
import { Bot, Send, X } from "lucide-react";

/**
 * Trevor — assistente flutuante do dashboard — disponível em qualquer tela,
 * nos dois temas (Modern/Classic usam o mesmo widget; não é uma view, é uma
 * camada por cima). Toda ação de escrita (criar projeto, lançar financeiro)
 * pede confirmação explícita antes de gravar — ver useAssistant.ts.
 */
export function AssistantWidget() {
  const { projetos, eventos, clientes, receitas } = useStore();
  const { messages, send, loading, pending, confirmar, cancelar } = useAssistant();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending, open]);

  // O input fica `disabled` enquanto carrega/aguarda confirmação — o navegador
  // tira o foco dele sozinho nesse momento, e sem isso o usuário precisa
  // clicar de novo pra digitar a próxima mensagem depois que ele reabilita.
  useEffect(() => {
    if (!open || loading || pending) return;
    inputRef.current?.focus();
  }, [open, loading, pending]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const t = input;
    if (!t.trim()) return;
    setInput("");
    await send(t);
  }

  const acao = pending ? resumoAcao(pending, { projetos, eventos, clientes, receitas }) : null;

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Trevor"
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-dmg-red-dark bg-dmg-red-solid text-white shadow-[0_8px_24px_rgba(0,0,0,.4)] hover:bg-dmg-red-hover"
      >
        {open ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </button>

      {open && (
        <div className="fixed bottom-20 right-5 z-40 flex h-[min(480px,70vh)] w-[360px] max-w-[calc(100vw-2.5rem)] flex-col rounded-lg border border-dmg-border bg-dmg-surface shadow-[0_16px_48px_rgba(0,0,0,.5)]">
          <div className="flex items-center gap-2 border-b border-dmg-border px-4 py-3">
            <Bot className="h-4 w-4 text-dmg-red" />
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-dmg-text-2">
              Trevor
            </span>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.length === 0 && (
              <p className="font-mono text-xs leading-relaxed text-dmg-text-3">
                E aí. Pergunta sobre eventos, projetos, clientes ou financeiro — ou manda criar,
                editar ou excluir um projeto, evento, lançamento ou cliente.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap rounded px-3 py-2 text-sm",
                  m.role === "user"
                    ? "ml-auto bg-dmg-red-solid/15 text-dmg-text"
                    : "bg-dmg-surface-2 text-dmg-text-2",
                )}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-dmg-text-3">
                pensando…
              </p>
            )}
            {pending && acao && (
              <div className="rounded border border-dmg-red-dark bg-dmg-red-solid/10 p-3">
                <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-dmg-red">
                  {acao.titulo}
                </p>
                <ul className="mb-3 space-y-0.5 text-xs text-dmg-text-2">
                  {acao.linhas.map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <button
                    onClick={confirmar}
                    className="flex-1 rounded bg-dmg-red-solid px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white hover:bg-dmg-red-hover"
                  >
                    confirmar
                  </button>
                  <button
                    onClick={cancelar}
                    className="flex-1 rounded border border-dmg-border-strong px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-dmg-text-2 hover:bg-dmg-surface-2"
                  >
                    cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={submit} className="flex gap-2 border-t border-dmg-border p-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte pro Trevor…"
              disabled={loading || !!pending}
              className="flex-1 rounded border border-dmg-border bg-dmg-surface-2 px-3 py-2 text-sm outline-none focus:border-dmg-red disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !!pending || !input.trim()}
              className="rounded bg-dmg-red-solid px-3 py-2 text-white hover:bg-dmg-red-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
