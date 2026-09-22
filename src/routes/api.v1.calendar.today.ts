import { createFileRoute } from "@tanstack/react-router";
import { requireServiceAuthorization } from "@/lib/dashboard-api/auth";
import { ApiError, errorResponse, handleOptions, json } from "@/lib/dashboard-api/http";
import { listTodayCalendarEvents } from "@/lib/dashboard-api/projects";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const Route = createFileRoute("/api/v1/calendar/today")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          requireServiceAuthorization(request);
          const date = new URL(request.url).searchParams.get("date");
          if (!date || !ISO_DATE.test(date)) {
            throw new ApiError(400, "invalid_date", "Informe date no formato YYYY-MM-DD.");
          }
          return json(request, { data: await listTodayCalendarEvents(date) });
        } catch (error) {
          return errorResponse(request, error);
        }
      },
      OPTIONS: async ({ request }) => handleOptions(request),
    },
  },
});
