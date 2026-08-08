import React from "react";
import { Crown, Shield, ShieldAlert, Award, User, Star } from "lucide-react";

interface UserBadgeProps {
  role: string;
  customTitle?: string | null;
  badgeColor?: string | null;
  size?: "sm" | "md" | "lg";
}

export const UserBadge: React.FC<UserBadgeProps> = ({ role, customTitle, badgeColor, size = "md" }) => {
  let title = customTitle || "Игрок";
  let icon = <User className="w-3.5 h-3.5 inline mr-1" />;
  let colorClasses = "bg-slate-800 text-slate-300 border-slate-700";

  switch (role) {
    case "owner":
      title = customTitle || "👑 Владелец Проекта";
      icon = <Crown className="w-3.5 h-3.5 inline mr-1 text-yellow-300 animate-pulse" />;
      colorClasses = "bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-purple-200 border-purple-500/50 shadow-lg shadow-purple-900/30 ring-1 ring-purple-400/30 font-semibold";
      break;
    case "ga":
      title = customTitle || "🛡️ Главный Администратор";
      icon = <ShieldAlert className="w-3.5 h-3.5 inline mr-1 text-red-400" />;
      colorClasses = "bg-gradient-to-r from-red-950 to-rose-900 text-red-200 border-red-600/50 shadow-md font-semibold";
      break;
    case "zga":
      title = customTitle || "⚖️ Зам. Главного Администратора";
      icon = <Shield className="w-3.5 h-3.5 inline mr-1 text-amber-400" />;
      colorClasses = "bg-gradient-to-r from-amber-950 to-orange-900 text-amber-200 border-amber-600/50 font-semibold";
      break;
    case "admin":
      title = customTitle || "Администратор [BLACK]";
      icon = <Shield className="w-3.5 h-3.5 inline mr-1 text-blue-400" />;
      colorClasses = "bg-blue-950/80 text-blue-200 border-blue-600/50 font-medium";
      break;
    case "curator":
      title = customTitle || "Главный Следящий";
      icon = <Award className="w-3.5 h-3.5 inline mr-1 text-sky-400" />;
      colorClasses = "bg-sky-950/80 text-sky-200 border-sky-600/50 font-medium";
      break;
    case "leader":
      title = customTitle || "Лидер Фракции";
      icon = <Star className="w-3.5 h-3.5 inline mr-1 text-emerald-400" />;
      colorClasses = "bg-emerald-950/80 text-emerald-200 border-emerald-600/50 font-medium";
      break;
    default:
      if (badgeColor === "purple-glow") {
        colorClasses = "bg-purple-950 text-purple-200 border-purple-600/50 font-medium";
      }
      break;
  }

  const sizeClasses = {
    sm: "text-[11px] px-2 py-0.5 rounded",
    md: "text-xs px-2.5 py-1 rounded-md",
    lg: "text-sm px-3 py-1.5 rounded-lg",
  }[size];

  return (
    <span className={`inline-flex items-center border tracking-wide uppercase ${sizeClasses} ${colorClasses}`}>
      {icon}
      <span>{title}</span>
    </span>
  );
};
