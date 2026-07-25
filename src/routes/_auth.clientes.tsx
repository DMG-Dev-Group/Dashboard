import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/AuthProvider";
import { layoutParaUser } from "@/lib/userProfile";
import { ClientesView } from "@/features/dashboard/views/ClientesView";
import { ClientesViewClassic } from "@/features/dashboard/views/ClientesViewClassic";

export const Route = createFileRoute("/_auth/clientes")({
  component: ClientesIndex,
});

function ClientesIndex() {
  const { user } = useAuth();
  return layoutParaUser(user) === "classic" ? <ClientesViewClassic /> : <ClientesView />;
}
