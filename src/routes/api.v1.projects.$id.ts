import { createFileRoute } from "@tanstack/react-router";
import { requireServiceAuthorization } from "@/lib/dashboard-api/auth";
import { errorResponse, handleOptions, json } from "@/lib/dashboard-api/http";
import { getProject } from "@/lib/dashboard-api/projects";

export const Route = createFileRoute("/api/v1/projects/$id")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        try {
          requireServiceAuthorization(request);
          return json(request, { data: await getProject(params.id) });
        } catch (error) {
          return errorResponse(request, error);
        }
      },
      OPTIONS: async ({ request }) => handleOptions(request),
    },
  },
});
