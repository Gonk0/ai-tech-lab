import { defineConfig } from "drizzle-kit";

const url =
  process.env.TURSO_DATABASE_URL ?? process.env.LIBSQL_URL ?? "file:./data/partners.db";
const authToken = process.env.TURSO_AUTH_TOKEN ?? process.env.LIBSQL_AUTH_TOKEN;
const isRemote = url.startsWith("libsql:");

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: isRemote ? "turso" : "sqlite",
  dbCredentials: isRemote
    ? {
        url,
        authToken: authToken ?? "",
      }
    : {
        url,
      },
});
