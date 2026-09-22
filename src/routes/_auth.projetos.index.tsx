import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/AuthProvider";
import { layoutParaUser } from "@/lib/userProfile";
import { ProjetosView } from "@/features/dashboard/views/ProjetosView";
import { ProjetosViewClassic } from "@/features/dashboard/views/ProjetosViewClassic";

export const Route = createFileRoute("/_auth/projetos/")({
  component: ProjetosIndex,
});

function ProjetosIndex() {
  const { user } = useAuth();
  return layoutParaUser(user) === "classic" ? <ProjetosViewClassic /> : <ProjetosView />;
}
