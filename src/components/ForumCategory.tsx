"use client";

import React from "react";
import { 
  MessageSquare, 
  ShieldAlert, 
  Building2, 
  Swords, 
  Users, 
  Wrench, 
  Coffee, 
  Newspaper, 
  FileText, 
  Lightbulb, 
  Megaphone,
  ChevronRight,
  Lock
} from "lucide-react";

interface Subforum {
  id: number;
  title: string;
  description: string | null;
  threadsCount: number;
  postsCount: number;
  isLocked: boolean;
}

interface ForumItem {
  id: number;
  title: string;
  description: string | null;
  icon: string;
  threadsCount: number;
  postsCount: number;
  isLocked: boolean;
  subforums?: Subforum[];
  lastPost?: {
    threadId: number;
    threadTitle: string;
    authorName: string;
    authorAvatar: string | null;
    createdAt: string;
  } | null;
}

interface ForumCategoryProps {
  id: number;
  title: string;
  description: string | null;
  color: string;
  isServerCategory?: boolean;
  forums: ForumItem[];
}

export const ForumCategory: React.FC<ForumCategoryProps> = ({
  title,
  description,
  isServerCategory,
  forums,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "megaphone": return <Megaphone className="w-5 h-5 text-purple-400" />;
      case "newspaper": return <Newspaper className="w-5 h-5 text-purple-400" />;
      case "file-text": return <FileText className="w-5 h-5 text-blue-400" />;
      case "lightbulb": return <Lightbulb className="w-5 h-5 text-amber-400" />;
      case "shield-alert": return <ShieldAlert className="w-5 h-5 text-rose-400" />;
      case "building-2": return <Building2 className="w-5 h-5 text-indigo-400" />;
      case "swords": return <Swords className="w-5 h-5 text-red-400" />;
      case "users": return <Users className="w-5 h-5 text-emerald-400" />;
      case "wrench": return <Wrench className="w-5 h-5 text-sky-400" />;
      case "coffee": return <Coffee className="w-5 h-5 text-amber-400" />;
      default: return <MessageSquare className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div id={isServerCategory ? "server-black" : undefined} className="mb-8 scroll-mt-20">
      {/* Category Header Bar */}
      <div className={`rounded-t-xl px-5 py-3.5 flex items-center justify-between border ${
        isServerCategory
          ? "bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border-purple-600/60 shadow-lg shadow-purple-950/40"
          : "bg-[#161b22] border-slate-800"
      }`}>
        <div>
          <h2 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            {isServerCategory && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            )}
            <span>{title}</span>
          </h2>
          {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
        </div>

        {isServerCategory && (
          <span className="text-[11px] font-extrabold bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded uppercase tracking-wider">
            СЕРВЕР BLACK
          </span>
        )}
      </div>

      {/* Forums List */}
      <div className="bg-[#0d1117] border border-t-0 border-slate-800 rounded-b-xl divide-y divide-slate-800/80 shadow-md">
        {forums.map((forum) => (
          <div
            key={forum.id}
            className="p-4 hover:bg-slate-900/60 transition group flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            {/* Left: Icon, Title, Description, Subforums */}
            <div className="flex items-start gap-3.5 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 group-hover:border-purple-500/50 transition">
                {getIcon(forum.icon)}
              </div>

              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <a
                    href={`/forums/${forum.id}`}
                    className="text-base font-bold text-slate-100 hover:text-purple-300 transition group-hover:underline"
                  >
                    {forum.title}
                  </a>
                  {forum.isLocked && (
                    <span title="Закрыто">
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                    </span>
                  )}
                </div>

                {forum.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {forum.description}
                  </p>
                )}

                {/* Sub-forums tags list */}
                {forum.subforums && forum.subforums.length > 0 && (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1.5 text-xs">
                    <span className="text-slate-500 text-[11px] font-semibold uppercase">Подразделы:</span>
                    {forum.subforums.map((sub) => (
                      <a
                        key={sub.id}
                        href={`/forums/${sub.id}`}
                        className="text-slate-300 hover:text-purple-300 transition flex items-center gap-1 bg-slate-900/80 hover:bg-slate-800 px-2 py-0.5 rounded border border-slate-800 text-[11px]"
                      >
                        <ChevronRight className="w-3 h-3 text-purple-400" />
                        <span>{sub.title}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Stats & Last Post Preview */}
            <div className="flex items-center gap-6 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/60 justify-between md:justify-end">
              {/* Stats Counters */}
              <div className="text-right text-xs font-mono space-y-0.5 min-w-[90px]">
                <div className="text-slate-300">
                  <strong className="text-purple-300 font-bold">{forum.threadsCount}</strong>{" "}
                  <span className="text-[11px] text-slate-400">тем</span>
                </div>
                <div className="text-slate-400">
                  <strong className="text-slate-200">{forum.postsCount}</strong>{" "}
                  <span className="text-[11px] text-slate-500">сообщ.</span>
                </div>
              </div>

              {/* Last Post Box */}
              <div className="min-w-[180px] max-w-[220px] bg-slate-900/90 border border-slate-800 p-2 rounded-lg text-xs">
                {forum.lastPost ? (
                  <div className="space-y-1">
                    <a
                      href={`/threads/${forum.lastPost.threadId}`}
                      className="text-slate-200 hover:text-purple-300 font-medium line-clamp-1 block"
                      title={forum.lastPost.threadTitle}
                    >
                      {forum.lastPost.threadTitle}
                    </a>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="text-purple-400 font-semibold truncate">{forum.lastPost.authorName}</span>
                      <span className="text-slate-500 text-[10px]">{forum.lastPost.createdAt}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 italic text-center">Нет сообщений</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
