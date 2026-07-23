import { createFileRoute } from "@tanstack/react-router";
import { CalendarioView } from "@/features/dashboard/views/CalendarioView";

export const Route = createFileRoute("/_auth/calendario")({
  component: CalendarioView,
});
