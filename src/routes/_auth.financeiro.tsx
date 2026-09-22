import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/AuthProvider";
import { layoutParaUser } from "@/lib/userProfile";
import { FinanceiroView } from "@/features/dashboard/views/FinanceiroView";
import { FinanceiroViewClassic } from "@/features/dashboard/views/FinanceiroViewClassic";

export const Route = createFileRoute("/_auth/financeiro")({
  component: FinanceiroIndex,
});

function FinanceiroIndex() {
  const { user } = useAuth();
  return layoutParaUser(user) === "classic" ? <FinanceiroViewClassic /> : <FinanceiroView />;
}
