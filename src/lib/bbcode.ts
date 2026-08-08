// Parses basic BBCode formatted strings into HTML or plain text safely
export function parseBBCode(text: string): string {
  if (!text) return "";

  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold, Italic, Underline
  html = html.replace(/\[B\]([\s\S]*?)\[\/B\]/gi, "<strong>$1</strong>");
  html = html.replace(/\[I\]([\s\S]*?)\[\/I\]/gi, "<em>$1</em>");
  html = html.replace(/\[U\]([\s\S]*?)\[\/U\]/gi, "<u>$1</u>");

  // Alignment
  html = html.replace(/\[CENTER\]([\s\S]*?)\[\/CENTER\]/gi, '<div class="text-center my-2">$1</div>');
  html = html.replace(/\[RIGHT\]([\s\S]*?)\[\/RIGHT\]/gi, '<div class="text-right my-2">$1</div>');
  html = html.replace(/\[LEFT\]([\s\S]*?)\[\/LEFT\]/gi, '<div class="text-left my-2">$1</div>');

  // Colors
  html = html.replace(/\[COLOR=(rgb\([^)]+\)|#[a-f0-9]{3,6}|\w+)\]([\s\S]*?)\[\/COLOR\]/gi, '<span style="color: $1;">$2</span>');

  // Font Size
  html = html.replace(/\[SIZE=([1-7])\]([\s\S]*?)\[\/SIZE\]/gi, (_match, size, content) => {
    const sizeMap: Record<string, string> = {
      "1": "0.75rem",
      "2": "0.875rem",
      "3": "1rem",
      "4": "1.125rem",
      "5": "1.25rem",
      "6": "1.5rem",
      "7": "1.875rem",
    };
    const fontSize = sizeMap[size] || "1rem";
    return `<span style="font-size: ${fontSize}">${content}</span>`;
  });

  // Quotes
  html = html.replace(/\[QUOTE\]([\s\S]*?)\[\/QUOTE\]/gi, '<blockquote class="border-l-4 border-purple-500 bg-slate-900/80 p-3 my-2 text-slate-300 rounded-r text-sm font-sans">$1</blockquote>');

  // Images
  html = html.replace(/\[IMG\](.*?)\[\/IMG\]/gi, '<img src="$1" alt="Image" class="max-w-full h-auto my-2 rounded border border-slate-700 inline-block max-h-96" />');

  // Links
  html = html.replace(/\[URL=(.*?)\]([\s\S]*?)\[\/URL\]/gi, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-purple-400 hover:underline">$2</a>');
  html = html.replace(/\[URL\](.*?)\[\/URL\]/gi, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-purple-400 hover:underline">$1</a>');

  // Convert newlines to <br> if not inside div/blockquote
  html = html.replace(/\n/g, "<br />");

  return html;
}
