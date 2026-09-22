import { useRef, useState, type DragEvent } from "react";

/**
 * Reordenação por arrastar-e-soltar genérica, via HTML5 DnD nativo (sem lib
 * extra). Usada em listas de to-do e na sidebar personalizável — a ordem
 * final é só o array reordenado, quem persiste é o chamador.
 */
export function useDragReorder<T>(items: T[], onReorder: (next: T[]) => void) {
  const dragIndex = useRef<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  function getDragProps(index: number) {
    return {
      draggable: true,
      onDragStart: (e: DragEvent) => {
        dragIndex.current = index;
        setDraggingIndex(index);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", String(index));
      },
      onDragOver: (e: DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (overIndex !== index) setOverIndex(index);
      },
      onDrop: (e: DragEvent) => {
        e.preventDefault();
        const from = dragIndex.current;
        setOverIndex(null);
        setDraggingIndex(null);
        dragIndex.current = null;
        if (from === null || from === index) return;
        const next = items.slice();
        const [moved] = next.splice(from, 1);
        next.splice(index, 0, moved);
        onReorder(next);
      },
      onDragEnd: () => {
        dragIndex.current = null;
        setDraggingIndex(null);
        setOverIndex(null);
      },
    };
  }

  return { getDragProps, overIndex, draggingIndex };
}
