import React from "react";
import { Header } from "@/components/Header";
import { ServerStatusBanner } from "@/components/ServerStatusBanner";
import { ForumCategory } from "@/components/ForumCategory";
import { SidebarWidgets } from "@/components/SidebarWidgets";
import { db } from "@/db";
import { categories, forums, threads, posts, users, serverInfo } from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";
import { eq, isNull, desc, count, sql } from "drizzle-orm";

export const revalidate = 0; // Dynamic rendering

export default async function HomePage() {
  await ensureSeeded();

  // Fetch Server Info
  const [sInfo] = await db.select().from(serverInfo).limit(1);

  // Fetch Categories
  const allCats = await db
    .select()
    .from(categories)
    .orderBy(categories.orderIndex);

  // Fetch Forums with Subforums and Last Posts
  const allForums = await db
    .select()
    .from(forums)
    .orderBy(forums.orderIndex);

  // Organize forums by category
  const categoriesWithForums = await Promise.all(
    allCats.map(async (cat) => {
      // Root forums in this category
      const rootForums = allForums.filter((f) => f.categoryId === cat.id && f.parentId === null);

      const forumItems = await Promise.all(
        rootForums.map(async (f) => {
          // Subforums
          const subs = allForums.filter((sub) => sub.parentId === f.id);

          // Get last post in this forum or its subforums
          const subIds = [f.id, ...subs.map((s) => s.id)];
          
          const [lastThread] = await db
            .select({
              threadId: threads.id,
              threadTitle: threads.title,
              lastPostAt: threads.lastPostAt,
              authorId: threads.lastPostAuthorId,
            })
            .from(threads)
            .where(sql`${threads.forumId} IN ${subIds}`)
            .orderBy(desc(threads.lastPostAt))
            .limit(1);

          let lastPostData = null;
          if (lastThread) {
            let authorName = "Игрок";
            let authorAvatar = null;
            if (lastThread.authorId) {
              const [u] = await db.select().from(users).where(eq(users.id, lastThread.authorId)).limit(1);
              if (u) {
                authorName = u.username;
                authorAvatar = u.avatarUrl;
              }
            }

            lastPostData = {
              threadId: lastThread.threadId,
              threadTitle: lastThread.threadTitle,
              authorName,
              authorAvatar,
              createdAt: new Date(lastThread.lastPostAt).toLocaleDateString("ru-RU", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              }),
            };
          }

          // Calculate total threads & posts including subforums
          const totalThreads = f.threadsCount + subs.reduce((acc, s) => acc + s.threadsCount, 0);
          const totalPosts = f.postsCount + subs.reduce((acc, s) => acc + s.postsCount, 0);

          return {
            id: f.id,
            title: f.title,
            description: f.description,
            icon: f.icon,
            threadsCount: totalThreads,
            postsCount: totalPosts,
            isLocked: f.isLocked,
            subforums: subs.map((s) => ({
              id: s.id,
              title: s.title,
              description: s.description,
              threadsCount: s.threadsCount,
              postsCount: s.postsCount,
              isLocked: s.isLocked,
            })),
            lastPost: lastPostData,
          };
        })
      );

      return {
        id: cat.id,
        title: cat.title,
        description: cat.description,
        color: cat.color,
        isServerCategory: cat.isServerCategory,
        forums: forumItems,
      };
    })
  );

  // Statistics
  const [{ value: totalThreadsCount }] = await db.select({ value: count() }).from(threads);
  const [{ value: totalPostsCount }] = await db.select({ value: count() }).from(posts);
  const [{ value: totalUsersCount }] = await db.select({ value: count() }).from(users);
  const [latestUser] = await db.select({ id: users.id, username: users.username }).from(users).orderBy(desc(users.id)).limit(1);

  // Staff list online preview
  const onlineStaff = await db
    .select({
      id: users.id,
      username: users.username,
      role: users.role,
      customTitle: users.customTitle,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(sql`${users.role} IN ('owner', 'ga', 'zga', 'admin', 'curator')`)
    .limit(5);

  return (
    <div className="min-h-screen bg-[#090d13] text-slate-100 font-sans flex flex-col selection:bg-purple-600 selection:text-white">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {/* Top Status & Announcement Banner */}
        <ServerStatusBanner serverInfo={sInfo} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Forum Boards Area */}
          <div className="lg:col-span-8 space-y-2">
            {categoriesWithForums.map((category) => (
              <ForumCategory
                key={category.id}
                id={category.id}
                title={category.title}
                description={category.description}
                color={category.color}
                isServerCategory={category.isServerCategory}
                forums={category.forums}
              />
            ))}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4">
            <SidebarWidgets
              stats={{
                totalThreads: Number(totalThreadsCount),
                totalPosts: Number(totalPostsCount),
                totalUsers: Number(totalUsersCount),
                latestUser,
              }}
              onlineStaff={onlineStaff}
            />
          </div>
        </div>
      </main>

      {/* XenForo / Amazing Style Footer */}
      <footer className="bg-[#090b10] border-t border-purple-900/30 py-8 px-4 mt-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <div className="text-sm font-bold text-slate-200">
              Ender Online — Сервер BLACK
            </div>
            <p className="text-slate-500 mt-1">
              Официальный форум проекта Criminal Russia RolePlay. Все права защищены © 2026.
            </p>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <a href="/threads/1" className="hover:text-purple-300 transition">
              Правила
            </a>
            <span>•</span>
            <a href="/forums/5" className="hover:text-rose-400 transition">
              Жалобы
            </a>
            <span>•</span>
            <a href="/members" className="hover:text-purple-300 transition">
              Администрация
            </a>
            <span>•</span>
            <a href="/admin" className="hover:text-yellow-300 font-semibold transition">
              Админ Панель
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
