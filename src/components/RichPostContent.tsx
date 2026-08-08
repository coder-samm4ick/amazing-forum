import React from "react";
import { parseBBCode } from "@/lib/bbcode";

interface RichPostContentProps {
  content: string;
  className?: string;
}

export const RichPostContent: React.FC<RichPostContentProps> = ({ content, className = "" }) => {
  const html = parseBBCode(content);

  return (
    <div
      className={`prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed font-sans space-y-2 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
