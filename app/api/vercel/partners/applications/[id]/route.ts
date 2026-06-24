import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/auth";
import { getDb } from "@/lib/db";
import { ensureSchema } from "@/lib/db/ensure-schema";
import { partnerApplications } from "@/lib/db/schema";

const updateSchema = z.object({
  status: z.enum(["pending", "reviewed", "accepted", "rejected"]),
});

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Validation failed" },
      { status: 400 },
    );
  }

  await ensureSchema();

  const result = await getDb()
    .update(partnerApplications)
    .set({ status: parsed.data.status })
    .where(eq(partnerApplications.id, id))
    .returning({ id: partnerApplications.id });

  if (result.length === 0) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
