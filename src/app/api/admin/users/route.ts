import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, auditLogs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !["owner", "ga", "zga"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Доступ разрешен только руководству (Основатель/ГА/ЗГА)" }, { status: 403 });
    }

    const allUsers = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        customTitle: users.customTitle,
        badgeColor: users.badgeColor,
        reputation: users.reputation,
        messagesCount: users.messagesCount,
        reactionScore: users.reactionScore,
        warnings: users.warnings,
        isBanned: users.isBanned,
        banReason: users.banReason,
        createdAt: users.createdAt,
        lastSeen: users.lastSeen,
      })
      .from(users)
      .orderBy(desc(users.id));

    return NextResponse.json({ users: allUsers });
  } catch (err: unknown) {
    console.error("Admin fetch users error:", err);
    return NextResponse.json({ error: "Ошибка при получении списка пользователей" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "owner") {
      return NextResponse.json({ error: "Только Владелец / Основатель проекта может менять роли и статусы игроков!" }, { status: 403 });
    }

    const { userId, role, customTitle, badgeColor, warnings, isBanned, banReason } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Укажите ID пользователя" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};

    if (role !== undefined) updates.role = role;
    if (customTitle !== undefined) updates.customTitle = customTitle;
    if (badgeColor !== undefined) updates.badgeColor = badgeColor;
    if (warnings !== undefined) updates.warnings = Number(warnings);
    if (isBanned !== undefined) updates.isBanned = Boolean(isBanned);
    if (banReason !== undefined) updates.banReason = String(banReason);

    await db.update(users).set(updates).where(eq(users.id, Number(userId)));

    await db.insert(auditLogs).values({
      userId: currentUser.id,
      action: "Админ-панель: Обновление пользователя",
      details: `Обновлены данные пользователя ID ${userId} (${JSON.stringify(updates)})`,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Admin update user error:", err);
    return NextResponse.json({ error: "Ошибка при обновлении пользователя" }, { status: 500 });
  }
}
