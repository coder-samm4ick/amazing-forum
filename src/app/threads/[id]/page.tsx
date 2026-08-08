"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { UserBadge } from "@/components/UserBadge";
import { ThreadBadge } from "@/components/ThreadBadge";
import { RichPostContent } from "@/components/RichPostContent";
import { PostEditor } from "@/components/PostEditor";
import { UserSession } from "@/lib/auth";
import { 
  MessageSquare, 
  Eye, 
  Pin, 
  Lock, 
  ShieldAlert, 
  ThumbsUp, 
  Heart, 
  Award, 
  Send, 
  Edit3, 
  Trash2, 
  ChevronRight, 
  Home, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Settings,
  Sparkles
} from "lucide-react";

interface PostItem {
  id: number;
  content: string;
  createdAt: string;
  author: {
    id: number;
    username: string;
    role: string;
    customTitle: string | null;
    avatarUrl: string | null;
    signature: string | null;
    messagesCount: number;
    reactionScore: number;
  };
  reactions: Record<string, number>;
  userReaction?: string | null;
}

interface ThreadData {
  id: number;
  forumId: number;
  title: string;
  prefix: string;
  prefixColor: string;
  isPinned: boolean;
  isLocked: boolean;
  views: number;
  postsCount: number;
  createdAt: string;
  authorId: number;
  forumTitle?: string;
}

