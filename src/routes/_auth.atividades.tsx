import { createFileRoute } from "@tanstack/react-router";
import { AtividadesView } from "@/features/dashboard/views/AtividadesView";

export const Route = createFileRoute("/_auth/atividades")({
  component: AtividadesView,
});
