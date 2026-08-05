import { useRef, useState } from "react";
import { useDragReorder } from "@/hooks/useDragReorder";
import { PRIORIDADES, type Prioridade, type Todo } from "@/lib/store/types";
import { fileToCompressedDataUrl, ImagemMuitoGrandeError } from "@/lib/imageUpload";
import { dmgToast } from "@/lib/toast";
import { GripVertical, ImagePlus, Pencil, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ClassicButtonSm, ClassicEmpty, ClassicIconMini } from "./ClassicUI";

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

export function TodoListClassic({
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
        className="mb-3.5 flex gap-2"
      >
        <input
          value={nova}
          onChange={(e) => setNova(e.target.value)}
          placeholder="nova tarefa…"
          className="flex-1 rounded-lg border border-white/10 bg-black/28 px-3 py-2.5 text-[13px] text-[#eaeaea] outline-none placeholder:text-white/26 focus:border-dmg-red-solid/55"
        />
        <ClassicButtonSm type="submit">+ add</ClassicButtonSm>
      </form>

      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-dmg-text-3">
          {feitas}/{todos.length} concluídas
        </span>
        <div className="ml-auto flex flex-wrap gap-1">
          {FILTROS.map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em]",
                filtro === f
                  ? "border-dmg-red-solid/50 bg-dmg-red-solid/15 text-dmg-red"
                  : "border-white/10 text-dmg-text-3 hover:text-dmg-text",
              )}
            >
              {f === "todas" ? "todas" : PRIORIDADES[f].label}
            </button>
          ))}
        </div>
      </div>

      {todos.length === 0 ? (
        <ClassicEmpty>Nenhuma tarefa.</ClassicEmpty>
      ) : indicesFiltrados.length === 0 ? (
        <ClassicEmpty>Nenhuma tarefa com essa prioridade.</ClassicEmpty>
      ) : (
        <ul className="flex flex-col gap-0.5 overflow-y-auto pr-1" style={{ maxHeight }}>
          {indicesFiltrados.map((i) => {
            const t = todos[i];
            const editing = editingIndex === i;
            const prio = t.prioridade ? PRIORIDADES[t.prioridade] : null;
            return (
              <li
                key={i}
                {...(filtro === "todas" ? getDragProps(i) : {})}
                className={cn(
                  "group/todo flex gap-2.5 border-b border-white/5 py-2.5 pl-1 last:border-none",
                  t.feito && "opacity-60",
                  draggingIndex === i && "opacity-30",
                  overIndex === i &&
                    draggingIndex !== null &&
                    draggingIndex !== i &&
                    "border-dmg-red-solid/60",
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
                    className="mt-1 shrink-0 cursor-grab text-white/30"
                    title="arrastar para reordenar"
                  >
                    <GripVertical className="h-3.5 w-3.5" />
                  </span>
                )}
                <input
                  type="checkbox"
                  checked={t.feito}
                  onChange={(e) => onToggle(i, e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 accent-dmg-red-solid"
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
                      className="w-full rounded-lg border border-dmg-red-solid/55 bg-black/28 px-2 py-1 text-[13.5px] text-[#eaeaea] outline-none"
                    />
                  ) : (
                    <span
                      onDoubleClick={() => startEdit(i)}
                      className={cn(
                        "block cursor-text text-[13.5px] leading-snug text-dmg-text",
                        t.feito && "text-dmg-text-3 line-through",
                      )}
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
                      className="rounded border border-white/10 bg-transparent px-1 py-0.5 text-[10px] uppercase tracking-[0.06em] text-dmg-text-3 outline-none"
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
                        className="max-h-32 rounded-lg border border-white/10"
                      />
                      <button
                        onClick={() => onUpdate(i, { imagem: undefined })}
                        className="absolute -right-1.5 -top-1.5 rounded-full bg-black/60 p-0.5 text-white/70 hover:text-dmg-red"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 items-start gap-1 opacity-0 group-hover/todo:opacity-100">
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
                  <ClassicIconMini
                    onClick={() => fileInputs.current[i]?.click()}
                    title="Anexar imagem"
                  >
                    <ImagePlus className="h-3.5 w-3.5" />
                  </ClassicIconMini>
                  <ClassicIconMini onClick={() => startEdit(i)} title="Editar">
                    <Pencil className="h-3.5 w-3.5" />
                  </ClassicIconMini>
                  <ClassicIconMini onClick={() => onRemove(i)} title="Excluir">
                    <Trash2 className="h-3.5 w-3.5" />
                  </ClassicIconMini>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
