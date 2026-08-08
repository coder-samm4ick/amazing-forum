import { NextResponse } from "next/server";
import { db } from "@/db";
import { postReactions, posts, users, notifications } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, and, sql } from "drizzle-orm";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
    }

    const { id } = await params;
    const postId = Number(id);
    const { type } = await req.json(); // 'like', 'heart', 'respect', 'helpful', 'dislike'

    const validTypes = ["like", "heart", "respect", "helpful", "dislike"];
    const reactionType = validTypes.includes(type) ? type : "like";

    const [post] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
    if (!post) {
      return NextResponse.json({ error: "Пост не найден" }, { status: 404 });
    }

    // Check existing reaction
    const [existing] = await db
      .select()
      .from(postReactions)
      .where(and(eq(postReactions.postId, postId), eq(postReactions.userId, user.id)))
      .limit(1);

    if (existing) {
      if (existing.type === reactionType) {
        // Toggle off
        await db.delete(postReactions).where(eq(postReactions.id, existing.id));

        // Decrement score
        await db
          .update(users)
          .set({ reactionScore: sql`GREATEST(${users.reactionScore} - 1, 0)` })
          .where(eq(users.id, post.authorId));

        return NextResponse.json({ success: true, action: "removed" });
      } else {
        // Change type
        await db
          .update(postReactions)
          .set({ type: reactionType })
          .where(eq(postReactions.id, existing.id));

        return NextResponse.json({ success: true, action: "updated" });
      }
    } else {
      // Add reaction
      await db.insert(postReactions).values({
        postId,
        userId: user.id,
        type: reactionType,
      });

      // Increase user reaction score
      await db
        .update(users)
        .set({ reactionScore: sql`${users.reactionScore} + 1` })
        .where(eq(users.id, post.authorId));

      // Notify post author
      if (post.authorId !== user.id) {
        await db.insert(notifications).values({
          userId: post.authorId,
          senderId: user.id,
          type: "reaction",
          title: `${user.username} оценил ваше сообщение!`,
          link: `/threads/${post.threadId}#post-${post.id}`,
        });
      }

      return NextResponse.json({ success: true, action: "added" });
    }
  } catch (err: unknown) {
    console.error("React error:", err);
    return NextResponse.json({ error: "Ошибка при оценке" }, { status: 500 });
  }
}
