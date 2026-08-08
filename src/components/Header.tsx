"use client";

import React, { useState, useEffect } from "react";
import Link from "next/navigation";
import { usePathname, useRouter } from "next/navigation";
import { 
  ShieldAlert, 
  User, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Copy, 
  Check, 
  Settings, 
  Crown, 
  Menu, 
  X,
  FileText,
  Users,
  Search,
  Sparkles,
  Zap,
  BookOpen
} from "lucide-react";
import { UserSession } from "@/lib/auth";

export const Header = () => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickLoginOpen, setQuickLoginOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  // Form states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  const handleCopyIp = () => {
    navigator.clipboard.writeText("black.ender-online.ru:7777");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.refresh();
    window.location.href = "/";
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка входа");
      setUser(data.user);
      setLoginModalOpen(false);
      setUsername("");
      setPassword("");
      router.refresh();
    } catch (err: unknown) {
      setAuthError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка регистрации");
      setUser(data.user);
      setRegisterModalOpen(false);
      setUsername("");
      setEmail("");
      setPassword("");
      router.refresh();
    } catch (err: unknown) {
      setAuthError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLoginOwner = async (targetUser = "Ender_Owner") => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/quick-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: targetUser }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setQuickLoginOpen(false);
        setLoginModalOpen(false);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0d1117]/95 backdrop-blur border-b border-purple-900/30 text-slate-100 shadow-xl">
      {/* Top Banner Bar */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-xs py-1.5 px-4 border-b border-purple-900/20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-extrabold bg-purple-600 text-white shadow">
              СЕРВЕР BLACK
            </span>
            <span className="text-purple-300 hidden md:inline">
              🔥 Добро пожаловать на официальный форум Ender Online!
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div 
              onClick={handleCopyIp}
              className="flex items-center gap-1.5 bg-slate-950/80 hover:bg-slate-900 text-purple-300 hover:text-purple-200 px-2.5 py-0.5 rounded border border-purple-800/40 cursor-pointer transition font-mono text-[11px]"
              title="Нажмите, чтобы скопировать IP"
            >
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>IP: <strong className="text-white">black.ender-online.ru:7777</strong></span>
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 opacity-60" />}
            </div>

            {/* Quick Login Owner trigger button */}
            {!user && (
              <button
                onClick={() => handleQuickLoginOwner("Ender_Owner")}
                className="bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-slate-950 font-bold px-2.5 py-0.5 rounded text-[11px] flex items-center gap-1 transition shadow cursor-pointer"
              >
                <Crown className="w-3 h-3 text-slate-950 fill-slate-950" />
                <span>Войти как Владелец</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Header Nav */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <a href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-amber-500 p-0.5 shadow-lg shadow-purple-900/40 group-hover:scale-105 transition transform">
            <div className="w-full h-full bg-[#0d1117] rounded-[10px] flex items-center justify-center font-extrabold text-lg text-purple-400 group-hover:text-purple-300">
              E
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-purple-200 to-amber-400 bg-clip-text text-transparent font-sans">
              ENDER ONLINE
            </div>
            <div className="text-[10px] text-purple-400 font-semibold tracking-widest uppercase">
              RolePlay Forum • BLACK
            </div>
          </div>
        </a>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
          <a
            href="/"
            className={`px-3 py-1.5 rounded-lg transition ${
              pathname === "/" ? "bg-purple-900/50 text-purple-200 font-semibold border border-purple-700/50" : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
            }`}
          >
            Главная
          </a>

          <a
            href="/#server-black"
            className="px-3 py-1.5 rounded-lg text-amber-300 hover:bg-amber-950/40 hover:text-amber-200 transition font-semibold flex items-center gap-1"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            Сервер BLACK
          </a>

          <a
            href="/forums/5"
            className="px-3 py-1.5 rounded-lg text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition flex items-center gap-1"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            Жалобы
          </a>

          <a
            href="/forums/6"
            className="px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition flex items-center gap-1"
          >
            <FileText className="w-4 h-4 text-blue-400" />
            Организации
          </a>

          <a
            href="/threads/1"
            className="px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition flex items-center gap-1"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            Правила
          </a>

          <a
            href="/members"
            className="px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition flex items-center gap-1"
          >
            <Users className="w-4 h-4 text-indigo-400" />
            Состав & Игроки
          </a>
        </nav>

        {/* User / Auth Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              {/* Admin Panel Link if Owner or Staff */}
              {["owner", "ga", "zga"].includes(user.role) && (
                <a
                  href="/admin"
                  className="bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold text-xs px-3 py-1.5 rounded-lg border border-purple-500/50 shadow-md flex items-center gap-1.5 transition"
                >
                  <Crown className="w-4 h-4 text-yellow-300" />
                  <span className="hidden sm:inline">Админ-Панель</span>
                </a>
              )}

              {/* Profile Link */}
              <a
                href={`/profile/${user.id}`}
                className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-lg px-2.5 py-1 transition group"
              >
                <img
                  src={user.avatarUrl || "https://api.dicebear.com/7.x/identicon/svg?seed=user"}
                  alt={user.username}
                  className="w-7 h-7 rounded-full object-cover border border-purple-500/40"
                />
                <span className="text-xs font-semibold text-slate-200 group-hover:text-purple-300">
                  {user.username}
                </span>
              </a>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                title="Выйти из аккаунта"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLoginModalOpen(true)}
                className="text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-1 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-purple-400" />
                <span>Войти</span>
              </button>

              <button
                onClick={() => setRegisterModalOpen(true)}
                className="text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 px-3 py-1.5 rounded-lg shadow-md transition flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Регистрация</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white bg-slate-900 rounded-lg border border-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#121824] border-t border-slate-800 p-4 space-y-2 text-sm">
          <a href="/" className="block py-2 text-slate-200 hover:text-purple-400">Главная</a>
          <a href="/#server-black" className="block py-2 text-amber-300 font-semibold">Сервер BLACK</a>
          <a href="/forums/5" className="block py-2 text-rose-400">Жалобы сервера BLACK</a>
          <a href="/forums/6" className="block py-2 text-slate-300">Государственные организации</a>
          <a href="/threads/1" className="block py-2 text-emerald-400">Правила сервера</a>
          <a href="/members" className="block py-2 text-indigo-300">Состав Администрации</a>
          {user && ["owner", "ga", "zga"].includes(user.role) && (
            <a href="/admin" className="block py-2 text-yellow-300 font-bold">👑 Панель Управления Владельца</a>
          )}
        </div>
      )}

      {/* LOGIN MODAL */}
      {loginModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-purple-900/60 rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setLoginModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <LogIn className="w-5 h-5 text-purple-400" />
              Авторизация на форуме
            </h3>
            <p className="text-xs text-slate-400 mb-4">Ender Online • Сервер BLACK</p>

            {authError && (
              <div className="bg-rose-950/80 border border-rose-600/60 text-rose-200 text-xs p-3 rounded-lg mb-4">
                {authError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Никнейм на сервере</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Имя_Фамилия (напр. Ender_Owner)"
                  className="w-full bg-[#0d1117] border border-slate-700 focus:border-purple-500 rounded-lg px-3 py-2 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Пароль</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Пароль..."
                  className="w-full bg-[#0d1117] border border-slate-700 focus:border-purple-500 rounded-lg px-3 py-2 text-sm text-white outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 rounded-lg text-sm transition shadow-lg"
              >
                {isSubmitting ? "Вход..." : "Войти"}
              </button>
            </form>

            {/* Quick Demo Switcher */}
            <div className="mt-6 pt-4 border-t border-slate-800">
              <div className="text-[11px] font-semibold text-purple-300 mb-2 uppercase tracking-wide">
                Быстрый тестовый вход в 1 клик:
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLoginOwner("Ender_Owner")}
                  className="bg-purple-950/80 hover:bg-purple-900 border border-purple-600/50 text-purple-200 text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1 font-medium transition"
                >
                  <Crown className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Владелец (Owner)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLoginOwner("Alex_Mason")}
                  className="bg-red-950/80 hover:bg-red-900 border border-red-600/50 text-red-200 text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1 font-medium transition"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                  <span>Гл. Админ (GA)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER MODAL */}
      {registerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-purple-900/60 rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setRegisterModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-purple-400" />
              Регистрация аккаунта
            </h3>
            <p className="text-xs text-slate-400 mb-4">Создайте профиль на форуме Ender Online (Сервер BLACK)</p>

            {authError && (
              <div className="bg-rose-950/80 border border-rose-600/60 text-rose-200 text-xs p-3 rounded-lg mb-4">
                {authError}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Игровой Никнейм</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Формат: Имя_Фамилия (напр. Ivan_Ivanov)"
                  className="w-full bg-[#0d1117] border border-slate-700 focus:border-purple-500 rounded-lg px-3 py-2 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mail@example.com"
                  className="w-full bg-[#0d1117] border border-slate-700 focus:border-purple-500 rounded-lg px-3 py-2 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Пароль</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Минимум 5 символов..."
                  className="w-full bg-[#0d1117] border border-slate-700 focus:border-purple-500 rounded-lg px-3 py-2 text-sm text-white outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 rounded-lg text-sm transition shadow-lg"
              >
                {isSubmitting ? "Регистрация..." : "Зарегистрироваться"}
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
