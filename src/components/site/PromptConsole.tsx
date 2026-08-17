import { motion } from "framer-motion";
import { Mic, Paperclip, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type ConsoleTab = "describe" | "brainstorm";

type Attachment = { name: string; dataUrl: string };

// Minimal shape for the Web Speech API — not in default TS lib DOM types.
type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: any) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

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
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const baseValueRef = useRef("");

  useEffect(() => {
    setVoiceSupported(Boolean(getSpeechRecognition()));
  }, []);

  function toggleVoice() {
    const SpeechRecognitionCtor = getSpeechRecognition();
    if (!SpeechRecognitionCtor) return;

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    baseValueRef.current = value ? `${value} ` : "";

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
      }
      onChange(`${baseValueRef.current}${transcript}`);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

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

      <div className="relative">
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
          placeholder={listening ? "Listening..." : placeholder}
          className="w-full resize-none bg-transparent px-2 pb-4 pt-2 text-[17px] font-medium leading-relaxed text-white outline-none placeholder:text-white/45"
        />
        {listening ? (
          <span className="pointer-events-none absolute right-2 top-2 flex items-center gap-1.5 rounded-full bg-red-500/20 px-2.5 py-1 text-xs font-bold text-red-300">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="h-1.5 w-1.5 rounded-full bg-red-400"
            />
            Listening
          </span>
        ) : null}
      </div>

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

          {voiceSupported ? (
            <button
              type="button"
              onClick={toggleVoice}
              title={listening ? "Stop voice input" : "Describe your idea by voice"}
              aria-label={listening ? "Stop voice input" : "Describe your idea by voice"}
              className={`rounded-full p-2.5 transition-colors ${
                listening
                  ? "bg-red-500/25 text-red-300 hover:bg-red-500/35"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`}
            >
              <Mic className="h-[18px] w-[18px]" />
            </button>
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
