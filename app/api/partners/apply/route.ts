import { partnerApplications } from "@/lib/db/schema";
import { getDb } from "@/lib/db";
import { ensureSchema } from "@/lib/db/ensure-schema";
import {
  formatZodErrors,
  partnerApplicationSchema,
} from "@/lib/partners/validation";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = partnerApplicationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fields: formatZodErrors(parsed.error) },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  try {
    await ensureSchema();
    await getDb().insert(partnerApplications).values({
      id,
      createdAt,
      organizationName: data.organizationName,
      contactName: data.contactName,
      email: data.email,
      phone: data.phone || null,
      instagram: data.instagram,
      websiteMode: data.websiteMode,
      websiteUrl: data.websiteMode === "has_site" ? data.websiteUrl : null,
      operatingSince: data.operatingSince,
      missionDescription: data.missionDescription,
      proofLinks: JSON.stringify(data.proofLinks),
      additionalNotes: data.additionalNotes || null,
      status: "pending",
    });
  } catch (error) {
    console.error("Failed to save partner application", error);
    return NextResponse.json(
      { error: "Could not save your application. Please try again later." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, id }, { status: 201 });
}
