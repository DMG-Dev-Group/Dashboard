import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/AuthProvider";
import { layoutParaUser } from "@/lib/userProfile";
import { EquipeView } from "@/features/dashboard/views/EquipeView";
import { EquipeViewClassic } from "@/features/dashboard/views/EquipeViewClassic";

export const Route = createFileRoute("/_auth/equipe")({
  component: EquipeIndex,
});

function EquipeIndex() {
  const { user } = useAuth();
  return layoutParaUser(user) === "classic" ? <EquipeViewClassic /> : <EquipeView />;
}
