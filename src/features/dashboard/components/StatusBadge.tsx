import { STATUS } from "@/lib/store/constants";
import type { ProjectStatus } from "@/lib/store/types";

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const s = STATUS[status] ?? STATUS.plan;
  return (
    <span
      className={`inline-flex rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${s.cls}`}
    >
      {s.label}
    </span>
  );
}
