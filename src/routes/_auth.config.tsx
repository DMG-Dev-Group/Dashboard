import { createFileRoute } from "@tanstack/react-router";
import { ConfigView } from "@/features/dashboard/views/ConfigView";

export const Route = createFileRoute("/_auth/config")({
  component: ConfigView,
});
