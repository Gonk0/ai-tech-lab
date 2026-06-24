import { NextResponse } from "next/server";
import { adminSetupRequired, getSession } from "@/lib/admin/auth";

export async function GET() {
  const [setupRequired, session] = await Promise.all([adminSetupRequired(), getSession()]);

  return NextResponse.json({
    setupRequired,
    authenticated: Boolean(session),
    email: session?.email ?? null,
  });
}
