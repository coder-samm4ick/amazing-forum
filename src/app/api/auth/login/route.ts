import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { comparePassword, setSessionCookie } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    await ensureSeeded();
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Введите логин и пароль" }, { status: 400 });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username.trim()))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "Пользователь с таким логином не найден" }, { status: 401 });
    }

    if (user.isBanned) {
      return NextResponse.json({ 
        error: `Ваш аккаунт заблокирован. Причина: ${user.banReason || "Нарушение правил форума"}` 
      }, { status: 403 });
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
    }

    // Update last seen
    await db.update(users).set({ lastSeen: new Date() }).where(eq(users.id, user.id));

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
    console.error("Login error:", err);
    return NextResponse.json({ error: "Ошибка при входе в аккаунт" }, { status: 500 });
  }
}
