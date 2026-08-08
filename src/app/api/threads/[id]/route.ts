import { NextResponse } from "next/server";
import { db } from "@/db";
import { threads, posts, forums, auditLogs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const threadId = Number(id);

    const [thread] = await db.select().from(threads).where(eq(threads.id, threadId)).limit(1);
    if (!thread) {
      return NextResponse.json({ error: "Тема не найдена" }, { status: 404 });
    }

    // Increment views count
    await db
      .update(threads)
      .set({ views: sql`${threads.views} + 1` })
      .where(eq(threads.id, threadId));

    return NextResponse.json({ thread });
  } catch (err: unknown) {
    console.error("Get thread error:", err);
    return NextResponse.json({ error: "Ошибка серверa" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
    }

    const { id } = await params;
    const threadId = Number(id);

    const [thread] = await db.select().from(threads).where(eq(threads.id, threadId)).limit(1);
    if (!thread) {
      return NextResponse.json({ error: "Тема не найдена" }, { status: 404 });
    }

    const isAuthor = thread.authorId === user.id;
    const isStaff = ["owner", "ga", "zga", "admin", "curator"].includes(user.role);

    if (!isAuthor && !isStaff) {
      return NextResponse.json({ error: "У вас нет прав для изменения этой темы" }, { status: 403 });
    }

    const body = await req.json();
    const updates: Record<string, unknown> = {};

    if (body.title !== undefined && (isAuthor || isStaff)) {
      updates.title = String(body.title).trim();
    }

    if (isStaff) {
      if (body.prefix !== undefined) updates.prefix = String(body.prefix);
      if (body.prefixColor !== undefined) updates.prefixColor = String(body.prefixColor);
      if (body.isPinned !== undefined) updates.isPinned = Boolean(body.isPinned);
      if (body.isLocked !== undefined) updates.isLocked = Boolean(body.isLocked);
    }

    await db.update(threads).set(updates).where(eq(threads.id, threadId));

    await db.insert(auditLogs).values({
      userId: user.id,
      action: "Обновление темы",
      details: `Обновлена тема #${threadId} (${JSON.stringify(updates)})`,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Update thread error:", err);
    return NextResponse.json({ error: "Ошибка при обновлении темы" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || !["owner", "ga", "zga", "admin"].includes(user.role)) {
      return NextResponse.json({ error: "Недостаточно прав для удаления темы" }, { status: 403 });
    }

    const { id } = await params;
    const threadId = Number(id);

    const [thread] = await db.select().from(threads).where(eq(threads.id, threadId)).limit(1);
    if (!thread) {
      return NextResponse.json({ error: "Тема не найдена" }, { status: 404 });
    }

    // Delete posts first then thread
    await db.delete(posts).where(eq(posts.threadId, threadId));
    await db.delete(threads).where(eq(threads.id, threadId));

    // Decrement forum counters
    await db
      .update(forums)
      .set({
        threadsCount: sql`GREATEST(${forums.threadsCount} - 1, 0)`,
      })
      .where(eq(forums.id, thread.forumId));

    await db.insert(auditLogs).values({
      userId: user.id,
      action: "Удаление темы",
      details: `Удалена тема #${threadId} "${thread.title}"`,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Delete thread error:", err);
    return NextResponse.json({ error: "Ошибка при удалении темы" }, { status: 500 });
  }
}
