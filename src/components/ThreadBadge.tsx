import React from "react";

interface ThreadBadgeProps {
  prefix: string;
  color?: string;
  size?: "sm" | "md";
}

export const ThreadBadge: React.FC<ThreadBadgeProps> = ({ prefix, color = "amber", size = "sm" }) => {
  if (!prefix) return null;

  let colorStyle = "bg-amber-950/80 text-amber-300 border-amber-600/60";

  switch (prefix.toLowerCase()) {
    case "[одобрено]":
      colorStyle = "bg-emerald-950/90 text-emerald-300 border-emerald-600/60 font-medium";
      break;
    case "[отказано]":
      colorStyle = "bg-rose-950/90 text-rose-300 border-rose-600/60 font-medium";
      break;
    case "[на рассмотрении]":
      colorStyle = "bg-amber-950/90 text-amber-300 border-amber-500/60 font-medium animate-pulse";
      break;
    case "[важно]":
      colorStyle = "bg-purple-950/90 text-purple-300 border-purple-500/60 font-bold shadow-sm shadow-purple-900/50";
      break;
    case "[информация]":
      colorStyle = "bg-blue-950/90 text-blue-300 border-blue-500/60 font-medium";
      break;
    case "[закрыто]":
      colorStyle = "bg-slate-800 text-slate-400 border-slate-700";
      break;
    default:
      if (color === "emerald") colorStyle = "bg-emerald-950/80 text-emerald-300 border-emerald-600/60";
      if (color === "red" || color === "rose") colorStyle = "bg-rose-950/80 text-rose-300 border-rose-600/60";
      if (color === "purple") colorStyle = "bg-purple-950/80 text-purple-300 border-purple-600/60";
      if (color === "blue" || color === "sky") colorStyle = "bg-sky-950/80 text-sky-300 border-sky-600/60";
      break;
  }

  const pyPx = size === "sm" ? "px-1.5 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  return (
    <span className={`inline-block border rounded tracking-wide ${pyPx} ${colorStyle} font-sans mr-2`}>
      {prefix}
    </span>
  );
};
