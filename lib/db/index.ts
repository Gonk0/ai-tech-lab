import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";

type Db = LibSQLDatabase<typeof schema>;

declare global {
  var __partnerDb: Db | undefined;
  var __libsqlClient: Client | undefined;
}

function createDbClient(): Client {
  const url =
    process.env.TURSO_DATABASE_URL ?? process.env.LIBSQL_URL ?? "file:./data/partners.db";
  const authToken = process.env.TURSO_AUTH_TOKEN ?? process.env.LIBSQL_AUTH_TOKEN;

  return createClient(authToken ? { url, authToken } : { url });
}

function getDb(): Db {
  if (!global.__partnerDb) {
    if (!global.__libsqlClient) {
      global.__libsqlClient = createDbClient();
    }
    global.__partnerDb = drizzle(global.__libsqlClient, { schema });
  }

  return global.__partnerDb;
}

export const db = getDb();
