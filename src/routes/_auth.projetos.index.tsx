import { createFileRoute } from "@tanstack/react-router";
import { ProjetosView } from "@/features/dashboard/views/ProjetosView";

export const Route = createFileRoute("/_auth/projetos/")({
  component: ProjetosView,
});
