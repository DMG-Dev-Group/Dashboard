import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/AuthProvider";
import { layoutParaUser } from "@/lib/userProfile";
import { UnderConstruction } from "@/features/dashboard/views/UnderConstruction";
import { UnderConstructionClassic } from "@/features/dashboard/views/UnderConstructionClassic";

const TITLE = "Segurança";
const DESC =
  "Logs de firewall, tentativas de acesso e auditoria. Próximo passo: definir as fontes de dados junto com a equipe.";

export const Route = createFileRoute("/_auth/seguranca")({
  component: SegurancaIndex,
});

function SegurancaIndex() {
  const { user } = useAuth();
  return layoutParaUser(user) === "classic" ? (
    <UnderConstructionClassic title={TITLE} desc={DESC} />
  ) : (
    <UnderConstruction title={TITLE} desc={DESC} />
  );
}
