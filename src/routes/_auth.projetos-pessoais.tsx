import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/AuthProvider";
import { layoutParaUser } from "@/lib/userProfile";
import { ProjetosPessoaisView } from "@/features/dashboard/views/ProjetosPessoaisView";
import { ProjetosPessoaisViewClassic } from "@/features/dashboard/views/ProjetosPessoaisViewClassic";

export const Route = createFileRoute("/_auth/projetos-pessoais")({
  component: ProjetosPessoaisIndex,
});

function ProjetosPessoaisIndex() {
  const { user } = useAuth();
  return layoutParaUser(user) === "classic" ? (
    <ProjetosPessoaisViewClassic />
  ) : (
    <ProjetosPessoaisView />
  );
}
