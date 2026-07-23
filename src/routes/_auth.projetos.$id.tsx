import { createFileRoute } from "@tanstack/react-router";
import { ProjetoDetalheView } from "@/features/dashboard/views/ProjetoDetalheView";

export const Route = createFileRoute("/_auth/projetos/$id")({
  component: ProjetoDetalheView,
});
