import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/AuthProvider";
import { layoutParaUser } from "@/lib/userProfile";
import { ConfigView } from "@/features/dashboard/views/ConfigView";
import { ConfigViewClassic } from "@/features/dashboard/views/ConfigViewClassic";

export const Route = createFileRoute("/_auth/config")({
  component: ConfigIndex,
});

function ConfigIndex() {
  const { user } = useAuth();
  return layoutParaUser(user) === "classic" ? <ConfigViewClassic /> : <ConfigView />;
}
