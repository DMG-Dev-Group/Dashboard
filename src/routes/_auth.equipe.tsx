import { createFileRoute } from "@tanstack/react-router";
import { EquipeView } from "@/features/dashboard/views/EquipeView";

export const Route = createFileRoute("/_auth/equipe")({
  component: EquipeView,
});
