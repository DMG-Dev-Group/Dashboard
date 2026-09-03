import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/AuthProvider";
import { layoutParaUser } from "@/lib/userProfile";
import { LeadsView } from "@/features/dashboard/views/LeadsView";
import { LeadsViewClassic } from "@/features/dashboard/views/LeadsViewClassic";

export const Route = createFileRoute("/_auth/leads")({
  component: LeadsIndex,
});

function LeadsIndex() {
  const { user } = useAuth();
  return layoutParaUser(user) === "classic" ? <LeadsViewClassic /> : <LeadsView />;
}
