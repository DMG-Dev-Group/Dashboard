import { createFileRoute } from "@tanstack/react-router";
import { requireServiceAuthorization } from "@/lib/dashboard-api/auth";
import { errorResponse, handleOptions, json } from "@/lib/dashboard-api/http";
import { listProjects } from "@/lib/dashboard-api/projects";

export const Route = createFileRoute("/api/v1/projects")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          requireServiceAuthorization(request);
          const query = new URL(request.url).searchParams.get("q") ?? undefined;
          return json(request, { data: await listProjects(query) });
        } catch (error) {
          return errorResponse(request, error);
        }
      },
      OPTIONS: async ({ request }) => handleOptions(request),
    },
  },
});
