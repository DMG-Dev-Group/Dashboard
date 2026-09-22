import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-dmg-bg px-4 text-dmg-text">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-black text-dmg-red">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Rota não encontrada</h2>
        <p className="mt-2 text-sm text-dmg-text-2">
          A página que você tentou abrir não existe ou foi movida.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex rounded bg-dmg-red-solid px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-white hover:bg-dmg-red-hover"
        >
          Voltar para o início
        </a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-dmg-bg px-4 text-dmg-text">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Algo quebrou por aqui</h1>
        <p className="mt-2 text-sm text-dmg-text-2">
          Recarregue ou tente de novo — se persistir, avise o time.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded bg-dmg-red-solid px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-white hover:bg-dmg-red-hover"
          >
            Tentar de novo
          </button>
          <a
            href="/"
            className="rounded border border-dmg-border-strong px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] hover:border-dmg-red-dark"
          >
            Início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "DMG — Damage Group" },
      {
        name: "description",
        content:
          "Damage Group — força, inovação e liderança tecnológica. Desenvolvimento web, mobile e cloud sob medida.",
      },
      { property: "og:title", content: "DMG — Damage Group" },
      {
        property: "og:description",
        content: "Damage Group — força, inovação e liderança tecnológica.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "alternate icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" as any },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Archivo:wght@400..900&family=Geist:wght@400..900&family=Geist+Mono:wght@400..700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}
