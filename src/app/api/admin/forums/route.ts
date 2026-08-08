import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories, forums, auditLogs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "owner") {
      return NextResponse.json({ error: "Доступ запрещен. Требуются права Владельца" }, { status: 403 });
    }

    const { type, title, description, categoryId, parentId, icon, color, isServerCategory } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Укажите название" }, { status: 400 });
    }

    if (type === "category") {
      const [newCat] = await db
        .insert(categories)
        .values({
          title,
          description: description || "",
          icon: icon || "folder",
          color: color || "purple",
          isServerCategory: Boolean(isServerCategory),
        })
        .returning();

      return NextResponse.json({ success: true, category: newCat });
    } else {
      // Forum or Subforum
      if (!categoryId) {
        return NextResponse.json({ error: "Выберите категорию" }, { status: 400 });
      }

      const [newForum] = await db
        .insert(forums)
        .values({
          categoryId: Number(categoryId),
          parentId: parentId ? Number(parentId) : null,
          title,
          description: description || "",
          icon: icon || "message-square",
        })
        .returning();

      await db.insert(auditLogs).values({
        userId: currentUser.id,
        action: "Создание форума",
        details: `Создан раздел "${title}" в категории ${categoryId}`,
      });

      return NextResponse.json({ success: true, forum: newForum });
    }
  } catch (err: unknown) {
    console.error("Admin create forum error:", err);
    return NextResponse.json({ error: "Ошибка при создании" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "owner") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!type || !id) {
      return NextResponse.json({ error: "Параметры не указаны" }, { status: 400 });
    }

    if (type === "category") {
      await db.delete(categories).where(eq(categories.id, Number(id)));
    } else {
      await db.delete(forums).where(eq(forums.id, Number(id)));
    }

    await db.insert(auditLogs).values({
      userId: currentUser.id,
      action: `Удаление ${type}`,
      details: `Удален ${type} ID ${id}`,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Admin delete forum error:", err);
    return NextResponse.json({ error: "Ошибка при удалении" }, { status: 500 });
  }
}
