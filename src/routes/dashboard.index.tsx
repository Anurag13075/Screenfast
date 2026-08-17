import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  Layers,
  Lock,
  Maximize,
  Minus,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { getAccount, generateDesign, listGenerations, unlockGeneration } from "@/lib/app.functions";
import {
  buildHandoff,
  deleteGeneration,
  exportCode,
  getCanvas,
  refineDesign,
  saveCanvas,
  toggleFavorite,
} from "@/lib/app.functions";
import { PromptConsole, type ConsoleTab } from "@/components/site/PromptConsole";
import { GENERATION_COST, UNLOCK_COST } from "@/lib/plans";

export const Route = createFileRoute("/dashboard/")({
  component: CanvasWorkspace,
});

const CHIPS = [
  { label: "Mobile app screen", mode: "mobile" as const },
  { label: "Landing page", mode: "web" as const },
  { label: "Dashboard UI", mode: "web" as const },
  { label: "Design system", mode: "system" as const },
];

const STYLES = [
  "Modern minimal",
  "Bold neo-brutalist",
  "Soft glassmorphism",
  "Dark premium",
  "Playful pastel",
  "Editorial serif",
];

type Node = {
  id: string;
  x: number;
  y: number;
  w: number;
};

function CanvasWorkspace() {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"mobile" | "web" | "system">("mobile");
  const [style, setStyle] = useState(STYLES[0]!);
  const [reference, setReference] = useState<{ name: string; dataUrl: string } | null>(null);
  const [tab, setTab] = useState<ConsoleTab>("describe");
  const [focused, setFocused] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [view, setView] = useState({ x: 0, y: 0, z: 1 });
  const [nodes, setNodes] = useState<Record<string, Node>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [showLayers, setShowLayers] = useState(true);
  const [variations, setVariations] = useState(1);
  const [refineText, setRefineText] = useState("");
  const [output, setOutput] = useState<{ title: string; body: string } | null>(null);
  const [history, setHistory] = useState<Record<string, Node>[]>([]);
  const [future, setFuture] = useState<Record<string, Node>[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const pan = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const dragNode = useRef<{ id: string; x: number; y: number; nx: number; ny: number } | null>(null);
  const queryClient = useQueryClient();

  const account = useQuery({ queryKey: ["account"], queryFn: () => getAccount() });
  const generations = useQuery({ queryKey: ["generations"], queryFn: () => listGenerations() });

  const generateFn = useServerFn(generateDesign);
  const unlockFn = useServerFn(unlockGeneration);
  const refineFn = useServerFn(refineDesign);
  const codeFn = useServerFn(exportCode);
  const handoffFn = useServerFn(buildHandoff);
  const favoriteFn = useServerFn(toggleFavorite);
  const deleteFn = useServerFn(deleteGeneration);
  const saveCanvasFn = useServerFn(saveCanvas);
  const canvasState = useQuery({ queryKey: ["canvas"], queryFn: () => getCanvas() });

  const items = useMemo(() => generations.data ?? [], [generations.data]);

  useEffect(() => {
    setNodes((current) => {
      const next = { ...current };
      let index = Object.keys(current).length;
      for (const item of items) {
        if (!next[item.id]) {
          const col = index % 3;
          const row = Math.floor(index / 3);
          next[item.id] = { id: item.id, x: 80 + col * 460, y: 80 + row * 400, w: 420 };
          index += 1;
        }
      }
      return next;
    });
  }, [items]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const typing =
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement;
      if (((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") || (event.key === "/" && !typing)) {
        event.preventDefault();
        inputRef.current?.focus();
      }
      if (event.key === "Escape") setSelected(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const generate = useMutation({
    mutationFn: () =>
      generateFn({
        data: {
          prompt,
          mode,
          style,
          variations,
          ...(reference ? { reference: reference.dataUrl } : {}),
        },
      }),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(
          result.error === "not_enough_credits"
            ? "You're out of credits — top up to keep designing."
            : "Generation failed. Your credit was returned.",
        );
        return;
      }
      toast.success(
        result.generations.length > 1
          ? `${result.generations.length} variations placed on your canvas`
          : "Design placed on your canvas",
      );
      setPrompt("");
      setReference(null);
      setSelected(result.generations[0]?.id ?? null);
      queryClient.invalidateQueries({ queryKey: ["generations"] });
      queryClient.invalidateQueries({ queryKey: ["account"] });
    },
    onError: () => toast.error("Generation failed"),
  });

  const refine = useMutation({
    mutationFn: (input: { id: string; instruction: string }) => refineFn({ data: input }),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.error === "not_enough_credits" ? "Out of credits" : "Edit failed");
        return;
      }
      toast.success("Edited frame added to canvas");
      setRefineText("");
      setSelected(result.generation.id);
      queryClient.invalidateQueries({ queryKey: ["generations"] });
      queryClient.invalidateQueries({ queryKey: ["account"] });
    },
  });

  const codeExport = useMutation({
    mutationFn: (input: { id: string; target: "react" | "html" }) => codeFn({ data: input }),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.error === "locked" ? "Unlock the export first" : "Code export failed");
        return;
      }
      setOutput({ title: "Generated code", body: result.code });
      queryClient.invalidateQueries({ queryKey: ["account"] });
    },
  });

  const handoff = useMutation({
    mutationFn: (id: string) => handoffFn({ data: { id } }),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error("Handoff spec failed");
        return;
      }
      setOutput({ title: "Developer handoff spec", body: result.spec });
      queryClient.invalidateQueries({ queryKey: ["account"] });
    },
  });

  const favorite = useMutation({
    mutationFn: (input: { id: string; favorite: boolean }) => favoriteFn({ data: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["generations"] }),
  });

  const removeFrame = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      setSelected(null);
      queryClient.invalidateQueries({ queryKey: ["generations"] });
    },
  });

  // Restore the saved canvas layout once.
  const restored = useRef(false);
  useEffect(() => {
    if (restored.current || !canvasState.data) return;
    const saved = (JSON.parse(canvasState.data || "{}") as { nodes?: Record<string, Node> }).nodes;
    if (saved && Object.keys(saved).length) {
      restored.current = true;
      setNodes((current) => ({ ...current, ...saved }));
    }
  }, [canvasState.data]);

  // Debounced cloud autosave of the layout.
  useEffect(() => {
    if (!Object.keys(nodes).length) return;
    const timer = setTimeout(() => {
      saveCanvasFn({ data: { data: JSON.stringify({ nodes }) } }).catch(() => undefined);
    }, 1200);
    return () => clearTimeout(timer);
  }, [nodes, saveCanvasFn]);

  const pushHistory = useCallback(() => {
    setHistory((h) => [...h.slice(-49), nodes]);
    setFuture([]);
  }, [nodes]);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (!h.length) return h;
      const previous = h[h.length - 1]!;
      setFuture((f) => [nodes, ...f].slice(0, 50));
      setNodes(previous);
      return h.slice(0, -1);
    });
  }, [nodes]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (!f.length) return f;
      setHistory((h) => [...h, nodes]);
      setNodes(f[0]!);
      return f.slice(1);
    });
  }, [nodes]);

  async function exportBoardPdf() {
    const withUrls = items.filter((item) => item.url && item.unlocked);
    if (!withUrls.length) {
      toast.error("Unlock at least one frame to export the board");
      return;
    }
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    for (let index = 0; index < withUrls.length; index += 1) {
      const item = withUrls[index]!;
      const blob = await fetch(item.url!).then((r) => r.blob());
      const dataUrl: string = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.readAsDataURL(blob);
      });
      if (index > 0) doc.addPage();
      doc.addImage(dataUrl, "PNG", 40, 60, 760, 460, undefined, "FAST");
      doc.setFontSize(11);
      doc.text(item.prompt.slice(0, 110), 40, 40);
    }
    doc.save("screenfast-board.pdf");
  }

  const unlock = useMutation({
    mutationFn: (id: string) => unlockFn({ data: { id } }),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error("Not enough credits to unlock the export.");
        return;
      }
      toast.success("Export unlocked");
      queryClient.invalidateQueries({ queryKey: ["generations"] });
      queryClient.invalidateQueries({ queryKey: ["account"] });
    },
  });

  const readFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only images can be attached");
      return;
    }
    if (file.size > 5_000_000) {
      toast.error("Image must be under 5 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setReference({ name: file.name, dataUrl: String(reader.result) });
    reader.readAsDataURL(file);
  }, []);

  const credits = account.data?.credits ?? 0;
  const unlimited = account.data?.unlimited ?? false;
  const canGenerate =
    (prompt.trim().length > 5 || Boolean(reference)) &&
    (unlimited || credits >= GENERATION_COST) &&
    !generate.isPending;

  function onWheel(event: React.WheelEvent) {
    if (!event.ctrlKey && !event.metaKey && Math.abs(event.deltaY) < 2) return;
    const factor = event.deltaY > 0 ? 0.92 : 1.08;
    setView((v) => ({ ...v, z: Math.min(2.2, Math.max(0.25, v.z * factor)) }));
  }

  function onPointerDown(event: React.PointerEvent) {
    if (event.target !== surfaceRef.current) return;
    setSelected(null);
    pan.current = { x: event.clientX, y: event.clientY, vx: view.x, vy: view.y };
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent) {
    if (dragNode.current) {
      const d = dragNode.current;
      const dx = (event.clientX - d.x) / view.z;
      const dy = (event.clientY - d.y) / view.z;
      setNodes((n) => ({ ...n, [d.id]: { ...n[d.id]!, x: d.nx + dx, y: d.ny + dy } }));
      return;
    }
    if (!pan.current) return;
    setView((v) => ({
      ...v,
      x: pan.current!.vx + (event.clientX - pan.current!.x),
      y: pan.current!.vy + (event.clientY - pan.current!.y),
    }));
  }

  function endPointer() {
    pan.current = null;
    dragNode.current = null;
  }

  return (
    <div
      className="relative h-[calc(100vh-3rem)] overflow-hidden rounded-[26px] border border-border bg-[color:var(--color-muted)]"
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) readFile(file);
      }}
    >
      {/* canvas surface */}
      <div
        ref={surfaceRef}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerLeave={endPointer}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in oklab, var(--color-foreground) 12%, transparent) 1px, transparent 1px)",
          backgroundSize: `${24 * view.z}px ${24 * view.z}px`,
          backgroundPosition: `${view.x}px ${view.y}px`,
        }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.z})` }}
        >
          {items.map((item) => {
            const node = nodes[item.id];
            if (!node) return null;
            const active = selected === item.id;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setSelected(item.id);
                  dragNode.current = {
                    id: item.id,
                    x: e.clientX,
                    y: e.clientY,
                    nx: node.x,
                    ny: node.y,
                  };
                  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                }}
                onPointerMove={onPointerMove}
                onPointerUp={endPointer}
                style={{ left: node.x, top: node.y, width: node.w }}
                className={`absolute cursor-move overflow-hidden rounded-[22px] border-2 bg-card shadow-[var(--shadow-soft)] ${
                  active ? "border-primary" : "border-border"
                }`}
              >
                <div className="relative aspect-[4/3] bg-muted">
                  {item.url ? (
                    <img
                      src={item.url}
                      alt={item.prompt}
                      draggable={false}
                      className={`h-full w-full object-cover ${item.unlocked ? "" : "blur-[3px]"}`}
                    />
                  ) : null}
                  {!item.unlocked ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-foreground/10">
                      <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => unlock.mutate(item.id)}
                        className="btn-press inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-extrabold"
                      >
                        <Lock className="h-4 w-4" /> Unlock export ({UNLOCK_COST})
                      </button>
                    </div>
                  ) : null}
                </div>
                <p className="line-clamp-1 px-4 py-3 text-sm font-semibold">{item.prompt}</p>
              </motion.div>
            );
          })}

          {generate.isPending ? (
            <div
              className="absolute left-20 top-20 w-[420px] overflow-hidden rounded-[22px] border-2 border-dashed border-primary/50 bg-card"
              style={{ left: 80, top: 80 - 440 }}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <motion.div
                  className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                  animate={{ x: ["-100%", "220%"] }}
                  transition={{ duration: 1.3, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <p className="px-4 py-3 text-sm font-semibold text-muted-foreground">Designing…</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-4">
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setShowLayers((s) => !s)}
            className="flex items-center gap-2 rounded-full border border-border bg-card/90 px-4 py-2 text-sm font-bold backdrop-blur"
          >
            <Layers className="h-4 w-4" /> Layers
          </button>
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="rounded-full bg-accent px-4 py-2 text-sm font-extrabold text-accent-foreground">
            {unlimited ? "Unlimited" : `${credits} credits`}
          </div>
        </div>
      </div>

      {/* layers panel */}
      <AnimatePresence>
        {showLayers ? (
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute left-4 top-20 w-56 rounded-[22px] border border-border bg-card/95 p-3 backdrop-blur"
          >
            <p className="px-2 pb-2 text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
              Layers
            </p>
            <div className="max-h-[45vh] space-y-1 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-2 text-sm text-muted-foreground">Nothing on canvas yet.</p>
              ) : null}
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item.id)}
                  className={`flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-xs font-bold ${
                    selected === item.id ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                  }`}
                >
                  <span className="line-clamp-1">{item.prompt}</span>
                </button>
              ))}
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      {/* properties panel */}
      <AnimatePresence>
        {selected ? (
          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            className="absolute right-4 top-20 w-64 space-y-3 rounded-[22px] border border-border bg-card/95 p-4 backdrop-blur"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                Properties
              </p>
              <button onClick={() => setSelected(null)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            {(() => {
              const item = items.find((i) => i.id === selected);
              const node = nodes[selected];
              if (!item || !node) return null;
              return (
                <>
                  <p className="line-clamp-3 text-sm font-semibold">{item.prompt}</p>
                  <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {item.mode} · {item.style}
                  </div>
                  <label className="block text-xs font-bold text-muted-foreground">
                    Frame width
                    <input
                      type="range"
                      min={260}
                      max={720}
                      value={node.w}
                      onChange={(e) =>
                        setNodes((n) => ({
                          ...n,
                          [selected]: { ...n[selected]!, w: Number(e.target.value) },
                        }))
                      }
                      className="mt-2 w-full"
                    />
                  </label>
                  <button
                    onClick={() => {
                      setPrompt(`${item.prompt} — `);
                      inputRef.current?.focus();
                    }}
                    className="w-full rounded-full border border-border px-4 py-2 text-sm font-bold"
                  >
                    Re-prompt this frame
                  </button>
                  {item.unlocked && item.url ? (
                    <a
                      href={item.url}
                      download
                      className="btn-press flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold"
                    >
                      <Download className="h-4 w-4" /> Export PNG
                    </a>
                  ) : null}
                  <button
                    onClick={() => {
                      setNodes((n) => {
                        const next = { ...n };
                        delete next[selected];
                        return next;
                      });
                      setSelected(null);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-bold text-muted-foreground"
                  >
                    <Trash2 className="h-4 w-4" /> Remove from canvas
                  </button>
                </>
              );
            })()}
          </motion.aside>
        ) : null}
      </AnimatePresence>

      {/* zoom controls */}
      <div className="absolute bottom-6 right-4 flex flex-col gap-1 rounded-2xl border border-border bg-card/95 p-1.5 backdrop-blur">
        <button onClick={() => setView((v) => ({ ...v, z: Math.min(2.2, v.z * 1.15) }))} className="rounded-xl p-2 hover:bg-muted">
          <Plus className="h-4 w-4" />
        </button>
        <span className="text-center text-[11px] font-extrabold">{Math.round(view.z * 100)}%</span>
        <button onClick={() => setView((v) => ({ ...v, z: Math.max(0.25, v.z * 0.87) }))} className="rounded-xl p-2 hover:bg-muted">
          <Minus className="h-4 w-4" />
        </button>
        <button onClick={() => setView({ x: 0, y: 0, z: 1 })} className="rounded-xl p-2 hover:bg-muted">
          <Maximize className="h-4 w-4" />
        </button>
      </div>

      {/* command bar */}
      <div className="absolute inset-x-0 bottom-6 flex justify-center px-4">
        <motion.div
          animate={{ width: focused ? "min(46rem, 100%)" : "min(38rem, 100%)" }}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
          className="relative"
        >
          <AnimatePresence>
            {focused ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-3 flex flex-wrap justify-center gap-2"
              >
                {CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setMode(chip.mode)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-bold backdrop-blur ${
                      mode === chip.mode
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card/90 text-muted-foreground"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
                {STYLES.slice(0, 3).map((item) => (
                  <button
                    key={item}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setStyle(item)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-bold backdrop-blur ${
                      style === item
                        ? "border-primary bg-accent text-accent-foreground"
                        : "border-border bg-card/90 text-muted-foreground"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}>
            <PromptConsole
              value={prompt}
              onChange={setPrompt}
              onSubmit={() => generate.mutate()}
              tab={tab}
              onTabChange={setTab}
              attachment={reference}
              onAttach={readFile}
              onClearAttachment={() => setReference(null)}
              pending={generate.isPending}
              disabled={!canGenerate}
              placeholder={
                tab === "describe"
                  ? "Describe what you want to design…  (⌘K)"
                  : "Not sure yet? Describe your users and we'll brainstorm the screens."
              }
              className={dragOver ? "ring-2 ring-primary" : ""}
            />
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {dragOver ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[26px] border-4 border-dashed border-primary bg-primary/10"
          >
            <p className="rounded-full bg-card px-6 py-3 font-extrabold">Drop an image to use as reference</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
