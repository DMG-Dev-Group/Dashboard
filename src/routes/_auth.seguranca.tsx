import { createFileRoute } from "@tanstack/react-router";
import { UnderConstruction } from "@/features/dashboard/views/UnderConstruction";

export const Route = createFileRoute("/_auth/seguranca")({
  component: () => (
    <UnderConstruction
      title="Segurança"
      desc="Logs de firewall, tentativas de acesso e auditoria. Próximo passo: definir as fontes de dados junto com a equipe."
    />
  ),
});
