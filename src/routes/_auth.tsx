import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AuthProvider, useAuth } from "@/features/auth/AuthProvider";
import { LoginScreen } from "@/features/auth/LoginScreen";
import { StoreProvider } from "@/lib/store/StoreProvider";
import { ModernLayout } from "@/features/dashboard/layouts/ModernLayout";
import { ClassicLayout } from "@/features/dashboard/layouts/ClassicLayout";
import { ModalProvider } from "@/features/dashboard/modals/ModalProvider";
import { ConfirmProvider } from "@/features/dashboard/components/ConfirmProvider";
import { layoutParaUser } from "@/lib/userProfile";

/**
 * Layout raiz do painel. Firebase é client-only, então este subtree não é SSR.
 * Decide qual visual (Modern/Classic) mostrar a partir do UID do usuário.
 */
export const Route = createFileRoute("/_auth")({
  ssr: false,
  component: AuthShell,
});

function AuthShell() {
  return (
    <AuthProvider>
      <AuthedContent />
    </AuthProvider>
  );
}

function AuthedContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dmg-bg text-dmg-text-3 font-mono text-xs uppercase tracking-[0.24em]">
        // conectando…
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  const variant = layoutParaUser(user);
  const Layout = variant === "classic" ? ClassicLayout : ModernLayout;

  return (
    <StoreProvider>
      <ConfirmProvider>
        <ModalProvider>
          <Layout>
            <Outlet />
          </Layout>
        </ModalProvider>
      </ConfirmProvider>
    </StoreProvider>
  );
}
