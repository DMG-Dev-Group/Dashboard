import { useRef, useState } from "react";
import { useDragReorder } from "@/hooks/useDragReorder";
import { PRIORIDADES, type Prioridade, type Todo } from "@/lib/store/types";
import { fileToCompressedDataUrl, ImagemMuitoGrandeError } from "@/lib/imageUpload";
import { dmgToast } from "@/lib/toast";
import { GripVertical, ImagePlus, Pencil, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  todos: Todo[];
  onAdd: (texto: string) => Promise<void>;
  onToggle: (index: number, feito: boolean) => Promise<void>;
  onRemove: (index: number) => Promise<void>;
  onUpdate: (index: number, patch: Partial<Todo>) => Promise<void>;
  onReorder: (next: Todo[]) => Promise<void>;
  maxHeight?: number;
}

const FILTROS: Array<Prioridade | "todas"> = ["todas", "urgente", "alta", "media", "baixa"];

/**
 * Lista de to-do reutilizável (usada em /notas e no detalhe do projeto):
 * rolagem própria, edição inline (duplo clique ou botão), arrastar pra
 * reordenar (só quando o filtro é "todas" — com filtro ativo os índices
 * visíveis não batem com os do array real), prioridade com barra colorida +
 * texto, e anexo de imagem abaixo do título.
 */
export function TodoList({
  todos,
  onAdd,
  onToggle,
  onRemove,
  onUpdate,
  onReorder,
  maxHeight = 360,
}: Props) {
  const [nova, setNova] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [filtro, setFiltro] = useState<Prioridade | "todas">("todas");
  const fileInputs = useRef<Record<number, HTMLInputElement | null>>({});

  const feitas = todos.filter((t) => t.feito).length;
  const indicesFiltrados = todos
    .map((t, i) => i)
    .filter((i) => filtro === "todas" || todos[i].prioridade === filtro);

  const { getDragProps, overIndex, draggingIndex } = useDragReorder(todos, onReorder);

  function startEdit(index: number) {
    setEditingIndex(index);
    setEditValue(todos[index].texto);
  }

  async function commitEdit() {
    if (editingIndex === null) return;
    const texto = editValue.trim();
    if (texto) await onUpdate(editingIndex, { texto });
    setEditingIndex(null);
  }

  async function attachImage(index: number, file: File) {
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      await onUpdate(index, { imagem: dataUrl });
    } catch (err) {
      if (err instanceof ImagemMuitoGrandeError) {
        dmgToast.error("Imagem muito grande", "Tente uma imagem menor ou com menos resolução.");
      } else {
        dmgToast.error("Não foi possível anexar a imagem");
      }
    }
  }

  return (
    <div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const t = nova;
          setNova("");
          await onAdd(t);
        }}
        className="mb-3 flex gap-2"
      >
        <input
          value={nova}
          onChange={(e) => setNova(e.target.value)}
          placeholder="nova tarefa…"
          className="flex-1 rounded border border-dmg-border bg-dmg-surface-2 px-3 py-2 text-sm outline-none focus:border-dmg-red"
        />
        <button
          type="submit"
          className="rounded bg-dmg-red-solid px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white hover:bg-dmg-red-hover"
        >
          + add
        </button>
      </form>

      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-dmg-text-3">
          {feitas}/{todos.length} concluídas
        </span>
        <div className="ml-auto flex flex-wrap gap-1">
          {FILTROS.map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={cn(
                "rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em]",
                filtro === f
                  ? "border-dmg-red-dark bg-dmg-red-solid/20 text-dmg-red"
                  : "border-dmg-border-strong text-dmg-text-3 hover:text-dmg-text",
              )}
            >
              {f === "todas" ? "todas" : PRIORIDADES[f].label}
            </button>
          ))}
        </div>
      </div>

      {todos.length === 0 ? (
        <p className="font-mono text-sm text-dmg-text-3">Nenhuma tarefa.</p>
      ) : indicesFiltrados.length === 0 ? (
        <p className="font-mono text-sm text-dmg-text-3">Nenhuma tarefa com essa prioridade.</p>
      ) : (
        <ul className="space-y-2 overflow-y-auto pr-1" style={{ maxHeight }}>
          {indicesFiltrados.map((i) => {
            const t = todos[i];
            const editing = editingIndex === i;
            const prio = t.prioridade ? PRIORIDADES[t.prioridade] : null;
            return (
              <li
                key={i}
                {...(filtro === "todas" ? getDragProps(i) : {})}
                className={cn(
                  "flex gap-2 rounded border border-dmg-border bg-dmg-surface-2/50 py-2 pl-1 pr-3",
                  t.feito && "opacity-60",
                  draggingIndex === i && "opacity-30",
                  overIndex === i &&
                    draggingIndex !== null &&
                    draggingIndex !== i &&
                    "border-dmg-red",
                )}
              >
                <span
                  className={cn(
                    "w-1 shrink-0 self-stretch rounded",
                    prio ? prio.bar : "bg-transparent",
                  )}
                />
                {filtro === "todas" && (
                  <span
                    className="mt-1.5 shrink-0 cursor-grab text-dmg-text-3"
                    title="arrastar para reordenar"
                  >
                    <GripVertical className="h-3.5 w-3.5" />
                  </span>
                )}
                <input
                  type="checkbox"
                  checked={t.feito}
                  onChange={(e) => onToggle(i, e.target.checked)}
                  className="mt-1.5 shrink-0 accent-dmg-red"
                />
                <div className="min-w-0 flex-1">
                  {editing ? (
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitEdit();
                        if (e.key === "Escape") setEditingIndex(null);
                      }}
                      className="w-full rounded border border-dmg-red bg-dmg-surface px-2 py-1 text-sm outline-none"
                    />
                  ) : (
                    <span
                      onDoubleClick={() => startEdit(i)}
                      className={cn("block cursor-text text-sm", t.feito && "line-through")}
                    >
                      {t.texto}
                    </span>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <select
                      value={t.prioridade ?? ""}
                      onChange={(e) =>
                        onUpdate(i, { prioridade: (e.target.value || undefined) as Prioridade })
                      }
                      className="rounded border border-dmg-border-strong bg-transparent px-1 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-dmg-text-3 outline-none"
                    >
                      <option value="">sem prioridade</option>
                      {(Object.keys(PRIORIDADES) as Prioridade[]).map((p) => (
                        <option key={p} value={p}>
                          {PRIORIDADES[p].label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {t.imagem && (
                    <div className="relative mt-2 inline-block">
                      <img
                        src={t.imagem}
                        alt=""
                        className="max-h-32 rounded border border-dmg-border-strong"
                      />
                      <button
                        onClick={() => onUpdate(i, { imagem: undefined })}
                        className="absolute -right-1.5 -top-1.5 rounded-full bg-dmg-surface p-0.5 text-dmg-text-3 hover:text-dmg-red"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 items-start gap-0.5">
                  <input
                    ref={(el) => {
                      fileInputs.current[i] = el;
                    }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void attachImage(i, file);
                      e.target.value = "";
                    }}
                  />
                  <button
                    onClick={() => fileInputs.current[i]?.click()}
                    title="Anexar imagem"
                    className="rounded p-1 text-dmg-text-3 hover:text-dmg-text"
                  >
                    <ImagePlus className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => startEdit(i)}
                    title="Editar"
                    className="rounded p-1 text-dmg-text-3 hover:text-dmg-text"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onRemove(i)}
                    title="Excluir"
                    className="rounded p-1 text-dmg-text-3 hover:text-dmg-red"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
