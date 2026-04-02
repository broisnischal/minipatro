import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "@/db";
import * as schema from "@/db/schema";

export type AuthEnv = {
  DB: D1Database;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
};

function getSecretOrThrow(env: AuthEnv) {
  if (!env.BETTER_AUTH_SECRET) {
    throw new Error(
      "Missing BETTER_AUTH_SECRET. Set it with `wrangler secret put BETTER_AUTH_SECRET`."
    );
  }

  return env.BETTER_AUTH_SECRET;
}

export function createAuth(env: AuthEnv) {
  const db = getDb(env);

  return betterAuth({
    secret: getSecretOrThrow(env),
    baseURL: env.BETTER_AUTH_URL,
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema,
    }),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
  });
}

export async function getServerSession(request: Request, env: AuthEnv) {
  if (!env.BETTER_AUTH_SECRET) {
    return null;
  }

  return createAuth(env).api.getSession({
    headers: request.headers,
  });
}
