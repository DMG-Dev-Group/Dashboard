import { createFileRoute } from "@tanstack/react-router";
import { requireServiceAuthorization } from "@/lib/dashboard-api/auth";
import { ApiError, errorResponse, handleOptions, json } from "@/lib/dashboard-api/http";
import { resolveProject } from "@/lib/dashboard-api/projects";

export const Route = createFileRoute("/api/v1/projects/resolve")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          requireServiceAuthorization(request);
          const reference = new URL(request.url).searchParams.get("q");
          if (!reference)
            throw new ApiError(400, "invalid_project_reference", "Informe o parâmetro q.");
          return json(request, { data: await resolveProject(reference) });
        } catch (error) {
          return errorResponse(request, error);
        }
      },
      OPTIONS: async ({ request }) => handleOptions(request),
    },
  },
});
