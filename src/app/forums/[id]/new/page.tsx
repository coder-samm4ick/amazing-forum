"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { PostEditor } from "@/components/PostEditor";
import { Home, ChevronRight, PlusCircle, Pin, Lock, ArrowLeft } from "lucide-react";
import { UserSession } from "@/lib/auth";

export default function NewThreadPage() {
  const params = useParams();
  const router = useRouter();
  const forumId = params?.id as string;

  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [forumTitle, setForumTitle] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [prefix, setPrefix] = useState("[На рассмотрении]");
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setCurrentUser(data.user));

    // Fetch forum info
    if (forumId) {
      fetch(`/api/admin/forums?id=${forumId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.forum) setForumTitle(data.forum.title);
        })
        .catch(() => {});
    }
  }, [forumId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("Заполните заголовок и содержание темы");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          forumId,
          title: title.trim(),
          content: content.trim(),
          prefix,
          isPinned,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка создания темы");

      router.push(`/threads/${data.threadId}`);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const isStaff = currentUser && ["owner", "ga", "zga", "admin", "curator"].includes(currentUser.role);

  return (
    <div className="min-h-screen bg-[#090d13] text-slate-100 font-sans flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-400">
          <a href="/" className="hover:text-purple-300 flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Главная</span>
          </a>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <a href={`/forums/${forumId}`} className="hover:text-purple-300">Раздел #{forumId}</a>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="text-purple-300 font-bold">Создать тему</span>
        </nav>

        {/* Form Container */}
        <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                <PlusCircle className="w-6 h-6 text-purple-400" />
                <span>Создание новой темы</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">Ender Online • Сервер BLACK</p>
            </div>

            <a
              href={`/forums/${forumId}`}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Назад к разделу</span>
            </a>
          </div>

          {!currentUser ? (
            <div className="bg-amber-950/80 border border-amber-600/50 p-4 rounded-xl text-amber-200 text-sm">
              Для создания темы необходимо <a href="/" className="underline font-bold text-white">авторизоваться</a> на форуме.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-rose-950/80 border border-rose-600/60 p-3 rounded-xl text-rose-200 text-xs">
                  {error}
                </div>
              )}

              {/* Prefix and Title */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-slate-300 mb-1">Префикс темы</label>
                  <select
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    className="w-full bg-[#0d1117] border border-slate-700 text-slate-100 text-xs rounded-xl p-2.5 outline-none focus:border-purple-500 font-semibold"
                  >
                    <option value="[На рассмотрении]">[На рассмотрении] (Желтый)</option>
                    <option value="[Одобрено]">[Одобрено] (Зеленый)</option>
                    <option value="[Отказано]">[Отказано] (Красный)</option>
                    <option value="[Важно]">[Важно] (Фиолетовый)</option>
                    <option value="[Информация]">[Информация] (Синий)</option>
                    <option value="">Без префикса</option>
                  </select>
                </div>

                <div className="md:col-span-8">
                  <label className="block text-xs font-bold text-slate-300 mb-1">Заголовок темы</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Например: Жалоба на игрока Ivan_Ivanov | Причина: DM"
                    className="w-full bg-[#0d1117] border border-slate-700 text-white text-sm rounded-xl px-3 py-2 outline-none focus:border-purple-500 font-semibold"
                  />
                </div>
              </div>

              {/* Staff Pinned Checkbox */}
              {isStaff && (
                <div className="bg-purple-950/40 border border-purple-800/40 p-3 rounded-xl flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    id="pin-check"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="rounded border-slate-700 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="pin-check" className="text-purple-200 font-semibold flex items-center gap-1 cursor-pointer">
                    <Pin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Закрепить тему вверху раздела (Доступно Администрации)</span>
                  </label>
                </div>
              )}

              {/* Content Editor */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Содержание темы (Поддерживается BBCode форматирование)
                </label>
                <PostEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Опишите ситуацию или заполните форму подачи..."
                  rows={12}
                  showTemplates={true}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <a
                  href={`/forums/${forumId}`}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2 rounded-xl text-xs transition"
                >
                  Отмена
                </a>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-lg shadow-purple-950/50"
                >
                  {loading ? "Публикация..." : "Опубликовать тему"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
