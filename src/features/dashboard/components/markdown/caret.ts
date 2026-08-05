/**
 * Como o editor re-renderiza a árvore inteira a cada tecla (pra aplicar
 * formatação ao vivo), o cursor precisa ser salvo/restaurado manualmente —
 * o navegador perde a posição quando o DOM é substituído. Funciona porque o
 * texto real (textContent) sempre é idêntico à fonte markdown: nada de
 * sintaxe é escondido, só estilizado.
 */

export function getCaretOffset(root: HTMLElement): number | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  if (!root.contains(range.startContainer)) return null;
  const pre = range.cloneRange();
  pre.selectNodeContents(root);
  pre.setEnd(range.startContainer, range.startOffset);
  return pre.toString().length;
}

/**
 * Início e fim da seleção atual (iguais quando é só um cursor). Usado antes
 * de inserções programáticas (colar, imagem) — sem isso, colar por cima de
 * um texto selecionado insere no início e deixa o texto selecionado intacto
 * em vez de substituí-lo.
 */
export function getCaretRange(root: HTMLElement): { start: number; end: number } | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return null;
  const preStart = range.cloneRange();
  preStart.selectNodeContents(root);
  preStart.setEnd(range.startContainer, range.startOffset);
  const preEnd = range.cloneRange();
  preEnd.selectNodeContents(root);
  preEnd.setEnd(range.endContainer, range.endOffset);
  return { start: preStart.toString().length, end: preEnd.toString().length };
}

/**
 * Próxima posição "editável" depois de `node`, andando pelo DOM (irmão
 * seguinte, ou sobe até achar um, sem passar de `root`). Usado quando o
 * offset alvo cai exatamente no fim de um nó de texto: pousar o cursor no
 * início do nó seguinte é mais confiável do que no fim do atual — o Chrome
 * às vezes desloca o cursor pro lugar errado ao digitar em seguida quando
 * ele fica "no fim" de um nó de texto curto (ex.: um "\n" sozinho entre
 * duas linhas).
 */
function nextEditablePosition(root: HTMLElement, node: Node): { node: Node; offset: number } | null {
  let current: Node | null = node;
  while (current && current !== root) {
    if (current.nextSibling) return { node: current.nextSibling, offset: 0 };
    current = current.parentNode;
  }
  return null;
}

export function setCaretOffset(root: HTMLElement, offset: number) {
  const sel = window.getSelection();
  if (!sel) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) textNodes.push(n as Text);

  let remaining = offset;
  let target: { node: Node; offset: number } | null = null;

  for (const node of textNodes) {
    const len = node.textContent?.length ?? 0;
    if (remaining < len) {
      target = { node, offset: remaining };
      break;
    }
    if (remaining === len) {
      target = nextEditablePosition(root, node) ?? { node, offset: len };
      break;
    }
    remaining -= len;
  }

  const range = document.createRange();
  if (target) {
    range.setStart(target.node, target.offset);
  } else {
    range.selectNodeContents(root);
    range.collapse(false);
  }
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}
