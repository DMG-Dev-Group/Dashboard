import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/AuthProvider";
import { layoutParaUser } from "@/lib/userProfile";
import { NotasViewModern } from "@/features/dashboard/views/NotasViewModern";
import { NotasViewClassic } from "@/features/dashboard/views/NotasViewClassic";

export const Route = createFileRoute("/_auth/notas")({
  component: NotasIndex,
});

function NotasIndex() {
  const { user } = useAuth();
  return layoutParaUser(user) === "classic" ? <NotasViewClassic /> : <NotasViewModern />;
}
