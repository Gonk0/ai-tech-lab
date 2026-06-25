import { contactRequests } from "@/lib/db/schema";
import { getDb } from "@/lib/db";
import { ensureSchema } from "@/lib/db/ensure-schema";
import { contactRequestSchema, formatContactErrors } from "@/lib/contact/validation";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = contactRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        fields: formatContactErrors(parsed.error, {
          required: "Required",
          invalidEmail: "Invalid email",
          minMessage: "Message too short",
        }),
      },
      { status: 400 },
    );
  }

  const data = parsed.data;

  try {
    await ensureSchema();
    await getDb().insert(contactRequests).values({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      message: data.message,
      status: "pending",
    });
  } catch (error) {
    console.error("Failed to save contact request", error);
    return NextResponse.json({ error: "Could not save your message" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
