import { cn } from "@/lib/utils";

export function AdSlot({ className, format = "horizontal" }: { className?: string, format?: "horizontal" | "vertical" | "square" }) {
  return (
    <div 
      className={cn(
        "relative flex flex-col items-center justify-center border border-border bg-muted/20 my-10 overflow-hidden",
        format === "horizontal" && "w-full min-h-[120px] max-h-[250px]",
        format === "vertical" && "w-[300px] h-[600px]",
        format === "square" && "w-[300px] h-[250px]",
        className
      )}
    >
      <span className="absolute top-2 right-3 text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
        Advertisement
      </span>
      {/* 
        This is where AdSense will inject the actual iframe. 
        Until then, it remains a beautiful, minimal structural element. 
      */}
      <div className="flex flex-col items-center gap-2 opacity-40">
        <div className="w-12 h-12 rounded-sm border border-border bg-muted flex items-center justify-center">
          <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <span className="text-xs font-mono text-muted-foreground">Ad Space Reserved</span>
      </div>
    </div>
  );
}
