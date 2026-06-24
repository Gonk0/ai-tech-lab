import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";

type Db = LibSQLDatabase<typeof schema>;

declare global {
  var __partnerDb: Db | undefined;
  var __libsqlClient: Client | undefined;
}

function resolveDatabaseUrl(): string {
  const configured = process.env.TURSO_DATABASE_URL ?? process.env.LIBSQL_URL;
  if (configured) return configured;

  if (process.env.NEXT_PHASE === "phase-production-build") {
    return ":memory:";
  }

  return "file:./data/partners.db";
}

function createDbClient(): Client {
  const url = resolveDatabaseUrl();
  const authToken = process.env.TURSO_AUTH_TOKEN ?? process.env.LIBSQL_AUTH_TOKEN;

  return createClient(authToken ? { url, authToken } : { url });
}

export function getDb(): Db {
  if (!global.__partnerDb) {
    if (!global.__libsqlClient) {
      global.__libsqlClient = createDbClient();
    }
    global.__partnerDb = drizzle(global.__libsqlClient, { schema });
  }

  return global.__partnerDb;
}
