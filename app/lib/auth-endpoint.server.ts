import { createAuth, type AuthEnv } from "@/lib/auth.server";

type AuthHandlerRequest = {
  request: Request;
  env: AuthEnv;
  path: `/api/auth/${string}`;
  method?: "GET" | "POST";
  body?: Record<string, unknown>;
};

export async function callAuthEndpoint({
  request,
  env,
  path,
  method = "POST",
  body,
}: AuthHandlerRequest) {
  const headers = new Headers(request.headers);

  if (body) {
    headers.set("content-type", "application/json");
  } else {
    headers.delete("content-type");
  }

  const authRequest = new Request(new URL(path, request.url), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  return createAuth(env).handler(authRequest);
}

export async function getAuthErrorMessage(response: Response) {
  const fallback = `Request failed with status ${response.status}`;

  try {
    const payload = (await response.json()) as {
      message?: string;
      error?: { message?: string };
    };

    return payload.error?.message ?? payload.message ?? fallback;
  } catch {
    return fallback;
  }
}
