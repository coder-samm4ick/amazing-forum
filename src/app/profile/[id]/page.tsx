"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/Header";
import { UserBadge } from "@/components/UserBadge";
import { RichPostContent } from "@/components/RichPostContent";
import { PostEditor } from "@/components/PostEditor";
import { UserSession } from "@/lib/auth";
import { 
  User, 
  Crown, 
  ShieldAlert, 
  MessageSquare, 
  ThumbsUp, 
  Calendar, 
  ExternalLink, 
  Edit, 
  Check, 
  Home, 
  ChevronRight,
  Send
} from "lucide-react";

interface UserProfileData {
  id: number;
  username: string;
  email: string;
  role: string;
  customTitle: string | null;
  badgeColor: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  signature: string | null;
  messagesCount: number;
  reactionScore: number;
  warnings: number;
  vkLink: string | null;
  discordTag: string | null;
  createdAt: string;
}

export default function ProfilePage() {
  const params = useParams();
  const profileId = params?.id as string;

  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"info" | "edit">("info");

  // Edit form state
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [signature, setSignature] = useState("");
  const [vkLink, setVkLink] = useState("");
  const [discordTag, setDiscordTag] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const fetchProfile = async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      if (meRes.ok) {
        const meData = await meRes.json();
        setCurrentUser(meData.user);
      }

      const res = await fetch(`/api/users/${profileId}`);
      if (!res.ok) throw new Error("Профиль не найден");
      const data = await res.json();
      setUserProfile(data.user);

      if (data.user) {
        setAvatarUrl(data.user.avatarUrl || "");
        setBannerUrl(data.user.bannerUrl || "");
        setSignature(data.user.signature || "");
        setVkLink(data.user.vkLink || "");
        setDiscordTag(data.user.discordTag || "");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profileId) {
      fetchProfile();
    }
  }, [profileId]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg("");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avatarUrl,
          bannerUrl,
          signature,
          vkLink,
          discordTag,
        }),
      });

      if (res.ok) {
        setSavedMsg("Профиль успешно обновлен!");
        fetchProfile();
        setTimeout(() => setSavedMsg(""), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const isSelf = currentUser && userProfile && currentUser.id === userProfile.id;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d13] text-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-purple-400 font-semibold animate-pulse">
          Загрузка профиля...
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-[#090d13] text-white flex flex-col">
        <Header />
        <div className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="text-2xl font-bold text-rose-400">Пользователь не найден</h1>
          <p className="text-slate-400">Профиль не существует или был удален.</p>
          <a href="/" className="inline-block bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-xl text-sm">
            На главную
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d13] text-slate-100 font-sans flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-slate-400">
          <a href="/" className="hover:text-purple-300 flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Главная</span>
          </a>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="text-purple-300 font-bold">Профиль: {userProfile.username}</span>
        </nav>

        {/* Banner and Profile Header */}
        <div className="bg-[#161b22] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
          {/* Banner Image */}
          <div
            className="h-48 md:h-64 bg-cover bg-center relative"
            style={{
              backgroundImage: `url(${userProfile.bannerUrl || "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80"})`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] via-transparent to-black/30"></div>
          </div>

          {/* User Info Bar */}
          <div className="p-6 relative pt-0 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 -mt-16 md:-mt-20">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-5 text-center md:text-left">
              <img
                src={userProfile.avatarUrl || "https://api.dicebear.com/7.x/identicon/svg?seed=user"}
                alt={userProfile.username}
                className="w-28 h-28 md:w-32 md:h-32 rounded-2xl object-cover border-4 border-[#161b22] shadow-2xl shrink-0"
              />

              <div className="space-y-2 mb-2">
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span>{userProfile.username}</span>
                </h1>

                <UserBadge role={userProfile.role} customTitle={userProfile.customTitle} size="md" />

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-400 font-mono pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" /> На форуме с {new Date(userProfile.createdAt).toLocaleDateString("ru-RU")}
                  </span>
                </div>
              </div>
            </div>

            {/* Self Edit Tab trigger */}
            {isSelf && (
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => setActiveTab("info")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    activeTab === "info" ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  Информация
                </button>

                <button
                  onClick={() => setActiveTab("edit")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    activeTab === "edit" ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Редактировать</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab 1: Profile Info */}
        {activeTab === "info" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Stats Grid */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <h3 className="text-xs font-extrabold text-purple-300 uppercase tracking-wider">
                  Статистика пользователя
                </h3>

                <div className="space-y-3 text-xs font-mono">
                  <div className="flex justify-between items-center bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-purple-400" /> Сообщений:
                    </span>
                    <strong className="text-white text-sm">{userProfile.messagesCount}</strong>
                  </div>

                  <div className="flex justify-between items-center bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <ThumbsUp className="w-4 h-4 text-emerald-400" /> Реакций:
                    </span>
                    <strong className="text-emerald-400 text-sm">{userProfile.reactionScore}</strong>
                  </div>

                  <div className="flex justify-between items-center bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-400" /> Предупреждений:
                    </span>
                    <strong className="text-amber-400 text-sm">{userProfile.warnings} / 3</strong>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 text-xs">
                <h3 className="font-extrabold text-purple-300 uppercase tracking-wider">
                  Контакты
                </h3>

                {userProfile.vkLink ? (
                  <a
                    href={userProfile.vkLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-[#0077ff]/20 border border-[#0077ff]/40 text-[#3399ff] p-2.5 rounded-xl font-bold hover:underline"
                  >
                    ВКонтакте: {userProfile.vkLink}
                  </a>
                ) : (
                  <div className="text-slate-500 italic">VK не указан</div>
                )}

                {userProfile.discordTag ? (
                  <div className="bg-[#5865F2]/20 border border-[#5865F2]/40 text-[#7983f5] p-2.5 rounded-xl font-bold">
                    Discord: {userProfile.discordTag}
                  </div>
                ) : (
                  <div className="text-slate-500 italic">Discord не указан</div>
                )}
              </div>
            </div>

            {/* Right Signature & Activity */}
            <div className="lg:col-span-8 space-y-6">
              {/* Signature Box */}
              <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
                <h3 className="text-xs font-extrabold text-purple-300 uppercase tracking-wider">
                  Подпись пользователя
                </h3>

                {userProfile.signature ? (
                  <div className="bg-[#0d1117] border border-slate-800 p-4 rounded-xl">
                    <RichPostContent content={userProfile.signature} />
                  </div>
                ) : (
                  <div className="text-slate-500 text-xs italic">Подпись отсутствует.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Profile Edit */}
        {activeTab === "edit" && isSelf && (
          <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Edit className="w-5 h-5 text-purple-400" />
              <span>Настройки профиля</span>
            </h2>

            {savedMsg && (
              <div className="bg-emerald-950/80 border border-emerald-600/60 p-3 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{savedMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Ссылка на Аватар (URL)</label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[#0d1117] border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Ссылка на Баннер (URL)</label>
                  <input
                    type="url"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[#0d1117] border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Ссылка ВКонтакте</label>
                  <input
                    type="text"
                    value={vkLink}
                    onChange={(e) => setVkLink(e.target.value)}
                    placeholder="https://vk.com/your_id"
                    className="w-full bg-[#0d1117] border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Discord Тег</label>
                  <input
                    type="text"
                    value={discordTag}
                    onChange={(e) => setDiscordTag(e.target.value)}
                    placeholder="username#0000"
                    className="w-full bg-[#0d1117] border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Подпись на форуме (BBCode)</label>
                <PostEditor value={signature} onChange={setSignature} rows={5} placeholder="Ваша подпись..." />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-lg"
                >
                  {saving ? "Сохранение..." : "Сохранить изменения"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
