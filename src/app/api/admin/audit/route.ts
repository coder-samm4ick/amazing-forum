import { NextResponse } from "next/server";
import { db } from "@/db";
import { auditLogs, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "owner") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const logs = await db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        details: auditLogs.details,
        ip: auditLogs.ip,
        createdAt: auditLogs.createdAt,
        username: users.username,
        role: users.role,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .orderBy(desc(auditLogs.id))
      .limit(100);

    return NextResponse.json({ logs });
  } catch (err: unknown) {
    console.error("Fetch audit logs error:", err);
    return NextResponse.json({ error: "Ошибка при получении логов" }, { status: 500 });
  }
}
