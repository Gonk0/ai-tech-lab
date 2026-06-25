import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { getDb } from "@/lib/db";
import { ensureSchema } from "@/lib/db/ensure-schema";
import { contactRequests } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureSchema();
  const contacts = await getDb()
    .select()
    .from(contactRequests)
    .orderBy(desc(contactRequests.createdAt));

  return NextResponse.json({ contacts });
}
