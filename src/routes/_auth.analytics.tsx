import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/AuthProvider";
import { layoutParaUser } from "@/lib/userProfile";
import { AnalyticsView } from "@/features/dashboard/views/AnalyticsView";
import { AnalyticsViewClassic } from "@/features/dashboard/views/AnalyticsViewClassic";

export const Route = createFileRoute("/_auth/analytics")({
  component: AnalyticsIndex,
});

function AnalyticsIndex() {
  const { user } = useAuth();
  return layoutParaUser(user) === "classic" ? <AnalyticsViewClassic /> : <AnalyticsView />;
}
