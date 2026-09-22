import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/AuthProvider";
import { layoutParaUser } from "@/lib/userProfile";
import { CalendarioView } from "@/features/dashboard/views/CalendarioView";
import { CalendarioViewClassic } from "@/features/dashboard/views/CalendarioViewClassic";

export const Route = createFileRoute("/_auth/calendario")({
  component: CalendarioIndex,
});

function CalendarioIndex() {
  const { user } = useAuth();
  return layoutParaUser(user) === "classic" ? <CalendarioViewClassic /> : <CalendarioView />;
}
