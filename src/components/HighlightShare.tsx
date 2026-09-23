import { useEffect, useState } from "react";
import { Twitter } from "lucide-react";

export function HighlightShare() {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [text, setText] = useState("");

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setPosition(null);
        return;
      }

      const selectedText = selection.toString().trim();
      if (selectedText.length < 10) {
        setPosition(null);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // Check if we are inside the article prose
      let node = range.startContainer as HTMLElement;
      if (node.nodeType === 3) node = node.parentNode as HTMLElement; // if text node
      if (!node.closest('.prose-custom')) {
        setPosition(null);
        return;
      }

      setText(selectedText);
      setPosition({
        top: rect.top + window.scrollY - 40,
        left: rect.left + window.scrollX + rect.width / 2,
      });
    };

    document.addEventListener("selectionchange", handleSelection);
    return () => document.removeEventListener("selectionchange", handleSelection);
  }, []);

  if (!position) return null;

  const handleShare = () => {
    const url = window.location.href;
    const tweetUrl = `https://twitter.com/intent/tweet?text="${encodeURIComponent(text)}"&url=${encodeURIComponent(url)}`;
    window.open(tweetUrl, "_blank", "width=550,height=420");
    setPosition(null);
    window.getSelection()?.removeAllRanges();
  };

  return (
    <div 
      className="absolute z-50 animate-in fade-in zoom-in-95 duration-200"
      style={{ 
        top: position.top, 
        left: position.left,
        transform: "translateX(-50%)" 
      }}
    >
      <button 
        onClick={handleShare}
        className="flex items-center gap-2 bg-foreground text-background px-3 py-1.5 rounded-sm shadow-xl hover:opacity-90 transition-opacity text-xs font-medium"
      >
        <Twitter className="h-3 w-3" />
        Share Quote
      </button>
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-foreground" />
    </div>
  );
}
