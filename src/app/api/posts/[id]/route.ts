import { NextResponse } from "next/server";
import { db } from "@/db";
import { posts, threads, forums } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Авторизуйтесь для редактирования" }, { status: 401 });
    }

    const { id } = await params;
    const postId = Number(id);
    const { content } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Сообщение не может быть пустым" }, { status: 400 });
    }

    const [post] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
    if (!post) {
      return NextResponse.json({ error: "Сообщение не найдено" }, { status: 404 });
    }

    const isAuthor = post.authorId === user.id;
    const isStaff = ["owner", "ga", "zga", "admin"].includes(user.role);

    if (!isAuthor && !isStaff) {
      return NextResponse.json({ error: "Нет прав на редактирование сообщения" }, { status: 403 });
    }

    await db
      .update(posts)
      .set({
        content: content.trim(),
        editedAt: new Date(),
        editedBy: user.id,
      })
      .where(eq(posts.id, postId));

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Edit post error:", err);
    return NextResponse.json({ error: "Ошибка при редактировании" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
    }

    const { id } = await params;
    const postId = Number(id);

    const [post] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
    if (!post) {
      return NextResponse.json({ error: "Сообщение не найдено" }, { status: 404 });
    }

    const isAuthor = post.authorId === user.id;
    const isStaff = ["owner", "ga", "zga", "admin"].includes(user.role);

    if (!isAuthor && !isStaff) {
      return NextResponse.json({ error: "Нет прав для удаления" }, { status: 403 });
    }

    await db.delete(posts).where(eq(posts.id, postId));

    // Decrement counts
    await db
      .update(threads)
      .set({ postsCount: sql`GREATEST(${threads.postsCount} - 1, 0)` })
      .where(eq(threads.id, post.threadId));

    const [thread] = await db.select().from(threads).where(eq(threads.id, post.threadId)).limit(1);
    if (thread) {
      await db
        .update(forums)
        .set({ postsCount: sql`GREATEST(${forums.postsCount} - 1, 0)` })
        .where(eq(forums.id, thread.forumId));
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Delete post error:", err);
    return NextResponse.json({ error: "Ошибка при удалении" }, { status: 500 });
  }
}
