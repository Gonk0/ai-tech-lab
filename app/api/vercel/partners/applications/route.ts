import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import { partnerApplications } from "@/lib/db/schema";

export async function GET() {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const applications = await db
    .select()
    .from(partnerApplications)
    .orderBy(desc(partnerApplications.createdAt));

  return NextResponse.json({
    applications: applications.map((application) => ({
      ...application,
      proofLinks: JSON.parse(application.proofLinks) as string[],
    })),
  });
}
