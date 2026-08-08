import React from "react";
import { Users, Crown, ShieldAlert, Shield, MessageSquare, BarChart2, Flame, ExternalLink } from "lucide-react";
import { UserBadge } from "@/components/UserBadge";

interface SidebarProps {
  stats?: {
    totalThreads: number;
    totalPosts: number;
    totalUsers: number;
    latestUser?: { id: number; username: string };
  };
  onlineStaff?: Array<{
    id: number;
    username: string;
    role: string;
    customTitle: string | null;
    avatarUrl: string | null;
  }>;
}

export const SidebarWidgets: React.FC<SidebarProps> = ({ stats, onlineStaff }) => {
  const staffList = onlineStaff || [
    {
      id: 1,
      username: "Ender_Owner",
      role: "owner",
      customTitle: "👑 Владелец Проекта",
      avatarUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: 2,
      username: "Alex_Mason",
      role: "ga",
      customTitle: "🛡️ Главный Администратор",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: 3,
      username: "Mikhail_Volkov",
      role: "zga",
      customTitle: "⚖️ Зам. Гл. Администратора",
      avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
    },
  ];

  return (
    <aside className="space-y-6">
      {/* Online Staff Team */}
      <div className="bg-[#161b22] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-purple-950 to-slate-900 border-b border-purple-900/40 p-3.5 flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Администрация Онлайн</span>
          </h3>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        </div>

        <div className="p-3 space-y-3 divide-y divide-slate-800/60">
          {staffList.map((st) => (
            <div key={st.id} className="pt-2 first:pt-0 flex items-center gap-3">
              <a href={`/profile/${st.id}`}>
                <img
                  src={st.avatarUrl || "https://api.dicebear.com/7.x/identicon/svg?seed=user"}
                  alt={st.username}
                  className="w-9 h-9 rounded-lg border border-purple-500/40 object-cover"
                />
              </a>
              <div className="space-y-1 min-w-0 flex-1">
                <a
                  href={`/profile/${st.id}`}
                  className="text-xs font-bold text-slate-100 hover:text-purple-300 block truncate"
                >
                  {st.username}
                </a>
                <UserBadge role={st.role} customTitle={st.customTitle} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Forum Statistics */}
      <div className="bg-[#161b22] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="bg-slate-900 border-b border-slate-800 p-3.5 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
            Статистика Форума
          </h3>
        </div>

        <div className="p-4 space-y-3 text-xs">
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Всего тем:</span>
            <strong className="text-purple-300 font-mono text-sm">{stats?.totalThreads || 14}</strong>
          </div>

          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Всего сообщений:</span>
            <strong className="text-slate-200 font-mono text-sm">{stats?.totalPosts || 82}</strong>
          </div>

          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Пользователей:</span>
            <strong className="text-emerald-400 font-mono text-sm">{stats?.totalUsers || 248}</strong>
          </div>

          {stats?.latestUser && (
            <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center">
              <span className="text-slate-400">Новый пользователь:</span>
              <a
                href={`/profile/${stats.latestUser.id}`}
                className="text-purple-400 hover:underline font-bold"
              >
                {stats.latestUser.username}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Social Links Banner */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-purple-800/40 rounded-xl p-4 space-y-3 text-xs shadow-lg">
        <h3 className="font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
          Сообщество Ender Online
        </h3>
        <p className="text-slate-300 text-xs leading-relaxed">
          Вступайте в официальную группу ВКонтакте и Discord сервер проекта Ender Online [BLACK].
        </p>

        <div className="space-y-2 pt-1">
          <a
            href="https://vk.com/ender_online"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#0077ff] hover:bg-[#0066ee] text-white font-bold py-2 px-3 rounded-lg flex items-center justify-between transition shadow"
          >
            <span>ВКонтакте Ender Online</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <a
            href="https://discord.gg/ender-online"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-2 px-3 rounded-lg flex items-center justify-between transition shadow"
          >
            <span>Discord Сервер BLACK</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </aside>
  );
};
