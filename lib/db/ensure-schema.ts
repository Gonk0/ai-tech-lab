import { sql } from "drizzle-orm";
import { getDb } from "./index";

let schemaReady: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const db = getDb();

      await db.run(sql`
        CREATE TABLE IF NOT EXISTS partner_applications (
          id TEXT PRIMARY KEY NOT NULL,
          created_at TEXT NOT NULL,
          organization_name TEXT NOT NULL,
          contact_name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          instagram TEXT NOT NULL,
          website_mode TEXT NOT NULL,
          website_url TEXT,
          operating_since TEXT NOT NULL,
          mission_description TEXT NOT NULL,
          proof_links TEXT NOT NULL,
          additional_notes TEXT,
          status TEXT NOT NULL DEFAULT 'pending'
        )
      `);

      await db.run(sql`
        CREATE TABLE IF NOT EXISTS admin_users (
          id TEXT PRIMARY KEY NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `);
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }

  return schemaReady;
}
