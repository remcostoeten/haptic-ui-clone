"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X, Inbox, Calendar, Send } from "lucide-react";
import { useJournalStore, formatDateKey } from "@/modules/journal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

interface QuickCaptureProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type CaptureTarget = "inbox" | "today";

export function QuickCapture({ open, onOpenChange }: QuickCaptureProps) {
  const { addToInbox, getOrCreateDailyNote, updateDailyNote } = useJournalStore();
  const [content, setContent] = useState("");
  const [target, setTarget] = useState<CaptureTarget>("today");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when modal opens
  useEffect(() => {
    if (open && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }, [open]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setContent("");
    }
  }, [open]);

  const handleSubmit = () => {
    if (!content.trim()) return;

    if (target === "inbox") {
      addToInbox(content.trim());
    } else {
      // Add to today's daily note
      const today = formatDateKey(new Date());
      const note = getOrCreateDailyNote(today);
      const timestamp = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
      const newContent = `${note.content}\n\n*${timestamp}*\n${content.trim()}`;
      updateDailyNote(today, { content: newContent });
    }

    setContent("");
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl + Enter to submit
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Quick Capture</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Target selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setTarget("today")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors",
                target === "today"
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:bg-accent"
              )}
            >
              <Calendar className="w-4 h-4" />
              <span>Today</span>
            </button>
            <button
              onClick={() => setTarget("inbox")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors",
                target === "inbox"
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:bg-accent"
              )}
            >
              <Inbox className="w-4 h-4" />
              <span>Inbox</span>
            </button>
          </div>

          {/* Content input */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                target === "inbox"
                  ? "Capture a thought to process later..."
                  : "Add to today's journal..."
              }
              className="w-full min-h-[120px] px-3 py-2 bg-transparent border border-border rounded-md outline-none resize-none text-sm placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Press <kbd className="px-1.5 py-0.5 rounded bg-accent text-[10px] font-mono">Cmd+Enter</kbd> to save
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => onOpenChange(false)}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!content.trim()}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  content.trim()
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                <Send className="w-3.5 h-3.5" />
                Save
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Global keyboard shortcut hook for quick capture
export function useQuickCaptureShortcut(onOpen: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Shift + N for quick capture
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "n") {
        e.preventDefault();
        onOpen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpen]);
}
