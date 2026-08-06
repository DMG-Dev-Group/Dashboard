import { escapeHtml, renderInline, safeImageSrc } from "./inlineTokens";

const MARKER_CLS = "opacity-40 select-none";

const HEADING_RE = /^(#{1,6})(\s)(.*)$/;
const QUOTE_RE = /^(>\s?)(.*)$/;
const CHECKLIST_RE = /^(\s*[-*]\s\[)([ xX])(\]\s)(.*)$/;
const LIST_RE = /^(\s*[-*]\s)(.*)$/;
const ORDERED_RE = /^(\s*\d+\.\s)(.*)$/;
const TABLE_RE = /^\s*\|.*\|\s*$/;
const IMAGE_RE = /^!\[([^\]]*)\]\((.+)\)$/;

const HEADING_SIZE: Record<number, string> = {
  1: "text-[1.65em] font-extrabold",
  2: "text-[1.4em] font-extrabold",
  3: "text-[1.2em] font-bold",
  4: "text-[1.08em] font-bold",
  5: "text-[1em] font-bold",
  6: "text-[0.95em] font-bold uppercase tracking-wide",
};

/**
 * Renderiza uma linha de markdown pra HTML mantendo o texto real == fonte
 * (nada é escondido, só estilizado) — condição pro cursor sobreviver ao
 * re-render (ver caret.ts). Cada linha vira um `<span data-line="i">` pra
 * dar pra identificar em qual linha caiu um clique (checklist).
 */
export function renderLine(line: string, lineIndex: number): string {
  const wrap = (inner: string, extraAttrs = "") =>
    `<span data-line="${lineIndex}"${extraAttrs}>${inner}</span>`;

  const image = line.match(IMAGE_RE);
  if (image) {
    const src = safeImageSrc(image[2]);
    const img = src
      ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(image[1])}" contenteditable="false" draggable="false" class="max-h-64 rounded border border-dmg-border-strong object-contain" />`
      : "";
    return wrap(
      `<span class="mb-1 block font-mono text-[0.85em] opacity-40 select-none">${escapeHtml(line)}</span>${img}`,
      ` class="inline-block w-full align-top"`,
    );
  }

  const heading = line.match(HEADING_RE);
  if (heading) {
    const level = heading[1].length;
    return wrap(
      `<span class="${MARKER_CLS}">${heading[1]}${heading[2]}</span>${renderInline(heading[3])}`,
      ` class="${HEADING_SIZE[level] ?? HEADING_SIZE[6]}"`,
    );
  }

  const quote = line.match(QUOTE_RE);
  if (quote) {
    return wrap(
      `<span class="${MARKER_CLS}">${escapeHtml(quote[1])}</span>${renderInline(quote[2])}`,
      ` class="border-l-2 border-dmg-red-dark/60 pl-2 italic text-dmg-text-2"`,
    );
  }

  const checklist = line.match(CHECKLIST_RE);
  if (checklist) {
    const checked = checklist[2].toLowerCase() === "x";
    const box = `<span class="inline-block h-3 w-3 -translate-y-px rounded-[3px] border align-middle ${
      checked ? "border-dmg-red bg-dmg-red-solid" : "border-dmg-border-strong"
    }"></span>`;
    return wrap(
      `<span class="${MARKER_CLS}">${escapeHtml(checklist[1])}</span>${box}<span class="${MARKER_CLS}">${escapeHtml(
        checklist[2],
      )}</span><span class="${MARKER_CLS}">${escapeHtml(checklist[3])}</span><span class="${
        checked ? "text-dmg-text-3 line-through" : ""
      }">${renderInline(checklist[4])}</span>`,
      ` data-checklist-line="${lineIndex}" class="cursor-default"`,
    );
  }

  const ordered = line.match(ORDERED_RE);
  if (ordered) {
    return wrap(
      `<span class="text-dmg-text-3">${escapeHtml(ordered[1])}</span>${renderInline(ordered[2])}`,
    );
  }

  const list = line.match(LIST_RE);
  if (list) {
    // marcador fica como digitado (-/*) só estilizado — trocar o caractere
    // por "•" corromperia a fonte real (o texto renderizado é o dado).
    return wrap(
      `<span class="${MARKER_CLS}">${escapeHtml(list[1])}</span>${renderInline(list[2])}`,
    );
  }

  if (TABLE_RE.test(line)) {
    return wrap(
      `<span class="rounded bg-black/25 px-1 font-mono text-[0.92em] text-dmg-text-2">${escapeHtml(line)}</span>`,
    );
  }

  // linha vazia: precisa de uma âncora real (<br>, não conta como texto) —
  // um <span> totalmente vazio confunde o Chrome, que digita no nó de texto
  // vizinho (a quebra de linha anterior) em vez de criar texto aqui dentro
  if (line === "") return wrap("<br>");

  return wrap(renderInline(line));
}

export function isChecklistLine(line: string): boolean {
  return CHECKLIST_RE.test(line);
}

export function toggleChecklistLine(line: string): string {
  const m = line.match(CHECKLIST_RE);
  if (!m) return line;
  const flipped = m[2].toLowerCase() === "x" ? " " : "x";
  return `${m[1]}${flipped}${m[3]}${m[4]}`;
}
