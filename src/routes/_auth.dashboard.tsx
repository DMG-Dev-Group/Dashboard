import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/AuthProvider";
import { layoutParaUser } from "@/lib/userProfile";
import { DashboardOverviewModern } from "@/features/dashboard/views/DashboardOverviewModern";
import { DashboardOverviewClassic } from "@/features/dashboard/views/DashboardOverviewClassic";

export const Route = createFileRoute("/_auth/dashboard")({
  component: DashboardIndex,
});

function DashboardIndex() {
  const { user } = useAuth();
  return layoutParaUser(user) === "classic" ? (
    <DashboardOverviewClassic />
  ) : (
    <DashboardOverviewModern />
  );
}
