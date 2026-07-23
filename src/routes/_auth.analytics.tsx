import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsView } from "@/features/dashboard/views/AnalyticsView";

export const Route = createFileRoute("/_auth/analytics")({
  component: AnalyticsView,
});
