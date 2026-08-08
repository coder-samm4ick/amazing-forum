import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
    }

    const { avatarUrl, bannerUrl, signature, vkLink, discordTag } = await req.json();

    const updates: Record<string, unknown> = {};
    if (avatarUrl !== undefined) updates.avatarUrl = String(avatarUrl);
    if (bannerUrl !== undefined) updates.bannerUrl = String(bannerUrl);
    if (signature !== undefined) updates.signature = String(signature);
    if (vkLink !== undefined) updates.vkLink = String(vkLink);
    if (discordTag !== undefined) updates.discordTag = String(discordTag);

    await db.update(users).set(updates).where(eq(users.id, user.id));

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Update profile error:", err);
    return NextResponse.json({ error: "Ошибка при обновлении профиля" }, { status: 500 });
  }
}
