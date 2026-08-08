"use client";

import React, { useState } from "react";
import { Server, Users, Flame, Copy, Check, Megaphone, ShieldAlert, Sparkles, ExternalLink } from "lucide-react";

interface ServerStatusProps {
  serverInfo?: {
    serverName: string;
    ipAddress: string;
    onlinePlayers: number;
    maxPlayers: number;
    status: string;
    announcement: string;
  };
}

export const ServerStatusBanner: React.FC<ServerStatusProps> = ({ serverInfo }) => {
  const [copied, setCopied] = useState(false);

  const ip = serverInfo?.ipAddress || "black.ender-online.ru:7777";
  const online = serverInfo?.onlinePlayers || 842;
  const max = serverInfo?.maxPlayers || 1000;
  const announcement = serverInfo?.announcement || "Добро пожаловать на официальный форум Ender Online (Сервер BLACK)! Подавайте жалобы и заявления на лидерки в соответствующих разделах.";

  const percentage = Math.min(100, Math.round((online / max) * 100));

  const handleCopyIp = () => {
    navigator.clipboard.writeText(ip);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-6 space-y-3">
      {/* Hero Ender Online Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-950 via-[#131722] to-slate-950 border border-purple-800/40 p-6 md:p-8 shadow-2xl">
        {/* Decorative Glow Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Title & Description */}
          <div className="lg:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-500/40 text-purple-300 text-xs font-semibold backdrop-blur">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>ЕДИНСТВЕННЫЙ И ОФИЦИАЛЬНЫЙ СЕРВЕР ПРОЕКТА</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white font-sans">
              <span className="bg-gradient-to-r from-purple-400 via-indigo-200 to-purple-500 bg-clip-text text-transparent">
                ENDER ONLINE
              </span>{" "}
              — <span className="text-amber-400">СЕРВЕР BLACK</span>
            </h1>

            <p className="text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed">
              Погрузись в атмосферу настоящего Criminal Russia RolePlay! Фракции, криминальные структуры, государственные органы, бизвары и уникальный игровой мир.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="/forums/5"
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-xl text-xs md:text-sm transition shadow-lg shadow-rose-950/50 flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Подать жалобу [BLACK]</span>
              </a>

              <a
                href="/forums/6"
                className="bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-600/50 font-semibold px-4 py-2 rounded-xl text-xs md:text-sm transition flex items-center gap-2"
              >
                <span>Раздел Организаций</span>
              </a>
            </div>
          </div>

          {/* Right Column: Server BLACK Live Widget */}
          <div className="lg:col-span-4">
            <div className="bg-[#0d1117]/90 border border-purple-800/60 rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
                  <span className="text-sm font-bold text-white uppercase tracking-wider">СЕРВЕР BLACK</span>
                </div>
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-600/50">
                  ONLINE
                </span>
              </div>

              {/* Online Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-purple-400" /> Игроки онлайн:
                  </span>
                  <span className="text-purple-300 font-mono">
                    <strong className="text-white text-sm">{online}</strong> / {max}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-purple-900/40">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>

              {/* IP Widget */}
              <div className="pt-2">
                <button
                  onClick={handleCopyIp}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-purple-500 p-2.5 rounded-lg flex items-center justify-between text-xs font-mono transition group cursor-pointer"
                >
                  <span className="text-purple-300 group-hover:text-purple-200 font-bold">{ip}</span>
                  <span className="flex items-center gap-1 text-[11px] bg-purple-950 text-purple-300 px-2 py-1 rounded border border-purple-700/50">
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Скопировано!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Скопировать</span>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Announcement Marquee Ticker */}
      <div className="bg-[#121620] border border-purple-900/40 rounded-xl p-3 flex items-center gap-3 text-xs shadow-md">
        <div className="flex items-center gap-1.5 font-bold text-amber-400 bg-amber-950/80 border border-amber-600/50 px-2.5 py-1 rounded-lg shrink-0">
          <Megaphone className="w-3.5 h-3.5 text-amber-400" />
          <span>АНОНС</span>
        </div>
        <p className="text-slate-300 truncate font-medium">{announcement}</p>
      </div>
    </div>
  );
};
