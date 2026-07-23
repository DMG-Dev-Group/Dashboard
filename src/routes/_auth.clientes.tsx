import { createFileRoute } from "@tanstack/react-router";
import { ClientesView } from "@/features/dashboard/views/ClientesView";

export const Route = createFileRoute("/_auth/clientes")({
  component: ClientesView,
});
