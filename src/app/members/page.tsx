import React from "react";
import { Header } from "@/components/Header";
import { UserBadge } from "@/components/UserBadge";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";
import { desc, sql } from "drizzle-orm";
import { Crown, Shield, Users, MessageSquare, Star, Home, ChevronRight } from "lucide-react";

export const revalidate = 0;

export default async function MembersPage() {
  await ensureSeeded();

  const staffMembers = await db
    .select()
    .from(users)
    .where(sql`${users.role} IN ('owner', 'ga', 'zga', 'admin', 'curator')`)
    .orderBy(desc(users.id));

  const topActiveMembers = await db
    .select()
    .from(users)
    .orderBy(desc(users.messagesCount))
    .limit(20);

  return (
    <div className="min-h-screen bg-[#090d13] text-slate-100 font-sans flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-400">
          <a href="/" className="hover:text-purple-300 flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Главная</span>
          </a>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="text-purple-300 font-bold">Команда проекта & Игроки</span>
        </nav>

        {/* Staff Team Section */}
        <section className="space-y-4">
          <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-800/60 rounded-2xl p-6 shadow-2xl flex items-center gap-3">
            <Crown className="w-7 h-7 text-amber-400" />
            <div>
              <h1 className="text-2xl font-extrabold text-white">Руководство & Администрация Ender Online</h1>
              <p className="text-xs text-slate-300">Состав команды сервера BLACK</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffMembers.map((member) => (
              <div
                key={member.id}
                className="bg-[#161b22] border border-slate-800 hover:border-purple-500/50 rounded-2xl p-5 shadow-xl flex items-center gap-4 transition group"
              >
                <a href={`/profile/${member.id}`}>
                  <img
                    src={member.avatarUrl || "https://api.dicebear.com/7.x/identicon/svg?seed=user"}
                    alt={member.username}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-500/40 group-hover:scale-105 transition transform"
                  />
                </a>

                <div className="space-y-1.5 min-w-0 flex-1">
                  <a
                    href={`/profile/${member.id}`}
                    className="text-base font-bold text-white hover:text-purple-300 block truncate"
                  >
                    {member.username}
                  </a>

                  <UserBadge role={member.role} customTitle={member.customTitle} size="sm" />

                  <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-1">
                    <span>Сообщений: <strong className="text-purple-300">{member.messagesCount}</strong></span>
                    <span>•</span>
                    <span>Реакций: <strong className="text-emerald-400">{member.reactionScore}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Top Active Players Section */}
        <section className="space-y-4">
          <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center gap-3">
            <Users className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-xl font-extrabold text-white">Список пользователей форума</h2>
              <p className="text-xs text-slate-400">Самые активные игроки сервера BLACK</p>
            </div>
          </div>

          <div className="bg-[#161b22] border border-slate-800 rounded-2xl overflow-hidden shadow-xl divide-y divide-slate-800/80">
            {topActiveMembers.map((u, idx) => (
              <div key={u.id} className="p-4 hover:bg-slate-900/60 transition flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono font-extrabold text-purple-400 text-sm w-6 text-center">
                    #{idx + 1}
                  </span>

                  <a href={`/profile/${u.id}`}>
                    <img
                      src={u.avatarUrl || "https://api.dicebear.com/7.x/identicon/svg?seed=user"}
                      alt={u.username}
                      className="w-10 h-10 rounded-xl object-cover border border-purple-500/30"
                    />
                  </a>

                  <div className="min-w-0">
                    <a href={`/profile/${u.id}`} className="font-bold text-sm text-slate-200 hover:text-purple-300 block truncate">
                      {u.username}
                    </a>
                    <UserBadge role={u.role} customTitle={u.customTitle} size="sm" />
                  </div>
                </div>

                <div className="flex items-center gap-6 font-mono text-slate-400">
                  <div>
                    Сообщений: <strong className="text-purple-300 text-sm">{u.messagesCount}</strong>
                  </div>
                  <div>
                    Реакций: <strong className="text-emerald-400 text-sm">{u.reactionScore}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
