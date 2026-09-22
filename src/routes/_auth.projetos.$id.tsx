import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/AuthProvider";
import { layoutParaUser } from "@/lib/userProfile";
import { ProjetoDetalheView } from "@/features/dashboard/views/ProjetoDetalheView";
import { ProjetoDetalheViewClassic } from "@/features/dashboard/views/ProjetoDetalheViewClassic";

export const Route = createFileRoute("/_auth/projetos/$id")({
  component: ProjetoDetalheIndex,
});

function ProjetoDetalheIndex() {
  const { user } = useAuth();
  return layoutParaUser(user) === "classic" ? <ProjetoDetalheViewClassic /> : <ProjetoDetalheView />;
}
