import React from "react";
import { Header } from "@/components/Header";
import { ThreadBadge } from "@/components/ThreadBadge";
import { db } from "@/db";
import { forums, threads, users, categories } from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";
import { eq, desc, and } from "drizzle-orm";
import { 
  PlusCircle, 
  Pin, 
  Lock, 
  Eye, 
  MessageSquare, 
  ChevronRight, 
  Home
} from "lucide-react";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ prefix?: string }>;
}

export default async function ForumPage({ params, searchParams }: PageProps) {
  await ensureSeeded();
  const { id } = await params;
  const { prefix } = await searchParams;

  const forumId = Number(id);

  // Fetch forum
  const [forum] = await db.select().from(forums).where(eq(forums.id, forumId)).limit(1);
  if (!forum) {
    return (
      <div className="min-h-screen bg-[#090d13] text-white flex flex-col">
        <Header />
        <div className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="text-2xl font-bold text-rose-400">Форум не найден</h1>
          <p className="text-slate-400">Запрошенный раздел форума не существует или был удален.</p>
          <a href="/" className="inline-block bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-xl text-sm">
            Вернуться на главную
          </a>
        </div>
      </div>
    );
  }

  // Fetch Parent category
  const [category] = await db.select().from(categories).where(eq(categories.id, forum.categoryId)).limit(1);

  // Fetch Subforums
  const subforums = await db.select().from(forums).where(eq(forums.parentId, forum.id)).orderBy(forums.orderIndex);

  // Build query condition
  let whereClause = eq(threads.forumId, forumId);
  if (prefix) {
    whereClause = and(eq(threads.forumId, forumId), eq(threads.prefix, prefix))!;
  }

  // Fetch Threads
  const allThreads = await db
    .select({
      id: threads.id,
      title: threads.title,
      prefix: threads.prefix,
      prefixColor: threads.prefixColor,
      isPinned: threads.isPinned,
      isLocked: threads.isLocked,
      views: threads.views,
      postsCount: threads.postsCount,
      createdAt: threads.createdAt,
      lastPostAt: threads.lastPostAt,
      authorId: threads.authorId,
      authorName: users.username,
      authorAvatar: users.avatarUrl,
      authorRole: users.role,
    })
    .from(threads)
    .leftJoin(users, eq(threads.authorId, users.id))
    .where(whereClause)
    .orderBy(desc(threads.isPinned), desc(threads.lastPostAt));

  return (
    <div className="min-h-screen bg-[#090d13] text-slate-100 font-sans flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
          <a href="/" className="hover:text-purple-300 flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Главная</span>
          </a>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="text-slate-300">{category?.title || "Раздел"}</span>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="text-purple-300 font-bold">{forum.title}</span>
        </nav>

        {/* Forum Header Banner */}
        <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>{forum.title}</span>
                {forum.isLocked && (
                  <span title="Раздел закрыт">
                    <Lock className="w-5 h-5 text-slate-500" />
                  </span>
                )}
              </h1>
              {category?.isServerCategory && (
                <span className="bg-amber-500 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded tracking-wider uppercase">
                  BLACK SERVER
                </span>
              )}
            </div>
            {forum.description && <p className="text-sm text-slate-400">{forum.description}</p>}
          </div>

          <div>
            <a
              href={`/forums/${forum.id}/new`}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition shadow-lg shadow-purple-950/50 flex items-center gap-2 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Создать тему</span>
            </a>
          </div>
        </div>

        {/* Subforums Grid if any */}
        {subforums.length > 0 && (
          <div className="bg-[#161b22] border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-extrabold text-purple-300 uppercase tracking-wider">
              Подразделы
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {subforums.map((sub) => (
                <a
                  key={sub.id}
                  href={`/forums/${sub.id}`}
                  className="bg-[#0d1117] hover:bg-slate-900 border border-slate-800 hover:border-purple-500/50 p-3 rounded-xl transition flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-bold text-slate-200 group-hover:text-purple-300 truncate">
                      {sub.title}
                    </div>
                    {sub.description && (
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">{sub.description}</div>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition transform shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Filters Bar */}
        <div className="bg-[#121620] border border-slate-800/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 font-semibold mr-1">Фильтр по префиксу:</span>
            <a
              href={`/forums/${forum.id}`}
              className={`px-2.5 py-1 rounded-lg transition ${
                !prefix ? "bg-purple-600 text-white font-bold" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Все
            </a>
            <a
              href={`/forums/${forum.id}?prefix=[На рассмотрении]`}
              className={`px-2.5 py-1 rounded-lg transition ${
                prefix === "[На рассмотрении]" ? "bg-amber-600 text-white font-bold" : "bg-slate-800 text-amber-300 hover:bg-slate-700"
              }`}
            >
              [На рассмотрении]
            </a>
            <a
              href={`/forums/${forum.id}?prefix=[Одобрено]`}
              className={`px-2.5 py-1 rounded-lg transition ${
                prefix === "[Одобрено]" ? "bg-emerald-600 text-white font-bold" : "bg-slate-800 text-emerald-300 hover:bg-slate-700"
              }`}
            >
              [Одобрено]
            </a>
            <a
              href={`/forums/${forum.id}?prefix=[Отказано]`}
              className={`px-2.5 py-1 rounded-lg transition ${
                prefix === "[Отказано]" ? "bg-rose-600 text-white font-bold" : "bg-slate-800 text-rose-300 hover:bg-slate-700"
              }`}
            >
              [Отказано]
            </a>
            <a
              href={`/forums/${forum.id}?prefix=[Важно]`}
              className={`px-2.5 py-1 rounded-lg transition ${
                prefix === "[Важно]" ? "bg-purple-800 text-purple-200 font-bold" : "bg-slate-800 text-purple-300 hover:bg-slate-700"
              }`}
            >
              [Важно]
            </a>
          </div>

          <div className="text-slate-400 font-mono text-xs">
            Найдено тем: <strong className="text-white">{allThreads.length}</strong>
          </div>
        </div>

        {/* Threads List */}
        <div className="bg-[#161b22] border border-slate-800 rounded-xl overflow-hidden shadow-xl divide-y divide-slate-800/80">
          {allThreads.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="text-slate-300 font-semibold text-base">В этом разделе пока нет тем</div>
              <p className="text-xs text-slate-500">Будьте первым, кто создаст тему в разделе "{forum.title}"!</p>
              <a
                href={`/forums/${forum.id}/new`}
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition mt-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Создать тему</span>
              </a>
            </div>
          ) : (
            allThreads.map((thread) => (
              <div
                key={thread.id}
                className={`p-4 hover:bg-slate-900/70 transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  thread.isPinned ? "bg-purple-950/20 border-l-4 border-l-amber-400" : ""
                }`}
              >
                {/* Left: Author Avatar, Title, Prefix, Pins */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <a href={`/profile/${thread.authorId}`}>
                    <img
                      src={thread.authorAvatar || "https://api.dicebear.com/7.x/identicon/svg?seed=user"}
                      alt={thread.authorName || "User"}
                      className="w-9 h-9 rounded-full object-cover border border-purple-500/40 shrink-0"
                    />
                  </a>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {thread.isPinned && (
                        <span className="bg-amber-950 text-amber-300 border border-amber-600/60 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <Pin className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span>ЗАКРЕПЛЕНО</span>
                        </span>
                      )}

                      {thread.prefix && (
                        <ThreadBadge prefix={thread.prefix} color={thread.prefixColor} size="sm" />
                      )}

                      <a
                        href={`/threads/${thread.id}`}
                        className="text-sm md:text-base font-bold text-slate-100 hover:text-purple-300 transition line-clamp-1"
                      >
                        {thread.title}
                      </a>

                      {thread.isLocked && (
                        <span title="Тема закрыта">
                          <Lock className="w-3.5 h-3.5 text-slate-500 ml-1" />
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                      <span>
                        Автор: <a href={`/profile/${thread.authorId}`} className="text-purple-400 font-semibold hover:underline">{thread.authorName}</a>
                      </span>
                      <span>•</span>
                      <span>{new Date(thread.createdAt).toLocaleDateString("ru-RU")}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Stats & Last Post Date */}
                <div className="flex items-center gap-6 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/60 justify-between md:justify-end text-xs">
                  <div className="flex items-center gap-4 text-slate-400 font-mono">
                    <span className="flex items-center gap-1" title="Ответов">
                      <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                      <strong className="text-slate-200">{thread.postsCount - 1}</strong>
                    </span>

                    <span className="flex items-center gap-1" title="Просмотров">
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>{thread.views}</span>
                    </span>
                  </div>

                  <div className="text-right text-[11px] text-slate-400 min-w-[120px]">
                    <div className="text-purple-300 font-medium">Последний ответ</div>
                    <div className="text-slate-500">{new Date(thread.lastPostAt).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
