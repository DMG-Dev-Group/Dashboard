import { createFileRoute } from "@tanstack/react-router";
import { FinanceiroView } from "@/features/dashboard/views/FinanceiroView";

export const Route = createFileRoute("/_auth/financeiro")({
  component: FinanceiroView,
});
