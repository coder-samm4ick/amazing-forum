import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";

export async function GET() {
  await ensureSeeded();
  const user = await getCurrentUser();
  return NextResponse.json({ user });
}
