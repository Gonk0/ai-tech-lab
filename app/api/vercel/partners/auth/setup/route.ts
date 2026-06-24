import { NextResponse } from "next/server";
import { z } from "zod";
import { createInitialAdmin, createSession } from "@/lib/admin/auth";
import { ADMIN_EMAIL } from "@/lib/admin/constants";

const setupSchema = z
  .object({
    password: z.string().min(12, "Password must be at least 12 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = setupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Validation failed" },
      { status: 400 },
    );
  }

  try {
    await createInitialAdmin(parsed.data.password);
    await createSession(ADMIN_EMAIL);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Setup failed";

    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
