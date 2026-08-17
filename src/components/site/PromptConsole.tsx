import { motion } from "framer-motion";
import { Paperclip, Sparkles, X } from "lucide-react";
import { useRef } from "react";

export type ConsoleTab = "describe" | "brainstorm";

type Attachment = { name: string; dataUrl: string };

export function PromptConsole({
  value,
  onChange,
  onSubmit,
  tab,
  onTabChange,
  attachment,
  onAttach,
  onClearAttachment,
  pending = false,
  disabled = false,
  placeholder = "A meditation app for busy parents — soft, calm, iOS style",
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  tab: ConsoleTab;
  onTabChange: (t: ConsoleTab) => void;
  attachment?: Attachment | null;
  onAttach?: (file: File) => void;
  onClearAttachment?: () => void;
  pending?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && onAttach) onAttach(file);
      }}
      className={`console-shell w-full rounded-[26px] p-3 text-left sm:p-4 ${className}`}
    >
      {attachment ? (
        <div className="mb-3 flex items-center gap-2 rounded-2xl bg-white/10 p-2">
          <img src={attachment.dataUrl} alt="" className="h-9 w-9 rounded-lg object-cover" />
          <span className="line-clamp-1 flex-1 text-xs font-bold text-white/80">{attachment.name}</span>
          <button type="button" onClick={onClearAttachment} aria-label="Remove attachment">
            <X className="h-4 w-4 text-white/60" />
          </button>
        </div>
      ) : null}

      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!disabled && !pending) onSubmit();
          }
        }}
        placeholder={placeholder}
        className="w-full resize-none bg-transparent px-2 pb-4 pt-2 text-[17px] font-medium leading-relaxed text-white outline-none placeholder:text-white/45"
      />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex rounded-full bg-white/10 p-1">
            {(["describe", "brainstorm"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onTabChange(t)}
                className="relative rounded-full px-4 py-2 text-sm font-extrabold capitalize transition-colors"
              >
                {tab === t ? (
                  <motion.span
                    layoutId={`console-tab-${className}`}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-white"
                  />
                ) : null}
                <span className={`relative ${tab === t ? "text-ink" : "text-white/60"}`}>{t}</span>
              </button>
            ))}
          </div>

          {onAttach ? (
            <>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                title="Attach a reference image"
                aria-label="Attach a reference image"
                className="rounded-full bg-white/10 p-2.5 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
              >
                <Paperclip className="h-[18px] w-[18px]" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onAttach(file);
                  e.target.value = "";
                }}
              />
            </>
          ) : null}
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          disabled={disabled || pending}
          onClick={onSubmit}
          className="btn-press inline-flex items-center gap-2 rounded-full px-6 py-3 text-[15px] font-extrabold disabled:opacity-50"
        >
          {pending ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="block h-4 w-4 rounded-full border-2 border-current border-t-transparent"
            />
          ) : (
            <Sparkles className="h-[18px] w-[18px]" />
          )}
          Generate
        </motion.button>
      </div>
    </motion.div>
  );
}