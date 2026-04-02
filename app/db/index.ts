import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

type DatabaseEnv = {
  DB: D1Database;
};

export function getDb(env: DatabaseEnv) {
  return drizzle(env.DB, { schema });
}

export type DbClient = ReturnType<typeof getDb>;
