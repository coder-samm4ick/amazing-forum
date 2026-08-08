import { NextResponse } from "next/server";
import { db } from "@/db";
import { posts, threads, forums, users, notifications } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
    }

    if (user.isBanned) {
      return NextResponse.json({ error: "Ваш аккаунт заблокирован" }, { status: 403 });
    }

    const { threadId, content } = await req.json();

    if (!threadId || !content || !content.trim()) {
      return NextResponse.json({ error: "Сообщение не может быть пустым" }, { status: 400 });
    }

    const [thread] = await db.select().from(threads).where(eq(threads.id, Number(threadId))).limit(1);
    if (!thread) {
      return NextResponse.json({ error: "Тема не найдена" }, { status: 404 });
    }

    if (thread.isLocked && !["owner", "ga", "zga", "admin", "curator"].includes(user.role)) {
      return NextResponse.json({ error: "Эта тема закрыта для ответов" }, { status: 403 });
    }

    // Insert new post
    const [newPost] = await db
      .insert(posts)
      .values({
        threadId: Number(threadId),
        authorId: user.id,
        content: content.trim(),
      })
      .returning();

    // Update thread details
    await db
      .update(threads)
      .set({
        postsCount: sql`${threads.postsCount} + 1`,
        lastPostAt: new Date(),
        lastPostAuthorId: user.id,
      })
      .where(eq(threads.id, Number(threadId)));

    // Update forum post count
    await db
      .update(forums)
      .set({
        postsCount: sql`${forums.postsCount} + 1`,
      })
      .where(eq(forums.id, thread.forumId));

    // Update user post count
    await db
      .update(users)
      .set({
        messagesCount: sql`${users.messagesCount} + 1`,
      })
      .where(eq(users.id, user.id));

    // Notify thread author if different user
    if (thread.authorId !== user.id) {
      await db.insert(notifications).values({
        userId: thread.authorId,
        senderId: user.id,
        type: "reply",
        title: `${user.username} ответил в вашей теме "${thread.title}"`,
        link: `/threads/${thread.id}#post-${newPost.id}`,
      });
    }

    return NextResponse.json({
      success: true,
      post: newPost,
    });
  } catch (err: unknown) {
    console.error("Create post error:", err);
    return NextResponse.json({ error: "Ошибка отправки ответа" }, { status: 500 });
  }
}
