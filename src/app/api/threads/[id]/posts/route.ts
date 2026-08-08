import { NextResponse } from "next/server";
import { db } from "@/db";
import { posts, users, postReactions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, asc } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const threadId = Number(id);

    const currentUser = await getCurrentUser();

    // Fetch all posts for this thread with author details
    const rawPosts = await db
      .select({
        id: posts.id,
        content: posts.content,
        createdAt: posts.createdAt,
        editedAt: posts.editedAt,
        authorId: posts.authorId,
        username: users.username,
        role: users.role,
        customTitle: users.customTitle,
        avatarUrl: users.avatarUrl,
        signature: users.signature,
        messagesCount: users.messagesCount,
        reactionScore: users.reactionScore,
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(eq(posts.threadId, threadId))
      .orderBy(asc(posts.id));

    // Fetch reactions for each post
    const postIds = rawPosts.map((p) => p.id);

    let reactionsMap: Record<number, Record<string, number>> = {};
    let userReactionMap: Record<number, string> = {};

    if (postIds.length > 0) {
      const allReactions = await db.select().from(postReactions);
      allReactions.forEach((r) => {
        if (postIds.includes(r.postId)) {
          if (!reactionsMap[r.postId]) reactionsMap[r.postId] = {};
          reactionsMap[r.postId][r.type] = (reactionsMap[r.postId][r.type] || 0) + 1;

          if (currentUser && r.userId === currentUser.id) {
            userReactionMap[r.postId] = r.type;
          }
        }
      });
    }

    const formattedPosts = rawPosts.map((p) => ({
      id: p.id,
      content: p.content,
      createdAt: p.createdAt,
      editedAt: p.editedAt,
      author: {
        id: p.authorId,
        username: p.username || "Пользователь",
        role: p.role || "user",
        customTitle: p.customTitle,
        avatarUrl: p.avatarUrl,
        signature: p.signature,
        messagesCount: p.messagesCount || 0,
        reactionScore: p.reactionScore || 0,
      },
      reactions: reactionsMap[p.id] || {},
      userReaction: userReactionMap[p.id] || null,
    }));

    return NextResponse.json({ posts: formattedPosts });
  } catch (err: unknown) {
    console.error("Fetch thread posts error:", err);
    return NextResponse.json({ error: "Ошибка при получении сообщений" }, { status: 500 });
  }
}
