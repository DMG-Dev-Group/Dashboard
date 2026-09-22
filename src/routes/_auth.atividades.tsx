import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/AuthProvider";
import { layoutParaUser } from "@/lib/userProfile";
import { AtividadesView } from "@/features/dashboard/views/AtividadesView";
import { AtividadesViewClassic } from "@/features/dashboard/views/AtividadesViewClassic";

export const Route = createFileRoute("/_auth/atividades")({
  component: AtividadesIndex,
});

function AtividadesIndex() {
  const { user } = useAuth();
  return layoutParaUser(user) === "classic" ? <AtividadesViewClassic /> : <AtividadesView />;
}
