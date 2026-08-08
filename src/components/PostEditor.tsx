"use client";

import React, { useRef } from "react";
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignCenter, 
  AlignLeft, 
  AlignRight, 
  Quote, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Palette, 
  FileText,
  Sparkles
} from "lucide-react";

interface PostEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  showTemplates?: boolean;
}

export const PostEditor: React.FC<PostEditorProps> = ({
  value,
  onChange,
  placeholder = "Напишите ваш ответ...",
  rows = 8,
  showTemplates = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertTag = (openTag: string, closeTag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    const replacement = `${openTag}${selectedText || ""}${closeTag}`;
    const newValue = value.substring(0, start) + replacement + value.substring(end);

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + openTag.length, end + openTag.length);
    }, 0);
  };

  const insertComplaintTemplate = () => {
    const template = `1. Ваш никнейм: 
2. Никнейм нарушителя / Администратора: 
3. Суть жалобы: 
4. Доказательства (скриншот / видео с /time): 
5. Готовы ли вы нести ответственность в случае обмана: Да`;
    onChange(value ? `${value}\n\n${template}` : template);
  };

  const insertLeaderTemplate = () => {
    const template = `[CENTER][B][SIZE=5][COLOR=rgb(168, 85, 247)]Заявление на пост Лидера Фракции[/COLOR][/SIZE][/B][/CENTER]

[B]IC Информация:[/B]
1. Имя Фамилия: 
2. Ваш игровой уровень (4+): 
3. Ваша краткая биография: 
4. Почему именно Вы должны занять данный пост: 

[B]OOC Информация:[/B]
1. Ваше реальное имя: 
2. Ваш возраст: 
3. Ваш часовой пояс: 
4. Ваш суточный онлайн: 
5. Ваш Discord: 
6. Ссылка на страницу VK: `;
    onChange(value ? `${value}\n\n${template}` : template);
  };

  return (
    <div className="bg-[#0d1117] border border-slate-700/80 rounded-xl overflow-hidden focus-within:border-purple-500 transition shadow-inner">
      {/* BBCode Toolbar */}
      <div className="bg-[#161b22] border-b border-slate-800 p-2 flex flex-wrap items-center gap-1 text-xs">
        <button
          type="button"
          onClick={() => insertTag("[B]", "[/B]")}
          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded"
          title="Жирный [B]"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => insertTag("[I]", "[/I]")}
          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded"
          title="Курсив [I]"
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => insertTag("[U]", "[/U]")}
          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded"
          title="Подчеркнутый [U]"
        >
          <Underline className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-slate-700 mx-1"></div>

        <button
          type="button"
          onClick={() => insertTag("[CENTER]", "[/CENTER]")}
          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded"
          title="По центру [CENTER]"
        >
          <AlignCenter className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => insertTag("[LEFT]", "[/LEFT]")}
          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded"
          title="По левому краю [LEFT]"
        >
          <AlignLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => insertTag("[RIGHT]", "[/RIGHT]")}
          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded"
          title="По правому краю [RIGHT]"
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-slate-700 mx-1"></div>

        <button
          type="button"
          onClick={() => insertTag("[COLOR=rgb(168, 85, 247)]", "[/COLOR]")}
          className="p-1.5 hover:bg-slate-800 text-purple-400 hover:text-purple-300 rounded flex items-center gap-1 font-semibold"
          title="Пурпурный цвет"
        >
          <Palette className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => insertTag("[COLOR=rgb(239, 68, 68)]", "[/COLOR]")}
          className="p-1.5 hover:bg-slate-800 text-rose-400 hover:text-rose-300 rounded font-semibold"
          title="Красный цвет"
        >
          Красный
        </button>

        <button
          type="button"
          onClick={() => insertTag("[COLOR=rgb(16, 185, 129)]", "[/COLOR]")}
          className="p-1.5 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 rounded font-semibold"
          title="Зеленый цвет"
        >
          Зеленый
        </button>

        <div className="w-px h-4 bg-slate-700 mx-1"></div>

        <button
          type="button"
          onClick={() => insertTag("[QUOTE]", "[/QUOTE]")}
          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded"
          title="Цитата [QUOTE]"
        >
          <Quote className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => insertTag("[IMG]", "[/IMG]")}
          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded"
          title="Изображение [IMG]"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => insertTag("[URL=https://]", "[/URL]")}
          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded"
          title="Ссылка [URL]"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        {showTemplates && (
          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={insertComplaintTemplate}
              className="bg-rose-950/80 text-rose-300 hover:bg-rose-900 border border-rose-600/40 text-[11px] px-2 py-0.5 rounded flex items-center gap-1 font-semibold"
            >
              <FileText className="w-3 h-3" />
              <span>Форма жалобы</span>
            </button>

            <button
              type="button"
              onClick={insertLeaderTemplate}
              className="bg-purple-950/80 text-purple-300 hover:bg-purple-900 border border-purple-600/40 text-[11px] px-2 py-0.5 rounded flex items-center gap-1 font-semibold"
            >
              <Sparkles className="w-3 h-3" />
              <span>Форма заявки</span>
            </button>
          </div>
        )}
      </div>

      <textarea
        ref={textareaRef}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#0d1117] text-slate-100 text-sm p-3 outline-none resize-y font-mono leading-relaxed"
      />
    </div>
  );
};
