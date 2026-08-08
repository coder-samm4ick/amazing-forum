import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";
import { eq, or } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    await ensureSeeded();
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Заполните все обязательные поля" }, { status: 400 });
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanUsername.length < 3 || cleanUsername.length > 30) {
      return NextResponse.json({ error: "Имя пользователя должно быть от 3 до 30 символов" }, { status: 400 });
    }

    if (password.length < 5) {
      return NextResponse.json({ error: "Пароль должен быть не менее 5 символов" }, { status: 400 });
    }

    // Check existing
    const existing = await db
      .select()
      .from(users)
      .where(or(eq(users.username, cleanUsername), eq(users.email, cleanEmail)))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: "Пользователь с таким никнеймом или email уже существует" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        username: cleanUsername,
        email: cleanEmail,
        passwordHash,
        role: "user",
        customTitle: "Игрок сервера BLACK",
        badgeColor: "slate",
        avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(cleanUsername)}`,
      })
      .returning();

    await setSessionCookie(newUser);

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        customTitle: newUser.customTitle,
        badgeColor: newUser.badgeColor,
        avatarUrl: newUser.avatarUrl,
      },
    });
  } catch (err: unknown) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Ошибка при регистрации" }, { status: 500 });
  }
}
