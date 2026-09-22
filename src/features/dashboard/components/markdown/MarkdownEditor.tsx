import {
  useLayoutEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type DragEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { getCaretOffset, getCaretRange, setCaretOffset } from "./caret";
import { isChecklistLine, renderLine, toggleChecklistLine } from "./lineRenderer";
import {
  extrairImagemDoClipboard,
  extrairImagensDoDrop,
  fileToCompressedDataUrl,
  ImagemMuitoGrandeError,
} from "@/lib/imageUpload";
import { dmgToast } from "@/lib/toast";
import { ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  className?: string;
  /** Sobrescreve o visual da caixa editável — pra encaixar no tema Modern ou Classic. */
  editorClassName?: string;
  allowImages?: boolean;
}

const DEFAULT_EDITOR_CLS =
  "w-full resize-y overflow-y-auto rounded border border-dmg-border bg-dmg-surface-2 p-3 font-mono text-sm leading-relaxed outline-none focus:border-dmg-red";

/**
 * Editor de markdown com formatação ao vivo (sem alternar editar/visualizar)
 * — negrito, itálico, títulos, listas, checklist, código, citação, link e
 * tabela. A sintaxe nunca é escondida (só estilizada): é isso que garante
 * que `textContent` do editor sempre bata com a fonte markdown, o que por
 * sua vez é o truque que permite restaurar o cursor depois de cada
 * re-render (ver caret.ts). Suporta colar/arrastar/anexar imagem.
 *
 * O conteúdo é injetado via dangerouslySetInnerHTML (substituição atômica
 * do innerHTML), não via filhos JSX — deixar o React "diffar" filhos contra
 * um DOM que o navegador acabou de mutar por fora (digitação nativa do
 * contentEditable) faz a reconciliação se perder e duplicar texto.
 */
export function MarkdownEditor({
  value,
  onChange,
  onBlur,
  placeholder,
  minHeight = 220,
  maxHeight,
  className,
  editorClassName,
  allowImages = true,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingCaret = useRef<number | null>(null);
  const lastCaret = useRef<number>(value.length);
  const [focused, setFocused] = useState(false);

  const html = value
    .split("\n")
    .map((line, i) => renderLine(line, i))
    .join("\n");

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (pendingCaret.current !== null && document.activeElement === root) {
      setCaretOffset(root, pendingCaret.current);
      pendingCaret.current = null;
    }
  }, [value]);

  /** Início/fim da seleção atual — iguais quando é só um cursor. Sem isso,
   * inserir por cima de um texto selecionado (colar, imagem) deixaria o
   * texto selecionado intacto e só empurraria o novo conteúdo pro início. */
  function currentRange(): { start: number; end: number } {
    const root = rootRef.current;
    if (!root) return { start: lastCaret.current, end: lastCaret.current };
    return getCaretRange(root) ?? { start: lastCaret.current, end: lastCaret.current };
  }

  function handleInput() {
    const root = rootRef.current;
    if (!root) return;
    const offset = getCaretOffset(root);
    const next = root.textContent ?? "";
    lastCaret.current = offset ?? next.length;
    pendingCaret.current = offset;
    onChange(next);
  }

  function insertAtCaret(snippet: string) {
    const { start, end } = currentRange();
    const next = value.slice(0, start) + snippet + value.slice(end);
    pendingCaret.current = start + snippet.length;
    onChange(next);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      insertAtCaret("\n");
    }
  }

  function handleClick(e: MouseEvent<HTMLDivElement>) {
    const root = rootRef.current;
    if (!root) return;
    lastCaret.current = getCaretOffset(root) ?? lastCaret.current;

    const target = e.target as HTMLElement;

    const link = target.closest("a[data-md-link]");
    if (link) {
      if (e.metaKey || e.ctrlKey) {
        window.open(link.getAttribute("data-md-link") ?? "#", "_blank", "noopener");
      }
      e.preventDefault();
      return;
    }

    const lineEl = target.closest("[data-checklist-line]");
    if (lineEl) {
      const idx = Number(lineEl.getAttribute("data-checklist-line"));
      const lines = value.split("\n");
      if (isChecklistLine(lines[idx])) {
        lines[idx] = toggleChecklistLine(lines[idx]);
        onChange(lines.join("\n"));
      }
    }
  }

  async function insertImage(file: File) {
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      const { start, end } = currentRange();
      const needsLeadingBreak = start > 0 && value[start - 1] !== "\n";
      const snippet = `${needsLeadingBreak ? "\n" : ""}![imagem](${dataUrl})\n`;
      const next = value.slice(0, start) + snippet + value.slice(end);
      pendingCaret.current = start + snippet.length;
      onChange(next);
    } catch (err) {
      if (err instanceof ImagemMuitoGrandeError) {
        dmgToast.error("Imagem muito grande", "Tente uma imagem menor ou com menos resolução.");
      } else {
        dmgToast.error("Não foi possível anexar a imagem");
      }
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLDivElement>) {
    const img = allowImages ? extrairImagemDoClipboard(e) : null;
    if (img) {
      e.preventDefault();
      void insertImage(img);
      return;
    }
    // força colar como texto puro — cola de Word/Docs não deve trazer HTML estranho
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    insertAtCaret(text);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    if (!allowImages) return;
    const files = extrairImagensDoDrop(e);
    if (files.length === 0) return;
    e.preventDefault();
    files.forEach((f) => void insertImage(f));
  }

  return (
    <div className={cn("relative", className)}>
      <div
        ref={rootRef}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={(e) => allowImages && e.preventDefault()}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
        style={{ minHeight, maxHeight, whiteSpace: "pre-wrap" }}
        className={cn(editorClassName ?? DEFAULT_EDITOR_CLS, "overflow-y-auto")}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {!value && !focused && (
        <p className="pointer-events-none absolute left-3 top-3 font-mono text-sm text-dmg-text-3">
          {placeholder}
        </p>
      )}

      {allowImages && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void insertImage(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            title="Anexar imagem"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-2 right-2 rounded border border-dmg-border-strong bg-dmg-surface p-1.5 text-dmg-text-3 hover:border-dmg-red-dark hover:text-dmg-red"
          >
            <ImagePlus className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </div>
  );
}
