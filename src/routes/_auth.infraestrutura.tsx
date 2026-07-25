import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/AuthProvider";
import { layoutParaUser } from "@/lib/userProfile";
import { UnderConstruction } from "@/features/dashboard/views/UnderConstruction";
import { UnderConstructionClassic } from "@/features/dashboard/views/UnderConstructionClassic";

const TITLE = "Infraestrutura";
const DESC =
  "Monitoramento real de servidores, uptime e latência. Próximo passo: integrar com a API de status dos serviços da DMG.";

export const Route = createFileRoute("/_auth/infraestrutura")({
  component: InfraestruturaIndex,
});

function InfraestruturaIndex() {
  const { user } = useAuth();
  return layoutParaUser(user) === "classic" ? (
    <UnderConstructionClassic title={TITLE} desc={DESC} />
  ) : (
    <UnderConstruction title={TITLE} desc={DESC} />
  );
}
