import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Rota-layout de /projetos. Serve apenas de container para as rotas filhas:
 * a lista (index) e o detalhe ($id). Renderiza o <Outlet /> para que a página
 * de detalhe substitua a lista ao navegar para /projetos/:id.
 */
export const Route = createFileRoute("/_auth/projetos")({
  component: () => <Outlet />,
});
