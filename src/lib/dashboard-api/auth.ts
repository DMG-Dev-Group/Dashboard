import { getDashboardApiConfig } from "./config";
import { ApiError } from "./http";

function secureEquals(left: string, right: string): boolean {
  const leftBytes = new TextEncoder().encode(left);
  const rightBytes = new TextEncoder().encode(right);
  let difference = leftBytes.length ^ rightBytes.length;
  const size = Math.max(leftBytes.length, rightBytes.length);

  for (let index = 0; index < size; index += 1) {
    difference |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  }

  return difference === 0;
}

export function requireServiceAuthorization(request: Request): void {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined;

  if (!token) {
    throw new ApiError(401, "unauthorized", "Credencial de serviço inválida ou ausente.");
  }

  let apiKey: string;
  try {
    apiKey = getDashboardApiConfig().apiKey;
  } catch {
    throw new ApiError(
      503,
      "service_not_configured",
      "A API do Dashboard ainda não recebeu suas credenciais de ambiente.",
    );
  }

  if (!secureEquals(token, apiKey)) {
    throw new ApiError(401, "unauthorized", "Credencial de serviço inválida ou ausente.");
  }
}