export default function ThreadPage() {
  const params = useParams();
  const router = useRouter();
  const threadId = params?.id as string;

  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [thread, setThread] = useState<ThreadData | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  const fetchThreadData = async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      if (meRes.ok) {
        const meData = await meRes.json();
        setCurrentUser(meData.user);
      }

      // Fetch Thread Details
      const res = await fetch(`/api/threads/${threadId}`);
      if (!res.ok) throw new Error("Тема не найдена");
      const data = await res.json();
      setThread(data.thread);

      // Fetch Posts
      const postsRes = await fetch(`/api/threads/${threadId}/posts`);
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData.posts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (threadId) {
      fetchThreadData();
    }
  }, [threadId]);

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId, content: replyContent }),
      });
      if (res.ok) {
        setReplyContent("");
        fetchThreadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReact = async (postId: number, type: string) => {
    if (!currentUser) return alert("Авторизуйтесь, чтобы ставить реакции");
    try {
      await fetch(`/api/posts/${postId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      fetchThreadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStatusPrefix = async (newPrefix: string, prefixColor: string) => {
    try {
      await fetch(`/api/threads/${threadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prefix: newPrefix, prefixColor }),
      });
      fetchThreadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleLock = async () => {
    if (!thread) return;
    try {
      await fetch(`/api/threads/${threadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLocked: !thread.isLocked }),
      });
      fetchThreadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePin = async () => {
    if (!thread) return;
    try {
      await fetch(`/api/threads/${threadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !thread.isPinned }),
      });
      fetchThreadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteThread = async () => {
    if (!confirm("Вы действительно хотите удалить эту тему и все ответы?")) return;
    try {
      const res = await fetch(`/api/threads/${threadId}`, { method: "DELETE" });
      if (res.ok) {
        router.push(`/forums/${thread?.forumId || 1}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isStaff = currentUser && ["owner", "ga", "zga", "admin", "curator"].includes(currentUser.role);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d13] text-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-8 text-purple-400 font-semibold animate-pulse">
          Загрузка темы Ender Online...
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="min-h-screen bg-[#090d13] text-white flex flex-col">
        <Header />
        <div className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="text-2xl font-bold text-rose-400">Тема не найдена</h1>
          <p className="text-slate-400">Данная тема не существует или была удалена администрацией.</p>
          <a href="/" className="inline-block bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-xl text-sm">
            Вернуться на главную
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d13] text-slate-100 font-sans flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-slate-400">
          <a href="/" className="hover:text-purple-300 flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Главная</span>
          </a>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <a href={`/forums/${thread.forumId}`} className="hover:text-purple-300">
            Раздел #{thread.forumId}
          </a>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="text-purple-300 font-bold truncate max-w-xs">{thread.title}</span>
        </nav>

        {/* Thread Header Title Card */}
        <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {thread.isPinned && (
              <span className="bg-amber-950 text-amber-300 border border-amber-600/60 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Pin className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>ЗАКРЕПЛЕНО</span>
              </span>
            )}

            {thread.prefix && (
              <ThreadBadge prefix={thread.prefix} color={thread.prefixColor} size="md" />
            )}

            {thread.isLocked && (
              <span className="bg-slate-800 text-slate-400 border border-slate-700 text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                <span>ЗАКРЫТО</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {thread.title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 border-t border-slate-800/80">
            <span>
              Создано: <strong className="text-slate-200">{new Date(thread.createdAt).toLocaleDateString("ru-RU")}</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-purple-400" /> Просмотров: <strong className="text-slate-200">{thread.views}</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Сообщений: <strong className="text-slate-200">{posts.length}</strong>
            </span>
          </div>
        </div>

        {/* Staff Moderation Bar */}
        {isStaff && (
          <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-800/60 rounded-xl p-4 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-amber-400 uppercase tracking-wider">
              <Settings className="w-4 h-4 text-amber-400" />
              <span>Панель Модерации (Доступно Администрации)</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-semibold mr-1">Статус вердикта:</span>

              <button
                onClick={() => handleUpdateStatusPrefix("[На рассмотрении]", "amber")}
                className="bg-amber-950 hover:bg-amber-900 border border-amber-600/60 text-amber-300 px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold transition"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>На рассмотрении</span>
              </button>

              <button
                onClick={() => handleUpdateStatusPrefix("[Одобрено]", "emerald")}
                className="bg-emerald-950 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-300 px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold transition"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Одобрено</span>
              </button>

              <button
                onClick={() => handleUpdateStatusPrefix("[Отказано]", "rose")}
                className="bg-rose-950 hover:bg-rose-900 border border-rose-600/60 text-rose-300 px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold transition"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Отказано</span>
              </button>

              <div className="w-px h-5 bg-slate-700 mx-1"></div>

              <button
                onClick={handleToggleLock}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-semibold transition"
              >
                {thread.isLocked ? "Открыть тему" : "Закрыть тему"}
              </button>

              <button
                onClick={handleTogglePin}
                className="bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-600/50 px-3 py-1.5 rounded-lg font-semibold transition"
              >
                {thread.isPinned ? "Открепить" : "Закрепить"}
              </button>

              <button
                onClick={handleDeleteThread}
                className="bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-600/50 px-3 py-1.5 rounded-lg font-semibold transition ml-auto"
              >
                Удалить тему
              </button>
            </div>
          </div>
        )}

        {/* Posts History */}
        <div className="space-y-4">
          {posts.map((post, idx) => (
            <div
              key={post.id}
              id={`post-${post.id}`}
              className="bg-[#161b22] border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col md:flex-row"
            >
              {/* Left Author Profile Sidebar */}
              <div className="w-full md:w-56 bg-[#0d1117] border-b md:border-b-0 md:border-r border-slate-800 p-5 flex flex-col items-center text-center space-y-3 shrink-0">
                <a href={`/profile/${post.author.id}`} className="relative group">
                  <img
                    src={post.author.avatarUrl || "https://api.dicebear.com/7.x/identicon/svg?seed=user"}
                    alt={post.author.username}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-500/50 shadow-lg group-hover:scale-105 transition transform"
                  />
                  {post.author.role === "owner" && (
                    <span className="absolute -top-2 -right-2 bg-yellow-400 text-slate-950 p-1 rounded-full shadow">
                      <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                    </span>
                  )}
                </a>

                <div className="space-y-1.5">
                  <a
                    href={`/profile/${post.author.id}`}
                    className="text-sm font-bold text-slate-100 hover:text-purple-300 block truncate"
                  >
                    {post.author.username}
                  </a>

                  <UserBadge
                    role={post.author.role}
                    customTitle={post.author.customTitle}
                    size="sm"
                  />
                </div>

                <div className="w-full pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span>Сообщений:</span>
                    <strong className="text-purple-300">{post.author.messagesCount}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Реакций:</span>
                    <strong className="text-emerald-400">{post.author.reactionScore}</strong>
                  </div>
                </div>
              </div>

              {/* Right Post Content Area */}
              <div className="flex-1 p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  {/* Post Top Bar */}
                  <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-800/80 pb-3">
                    <span className="font-mono">
                      #{idx + 1} • {new Date(post.createdAt).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>

                    {/* Reactions Counter Badge */}
                    <div className="flex items-center gap-1.5 text-[11px]">
                      {Object.entries(post.reactions || {}).map(([type, cnt]) => (
                        <span key={type} className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full text-slate-300 font-bold">
                          {type === "like" && "👍"}
                          {type === "heart" && "❤️"}
                          {type === "respect" && "🏆"}
                          {type === "helpful" && "💡"} {cnt}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Rendered Post Content */}
                  <RichPostContent content={post.content} />

                  {/* User Signature */}
                  {post.author.signature && (
                    <div className="pt-4 border-t border-slate-800/60 mt-6">
                      <RichPostContent content={post.author.signature} className="opacity-80 text-xs" />
                    </div>
                  )}
                </div>

                {/* Reaction & Action Buttons Bar */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleReact(post.id, "like")}
                      className="bg-slate-900 hover:bg-purple-950/60 text-slate-300 hover:text-purple-300 border border-slate-800 px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-purple-400" />
                      <span>Мне нравится</span>
                    </button>

                    <button
                      onClick={() => handleReact(post.id, "heart")}
                      className="bg-slate-900 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-800 px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
                    >
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                      <span>Сердечко</span>
                    </button>

                    <button
                      onClick={() => handleReact(post.id, "respect")}
                      className="bg-slate-900 hover:bg-amber-950/60 text-slate-300 hover:text-amber-300 border border-slate-800 px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span>Уважение</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Reply Form */}
        <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            <span>Ответить в теме</span>
          </h3>

          {!currentUser ? (
            <div className="bg-amber-950/80 border border-amber-600/50 p-4 rounded-xl text-amber-200 text-sm">
              Чтобы оставить ответ в теме, необходимо войти в аккаунт.
            </div>
          ) : thread.isLocked && !isStaff ? (
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-slate-400 text-sm italic">
              Эта тема закрыта для ответов.
            </div>
          ) : (
            <form onSubmit={handlePostReply} className="space-y-4">
              <PostEditor
                value={replyContent}
                onChange={setReplyContent}
                placeholder="Ваше сообщение..."
                rows={6}
                showTemplates={false}
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-lg shadow-purple-950/50 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "Отправка..." : "Отправить ответ"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
