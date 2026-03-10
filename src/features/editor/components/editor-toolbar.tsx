import { ChevronLeft, ChevronRight, FileText, PanelRight, Sidebar } from "lucide-react";
import { cn } from "@/shared/lib/utils";

type Props = {
  fileName: string;
  breadcrumb?: string[];
  isMobile?: boolean;
  onToggleSidebar: () => void;
  onToggleMetadata: () => void;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  canNavigatePrev?: boolean;
  canNavigateNext?: boolean;
};

export function EditorToolbar({
  fileName,
  breadcrumb,
  isMobile = false,
  onToggleSidebar,
  onToggleMetadata,
  onNavigatePrev,
  onNavigateNext,
  canNavigatePrev = false,
  canNavigateNext = false,
}: Props) {
  if (isMobile) {
    return (
      <div className="border-b border-white/5 bg-background/85 px-4 pb-3 pt-[max(env(safe-area-inset-top),0.85rem)] backdrop-blur-2xl">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-1 rounded-[1.35rem] border border-white/10 bg-black/20 p-1 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
            <button
              onClick={onToggleSidebar}
              className="flex h-10 w-10 items-center justify-center rounded-2xl text-white/50 transition-colors hover:bg-white/10 hover:text-white/90 active:scale-[0.97]"
              title="Open notes"
            >
              <Sidebar className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </button>
            <div className="flex items-center gap-0.5 px-0.5">
              <button
                onClick={onNavigatePrev}
                disabled={!canNavigatePrev}
                className={cn(
                  "flex h-10 w-9 items-center justify-center rounded-[0.9rem] transition-colors active:scale-[0.97]",
                  canNavigatePrev
                    ? "text-white/50 hover:bg-white/10 hover:text-white/90"
                    : "cursor-not-allowed text-white/20",
                )}
                title="Previous file"
              >
                <ChevronLeft className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </button>
              <button
                onClick={onNavigateNext}
                disabled={!canNavigateNext}
                className={cn(
                  "flex h-10 w-9 items-center justify-center rounded-[0.9rem] transition-colors active:scale-[0.97]",
                  canNavigateNext
                    ? "text-white/50 hover:bg-white/10 hover:text-white/90"
                    : "cursor-not-allowed text-white/20",
                )}
                title="Next file"
              >
                <ChevronRight className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <div className="min-w-0 flex-1 rounded-[1.4rem] border border-white/10 bg-black/20 px-4 py-2.5 shadow-[inset_0_1px_rgba(255,255,255,0.03)] backdrop-blur-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.24em] text-white/40">
                <span>Current Note</span>
              </div>
            </div>
            <div className="mt-1 truncate text-sm font-semibold tracking-[-0.01em] text-white/90">
              {fileName}
            </div>
            {breadcrumb && breadcrumb.length > 0 && (
              <div className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] text-white/40">
                {breadcrumb.map((part, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <span>{part}</span>
                    {i < breadcrumb.length - 1 && <ChevronRight className="h-3 w-3 opacity-50" />}
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onToggleMetadata}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.35rem] border border-white/10 bg-black/20 text-white/50 shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition-colors hover:bg-white/10 hover:text-white/90 active:scale-[0.97]"
            title="Open note details"
          >
            <PanelRight className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border-b border-border/40 bg-card/60 backdrop-blur-2xl relative",
        "flex h-14 items-center justify-between px-4 z-10 shadow-[0_2px_20px_rgba(0,0,0,0.02)]",
      )}
    >
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
      {/* Left controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className={cn(
            "flex items-center justify-center rounded-xl text-muted-foreground/60 transition-all duration-200",
            "h-8 w-8 hover:bg-black/5 hover:text-foreground/80 dark:hover:bg-white/10 dark:text-white/50 dark:hover:text-white",
          )}
          title="Toggle sidebar"
        >
          <Sidebar className="w-4 h-4" strokeWidth={1.5} />
        </button>
        <div className="h-4 w-px bg-border/40 mx-1" />
        <div className="flex items-center gap-0.5">
          <button
            onClick={onNavigatePrev}
            disabled={!canNavigatePrev}
            className={cn(
              "flex items-center justify-center rounded-lg transition-all duration-200",
              "h-8 w-8",
              canNavigatePrev
                ? "text-muted-foreground/60 hover:bg-black/5 hover:text-foreground/80 dark:hover:bg-white/10 dark:text-white/50 dark:hover:text-white"
                : "text-muted-foreground/20 cursor-not-allowed dark:text-white/10",
            )}
            title="Previous file"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button
            onClick={onNavigateNext}
            disabled={!canNavigateNext}
            className={cn(
              "flex items-center justify-center rounded-lg transition-all duration-200",
              "h-8 w-8",
              canNavigateNext
                ? "text-muted-foreground/60 hover:bg-black/5 hover:text-foreground/80 dark:hover:bg-white/10 dark:text-white/50 dark:hover:text-white"
                : "text-muted-foreground/20 cursor-not-allowed dark:text-white/10",
            )}
            title="Next file"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Center - filename */}
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center gap-2">
          {breadcrumb && breadcrumb.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground/50">
              {breadcrumb.map((part, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <span>{part}</span>
                  {i < breadcrumb.length - 1 && <ChevronRight className="w-3 h-3 opacity-40" />}
                </span>
              ))}
            </div>
          )}
        </div>
        <span
          className={cn(
            "mt-0.5 text-[13px] font-medium tracking-tight text-foreground/90",
            "max-w-[28rem] truncate",
            breadcrumb && breadcrumb.length > 0 ? "text-[14px]" : "text-[15px]" 
          )}
        >
          {fileName}
        </span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleMetadata}
          className={cn(
            "flex items-center justify-center rounded-xl text-muted-foreground/60 transition-all duration-200",
            "h-8 w-8 hover:bg-black/5 hover:text-foreground/80 dark:hover:bg-white/10 dark:text-white/50 dark:hover:text-white",
          )}
          title="Toggle metadata"
        >
          <PanelRight className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
