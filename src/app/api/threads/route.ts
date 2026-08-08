import { NextResponse } from "next/server";
import { db } from "@/db";
import { threads, posts, forums, users, auditLogs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Необходимо войти на сайт" }, { status: 401 });
    }

    if (user.isBanned) {
      return NextResponse.json({ error: "Ваш аккаунт заблокирован" }, { status: 403 });
    }

    const { forumId, title, content, prefix, prefixColor, isPinned } = await req.json();

    if (!forumId || !title || !content) {
      return NextResponse.json({ error: "Укажите раздел, заголовок и содержание темы" }, { status: 400 });
    }

    const cleanTitle = title.trim();
    if (cleanTitle.length < 5) {
      return NextResponse.json({ error: "Заголовок должен содержать от 5 символов" }, { status: 400 });
    }

    // Check forum exists
    const [forum] = await db.select().from(forums).where(eq(forums.id, Number(forumId))).limit(1);
    if (!forum) {
      return NextResponse.json({ error: "Указанный раздел не найден" }, { status: 404 });
    }

    if (forum.isLocked && !["owner", "ga", "zga", "admin"].includes(user.role)) {
      return NextResponse.json({ error: "Данный раздел закрыт для создания новых тем" }, { status: 403 });
    }

    // Pinned check
    const shouldPin = isPinned && ["owner", "ga", "zga", "admin", "curator"].includes(user.role);

    // Insert Thread
    const [newThread] = await db
      .insert(threads)
      .values({
        forumId: Number(forumId),
        authorId: user.id,
        title: cleanTitle,
        prefix: prefix || "",
        prefixColor: prefixColor || "amber",
        isPinned: Boolean(shouldPin),
        lastPostAuthorId: user.id,
      })
      .returning();

    // Insert initial post
    await db.insert(posts).values({
      threadId: newThread.id,
      authorId: user.id,
      content: content.trim(),
    });

    // Update counts
    await db
      .update(forums)
      .set({
        threadsCount: sql`${forums.threadsCount} + 1`,
        postsCount: sql`${forums.postsCount} + 1`,
      })
      .where(eq(forums.id, Number(forumId)));

    await db
      .update(users)
      .set({
        messagesCount: sql`${users.messagesCount} + 1`,
      })
      .where(eq(users.id, user.id));

    // Audit log
    await db.insert(auditLogs).values({
      userId: user.id,
      action: "Создание темы",
      details: `Создана тема "${cleanTitle}" (ID: ${newThread.id}) в разделе ID: ${forumId}`,
    });

    return NextResponse.json({
      success: true,
      threadId: newThread.id,
    });
  } catch (err: unknown) {
    console.error("Create thread error:", err);
    return NextResponse.json({ error: "Ошибка при создании темы" }, { status: 500 });
  }
}
