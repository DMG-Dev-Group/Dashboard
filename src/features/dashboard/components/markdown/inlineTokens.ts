/**
 * Tokeniza uma linha de markdown em HTML estilizado — SEM esconder a
 * sintaxe (os `**`/`_`/`` ` `` continuam no texto, só ficam discretos). Isso
 * é o que permite formatar "ao vivo" mantendo o texto real == markdown
 * bruto, condição pra recuperar a posição do cursor após cada re-render.
 *
 * Gera string de HTML (não JSX) de propósito: o editor usa
 * dangerouslySetInnerHTML pra substituir o conteúdo inteiro a cada tecla —
 * deixar o React tentar "diffar" filhos JSX contra um DOM que o navegador
 * acabou de mutar por fora (digitação nativa do contentEditable) faz a
 * reconciliação se perder e duplicar texto.
 */

const MARKER_CLS = "opacity-40 select-none";

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Bloqueia esquemas perigosos (javascript:, vbscript:, data: em link de texto) — deixa http(s)/mailto/tel/relativo. */
export function safeHref(url: string): string | null {
  const trimmed = url.trim();
  if (/^(javascript|vbscript|data):/i.test(trimmed)) return null;
  return trimmed;
}

const CODE_RE = /`([^`]+)`/;
const LINK_RE = /\[([^\]]*)\]\(([^)]*)\)/;
const BOLD_RE = /(\*\*|__)(.+?)\1/;
const ITALIC_RE = /(\*|_)(.+?)\1/;

export function renderInline(text: string): string {
  if (!text) return "";

  const patterns: { re: RegExp; render: (m: RegExpMatchArray) => string }[] = [
    {
      re: CODE_RE,
      render: (m) =>
        `<code class="rounded bg-black/35 px-1 py-0.5 font-mono text-[0.92em]"><span class="${MARKER_CLS}">\`</span>${escapeHtml(
          m[1],
        )}<span class="${MARKER_CLS}">\`</span></code>`,
    },
    {
      re: LINK_RE,
      render: (m) => {
        const href = safeHref(m[2]);
        const hrefAttr = href ? ` href="${escapeHtml(href)}" data-md-link="${escapeHtml(href)}"` : "";
        return `<a${hrefAttr} class="text-dmg-red underline decoration-dmg-red/40 underline-offset-2"><span class="${MARKER_CLS}">[</span>${renderInline(
          m[1],
        )}<span class="${MARKER_CLS}">](${escapeHtml(m[2])})</span></a>`;
      },
    },
    {
      re: BOLD_RE,
      render: (m) =>
        `<strong class="font-bold text-dmg-text"><span class="${MARKER_CLS}">${m[1]}</span>${renderInline(
          m[2],
        )}<span class="${MARKER_CLS}">${m[1]}</span></strong>`,
    },
    {
      re: ITALIC_RE,
      render: (m) =>
        `<em class="italic"><span class="${MARKER_CLS}">${m[1]}</span>${escapeHtml(m[2])}<span class="${MARKER_CLS}">${m[1]}</span></em>`,
    },
  ];

  let best: { match: RegExpMatchArray; render: (m: RegExpMatchArray) => string } | null = null;
  for (const p of patterns) {
    const m = text.match(p.re);
    if (m && m.index !== undefined) {
      if (!best || m.index < (best.match.index ?? Infinity)) {
        best = { match: m, render: p.render };
      }
    }
  }

  if (!best) return escapeHtml(text);

  const idx = best.match.index!;
  const before = text.slice(0, idx);
  const after = text.slice(idx + best.match[0].length);
  return escapeHtml(before) + best.render(best.match) + renderInline(after);
}
