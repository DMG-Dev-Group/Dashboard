import { createFileRoute } from "@tanstack/react-router";
import { UnderConstruction } from "@/features/dashboard/views/UnderConstruction";

export const Route = createFileRoute("/_auth/infraestrutura")({
  component: () => (
    <UnderConstruction
      title="Infraestrutura"
      desc="Monitoramento real de servidores, uptime e latência. Próximo passo: integrar com a API de status dos serviços da DMG."
    />
  ),
});
