"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { UserBadge } from "@/components/UserBadge";
import { UserSession } from "@/lib/auth";
import { 
  Crown, 
  ShieldAlert, 
  Users, 
  FolderPlus, 
  Server, 
  FileText, 
  Check, 
  X, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  Save, 
  Sparkles, 
  Activity, 
  Megaphone,
  Home,
  ChevronRight
} from "lucide-react";

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  customTitle: string | null;
  badgeColor: string | null;
  warnings: number;
  isBanned: boolean;
  banReason: string | null;
  createdAt: string;
}

interface AuditLog {
  id: number;
  action: string;
  details: string | null;
  createdAt: string;
  username: string;
}

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "boards" | "server" | "logs">("overview");

  // Users Management State
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [role, setRole] = useState("user");
  const [customTitle, setCustomTitle] = useState("");
  const [badgeColor, setBadgeColor] = useState("purple-glow");
  const [warnings, setWarnings] = useState(0);
  const [isBanned, setIsBanned] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [userSaveMsg, setUserSaveMsg] = useState("");

  // Boards State
  const [newCatTitle, setNewCatTitle] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardCatId, setNewBoardCatId] = useState("2");
  const [boardSaveMsg, setBoardSaveMsg] = useState("");

  // Server BLACK State
  const [ipAddress, setIpAddress] = useState("black.ender-online.ru:7777");
  const [onlinePlayers, setOnlinePlayers] = useState(842);
  const [maxPlayers, setMaxPlayers] = useState(1000);
  const [status, setStatus] = useState("ONLINE");
  const [announcement, setAnnouncement] = useState("");
  const [serverSaveMsg, setServerSaveMsg] = useState("");

  // Audit Logs State
  const [logs, setLogs] = useState<AuditLog[]>([]);

  const fetchAdminData = async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      if (meRes.ok) {
        const meData = await meRes.json();
        setCurrentUser(meData.user);
      }

      // Fetch Users
      const usersRes = await fetch("/api/admin/users");
      if (usersRes.ok) {
        const uData = await usersRes.json();
        setUsersList(uData.users || []);
      }

      // Fetch Server Info
      const serverRes = await fetch("/api/admin/server");
      if (serverRes.ok) {
        const sData = await serverRes.json();
        if (sData.serverInfo) {
          setIpAddress(sData.serverInfo.ipAddress);
          setOnlinePlayers(sData.serverInfo.onlinePlayers);
          setMaxPlayers(sData.serverInfo.maxPlayers);
          setStatus(sData.serverInfo.status);
          setAnnouncement(sData.serverInfo.announcement || "");
        }
      }

      // Fetch Audit Logs
      const logsRes = await fetch("/api/admin/audit");
      if (logsRes.ok) {
        const lData = await logsRes.json();
        setLogs(lData.logs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleSelectUser = (u: AdminUser) => {
    setSelectedUser(u);
    setRole(u.role);
    setCustomTitle(u.customTitle || "");
    setBadgeColor(u.badgeColor || "purple-glow");
    setWarnings(u.warnings || 0);
    setIsBanned(u.isBanned || false);
    setBanReason(u.banReason || "");
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          role,
          customTitle,
          badgeColor,
          warnings,
          isBanned,
          banReason,
        }),
      });

      if (res.ok) {
        setUserSaveMsg("Данные пользователя обновлены!");
        fetchAdminData();
        setTimeout(() => setUserSaveMsg(""), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatTitle.trim()) return;

    try {
      const res = await fetch("/api/admin/forums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "category",
          title: newCatTitle,
          description: newCatDesc,
          isServerCategory: true,
        }),
      });

      if (res.ok) {
        setBoardSaveMsg("Новая категория создана!");
        setNewCatTitle("");
        setNewCatDesc("");
        setTimeout(() => setBoardSaveMsg(""), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;

    try {
      const res = await fetch("/api/admin/forums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "forum",
          title: newBoardTitle,
          categoryId: newBoardCatId,
        }),
      });

      if (res.ok) {
        setBoardSaveMsg("Новый раздел на сервере BLACK создан!");
        setNewBoardTitle("");
        setTimeout(() => setBoardSaveMsg(""), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveServerInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/server", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ipAddress,
          onlinePlayers,
          maxPlayers,
          status,
          announcement,
        }),
      });

      if (res.ok) {
        setServerSaveMsg("Настройки Сервера BLACK успешно сохранены!");
        setTimeout(() => setServerSaveMsg(""), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickLoginOwner = async () => {
    await fetch("/api/auth/quick-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "Ender_Owner" }),
    });
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d13] text-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-purple-400 font-semibold animate-pulse">
          Загрузка Панели Управления Владельца Ender Online...
        </div>
      </div>
    );
  }

  const isOwner = currentUser && currentUser.role === "owner";

  return (
    <div className="min-h-screen bg-[#090d13] text-slate-100 font-sans flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-400">
          <a href="/" className="hover:text-purple-300 flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Главная</span>
          </a>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="text-yellow-400 font-bold">Панель Управления Владельца</span>
        </nav>

        {/* Top Owner Header */}
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-800/60 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
              <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span>Официальная Панель Владельца Ender Online</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Администрирование • Сервер BLACK
            </h1>
            <p className="text-xs text-slate-300">
              Управление ролями, фракциями, предупреждениями, банами и настройками сервера.
            </p>
          </div>

          {!isOwner && (
            <button
              onClick={handleQuickLoginOwner}
              className="bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Crown className="w-4 h-4 fill-slate-950" />
              <span>Переключиться на Владельца (Ender_Owner)</span>
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[#161b22] border border-slate-800 rounded-xl p-2 flex flex-wrap gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "overview" ? "bg-purple-600 text-white shadow" : "bg-slate-900 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Обзор и Статус</span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "users" ? "bg-purple-600 text-white shadow" : "bg-slate-900 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Пользователи и Роли ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("boards")}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "boards" ? "bg-purple-600 text-white shadow" : "bg-slate-900 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <FolderPlus className="w-4 h-4" />
            <span>Форумы Сервера BLACK</span>
          </button>

          <button
            onClick={() => setActiveTab("server")}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "server" ? "bg-purple-600 text-white shadow" : "bg-slate-900 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Server className="w-4 h-4 text-amber-400" />
            <span>Настройки BLACK Server</span>
          </button>

          <button
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "logs" ? "bg-purple-600 text-white shadow" : "bg-slate-900 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Логи Действий</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-2">
              <div className="text-xs text-slate-400 font-semibold uppercase">Сервер Проекта</div>
              <div className="text-2xl font-extrabold text-amber-400">Ender Online | BLACK</div>
              <p className="text-xs text-slate-300 font-mono">IP: {ipAddress}</p>
            </div>

            <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-2">
              <div className="text-xs text-slate-400 font-semibold uppercase">Игроков Онлайн</div>
              <div className="text-3xl font-extrabold text-emerald-400 font-mono">{onlinePlayers} / {maxPlayers}</div>
              <p className="text-xs text-slate-400">Единственный активный сервер проекта</p>
            </div>

            <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-2">
              <div className="text-xs text-slate-400 font-semibold uppercase">Текущий Пользователь</div>
              <div className="text-xl font-bold text-white flex items-center gap-2">
                <span>{currentUser?.username || "Гость"}</span>
              </div>
              <UserBadge role={currentUser?.role || "user"} customTitle={currentUser?.customTitle} size="sm" />
            </div>
          </div>
        )}

        {/* TAB 2: USER & ROLE MANAGEMENT */}
        {activeTab === "users" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Users List Column */}
            <div className="lg:col-span-5 bg-[#161b22] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 bg-slate-900 border-b border-slate-800 font-bold text-xs uppercase text-slate-300">
                Зарегистрированные Пользователи ({usersList.length})
              </div>

              <div className="divide-y divide-slate-800 max-h-[500px] overflow-y-auto">
                {usersList.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => handleSelectUser(u)}
                    className={`p-3 hover:bg-slate-900 transition cursor-pointer flex items-center justify-between gap-2 text-xs ${
                      selectedUser?.id === u.id ? "bg-purple-950/60 border-l-4 border-purple-500" : ""
                    }`}
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="font-bold text-slate-100 truncate">{u.username}</div>
                      <UserBadge role={u.role} customTitle={u.customTitle} size="sm" />
                    </div>

                    {u.isBanned ? (
                      <span className="bg-rose-950 text-rose-300 border border-rose-600/50 px-2 py-0.5 rounded text-[10px] font-bold">
                        ЗАБАНЕН
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px] font-mono">ID: {u.id}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* User Edit Form Column */}
            <div className="lg:col-span-7 bg-[#161b22] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              {!selectedUser ? (
                <div className="text-center py-16 text-slate-500 text-sm">
                  Выберите пользователя из списка слева для управления правами и рангом.
                </div>
              ) : (
                <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
                  <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-extrabold text-white">Редактирование: {selectedUser.username}</h3>
                      <p className="text-slate-400">Email: {selectedUser.email}</p>
                    </div>

                    <UserBadge role={selectedUser.role} customTitle={selectedUser.customTitle} size="md" />
                  </div>

                  {userSaveMsg && (
                    <div className="bg-emerald-950/80 border border-emerald-600/60 p-3 rounded-xl text-emerald-300 font-bold flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>{userSaveMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Роль / Должность на форуме</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full bg-[#0d1117] border border-slate-700 text-white rounded-xl p-2.5 outline-none font-bold"
                      >
                        <option value="owner">👑 Владелец / Основатель (Owner)</option>
                        <option value="ga">🛡️ Главный Администратор (GA)</option>
                        <option value="zga">⚖️ Зам. Главного Администратора (ZGA)</option>
                        <option value="curator">💼 Главный Следящий / Куратор</option>
                        <option value="admin">Администратор [BLACK]</option>
                        <option value="leader">Лидер Фракции</option>
                        <option value="user">Игрок сервера BLACK</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Кастомный Текст-Плашка</label>
                      <input
                        type="text"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        placeholder="Например: Следящий за ГОСС [BLACK]"
                        className="w-full bg-[#0d1117] border border-slate-700 text-white rounded-xl p-2.5 outline-none font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Предупреждения (Варны 0-3)</label>
                      <input
                        type="number"
                        min={0}
                        max={3}
                        value={warnings}
                        onChange={(e) => setWarnings(Number(e.target.value))}
                        className="w-full bg-[#0d1117] border border-slate-700 text-white rounded-xl p-2.5 outline-none font-bold"
                      />
                    </div>
                  </div>

                  {/* Ban controls */}
                  <div className="bg-rose-950/30 border border-rose-900/50 p-4 rounded-xl space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="ban-user"
                        checked={isBanned}
                        onChange={(e) => setIsBanned(e.target.checked)}
                        className="rounded border-slate-700 text-rose-600 focus:ring-rose-500"
                      />
                      <label htmlFor="ban-user" className="font-extrabold text-rose-300 cursor-pointer">
                        Заблокировать аккаунт на форуме
                      </label>
                    </div>

                    {isBanned && (
                      <div>
                        <label className="block font-bold text-slate-300 mb-1">Причина блокировки</label>
                        <input
                          type="text"
                          value={banReason}
                          onChange={(e) => setBanReason(e.target.value)}
                          placeholder="Причина: Нарушение правил проекта..."
                          className="w-full bg-[#0d1117] border border-rose-800 text-white rounded-xl p-2 outline-none font-medium"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold px-6 py-2.5 rounded-xl transition shadow-lg flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Сохранить Роль и Права</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: BOARDS MANAGEMENT */}
        {activeTab === "boards" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-purple-400" />
                <span>Создать новую Категорию</span>
              </h3>

              {boardSaveMsg && (
                <div className="bg-emerald-950/80 border border-emerald-600/60 p-3 rounded-xl text-emerald-300 text-xs font-bold">
                  {boardSaveMsg}
                </div>
              )}

              <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Название Категории</label>
                  <input
                    type="text"
                    required
                    value={newCatTitle}
                    onChange={(e) => setNewCatTitle(e.target.value)}
                    placeholder="Например: ⬛ СЕРВЕР BLACK"
                    className="w-full bg-[#0d1117] border border-slate-700 text-white rounded-xl p-2.5 outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Описание</label>
                  <input
                    type="text"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    placeholder="Описание категории..."
                    className="w-full bg-[#0d1117] border border-slate-700 text-white rounded-xl p-2.5 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl shadow-lg transition"
                >
                  Создать Категорию
                </button>
              </form>
            </div>

            <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-amber-400" />
                <span>Добавить Форум в Сервер BLACK</span>
              </h3>

              <form onSubmit={handleCreateBoard} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Название Форума / Подраздела</label>
                  <input
                    type="text"
                    required
                    value={newBoardTitle}
                    onChange={(e) => setNewBoardTitle(e.target.value)}
                    placeholder="Например: ФСБ / Правительство"
                    className="w-full bg-[#0d1117] border border-slate-700 text-white rounded-xl p-2.5 outline-none font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-2.5 rounded-xl shadow-lg transition"
                >
                  Добавить Форум на Сервер BLACK
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: SERVER BLACK SETTINGS */}
        {activeTab === "server" && (
          <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 max-w-3xl mx-auto">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Server className="w-5 h-5 text-amber-400" />
                  <span>Конфигурация Сервера BLACK</span>
                </h3>
                <p className="text-xs text-slate-400">Настройки IP, онлайна и бегущей строки</p>
              </div>

              <span className="bg-amber-500 text-slate-950 font-extrabold text-xs px-2.5 py-1 rounded">
                BLACK SERVER
              </span>
            </div>

            {serverSaveMsg && (
              <div className="bg-emerald-950/80 border border-emerald-600/60 p-3 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{serverSaveMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveServerInfo} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">IP Адрес Сервера</label>
                  <input
                    type="text"
                    required
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    className="w-full bg-[#0d1117] border border-slate-700 text-white rounded-xl p-2.5 outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Статус Сервера</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-[#0d1117] border border-slate-700 text-white rounded-xl p-2.5 outline-none font-bold"
                  >
                    <option value="ONLINE">ONLINE (Работает)</option>
                    <option value="MAINTENANCE">ТЕХ. РАБОТЫ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Текущий Онлайн (Игроков)</label>
                  <input
                    type="number"
                    value={onlinePlayers}
                    onChange={(e) => setOnlinePlayers(Number(e.target.value))}
                    className="w-full bg-[#0d1117] border border-slate-700 text-white rounded-xl p-2.5 outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Максимум Слот</label>
                  <input
                    type="number"
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(Number(e.target.value))}
                    className="w-full bg-[#0d1117] border border-slate-700 text-white rounded-xl p-2.5 outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Текст Объявления (Анонс вверху форума)</label>
                <textarea
                  rows={3}
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  placeholder="Текст новости..."
                  className="w-full bg-[#0d1117] border border-slate-700 text-white rounded-xl p-3 outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl transition shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4 fill-slate-950" />
                  <span>Сохранить Настройки Сервера</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 5: AUDIT LOGS */}
        {activeTab === "logs" && (
          <div className="bg-[#161b22] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-900 border-b border-slate-800 font-bold text-xs uppercase text-slate-300">
              Логи Действий Администрации
            </div>

            <div className="divide-y divide-slate-800">
              {logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-900/60 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-1">
                    <div className="font-bold text-purple-300">{log.action}</div>
                    {log.details && <p className="text-slate-300 text-[11px] font-mono">{log.details}</p>}
                  </div>

                  <div className="text-right text-slate-500 text-[11px] shrink-0">
                    <span className="text-slate-300 font-semibold">{log.username || "Админ"}</span> • {new Date(log.createdAt).toLocaleString("ru-RU")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
