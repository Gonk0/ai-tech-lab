import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { getDb } from "@/lib/db";
import { ensureSchema } from "@/lib/db/ensure-schema";
import { partnerApplications } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const applications = await ensureSchema().then(() =>
    getDb()
      .select()
      .from(partnerApplications)
      .orderBy(desc(partnerApplications.createdAt)),
  );

  return NextResponse.json({
    applications: applications.map((application) => ({
      ...application,
      proofLinks: JSON.parse(application.proofLinks) as string[],
    })),
  });
}
