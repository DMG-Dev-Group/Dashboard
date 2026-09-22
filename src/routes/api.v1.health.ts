import { createFileRoute } from "@tanstack/react-router";
import { hasDashboardApiConfig } from "@/lib/dashboard-api/config";
import { errorResponse, handleOptions, json } from "@/lib/dashboard-api/http";

export const Route = createFileRoute("/api/v1/health")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          return json(request, {
            status: hasDashboardApiConfig() ? "ready" : "not_configured",
            service: "dashboard-api",
            version: "v1",
          });
        } catch (error) {
          return errorResponse(request, error);
        }
      },
      OPTIONS: async ({ request }) => handleOptions(request),
    },
  },
});
