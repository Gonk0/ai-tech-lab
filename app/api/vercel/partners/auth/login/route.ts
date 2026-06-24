import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateAdmin, adminSetupRequired } from "@/lib/admin/auth";

const loginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (await adminSetupRequired()) {
    return NextResponse.json({ error: "Admin setup is required first" }, { status: 400 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Validation failed" },
      { status: 400 },
    );
  }

  const authenticated = await authenticateAdmin(parsed.data.password);

  if (!authenticated) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
