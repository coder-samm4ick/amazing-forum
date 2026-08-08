import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = Number(id);

    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        customTitle: users.customTitle,
        badgeColor: users.badgeColor,
        avatarUrl: users.avatarUrl,
        bannerUrl: users.bannerUrl,
        signature: users.signature,
        messagesCount: users.messagesCount,
        reactionScore: users.reactionScore,
        warnings: users.warnings,
        isBanned: users.isBanned,
        vkLink: users.vkLink,
        discordTag: users.discordTag,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err: unknown) {
    console.error("Fetch profile error:", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
