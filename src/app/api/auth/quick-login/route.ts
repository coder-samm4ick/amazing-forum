import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { setSessionCookie } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    await ensureSeeded();
    const { username } = await req.json();

    const targetUsername = username || "Ender_Owner";

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, targetUsername))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    await setSessionCookie(user);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        customTitle: user.customTitle,
        badgeColor: user.badgeColor,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err: unknown) {
    console.error("Quick login error:", err);
    return NextResponse.json({ error: "Ошибка быстрый вход" }, { status: 500 });
  }
}
