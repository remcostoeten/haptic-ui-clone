"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Command, Search } from "lucide-react";
import { triggerNativeFeedback } from "@/shared/lib/native-feedback";
import { Kbd } from "@/shared/ui/kbd";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

export type CommandPaletteItem = {
  id: string;
  label: string;
  shortcut?: string;
  keywords?: string[];
  description?: string;
  action: () => void;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  items: CommandPaletteItem[];
};

export function CommandPalette({
  open,
  onOpenChange,
  title = "Command Palette",
  description = "Run actions without leaving the keyboard.",
  items,
}: Props) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return items;

    return items.filter((item) => {
      const haystack = [item.label, item.description, item.shortcut, ...(item.keywords ?? [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [items, query]);

  const runItem = (item: CommandPaletteItem) => {
    triggerNativeFeedback("selection");
    onOpenChange(false);
    item.action();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-hidden rounded-[1.5rem] border border-border/70 bg-background/80 p-0 shadow-2xl backdrop-blur-2xl sm:max-w-2xl">
        {/* Subtle top glare */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="flex items-center gap-2.5 text-base font-semibold">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/80 bg-accent/50 shadow-sm">
              <Command className="h-4 w-4 text-foreground/80" strokeWidth={1.8} />
            </div>
            {title}
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted-foreground/80">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="px-3 pb-3">
          <div className="relative flex items-center rounded-2xl border border-border/60 bg-accent/30 shadow-inner">
            <Search className="absolute left-4 h-[18px] w-[18px] text-muted-foreground/60" strokeWidth={2} />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && filteredItems[0]) {
                  event.preventDefault();
                  runItem(filteredItems[0]);
                }
              }}
              placeholder="Search commands..."
              className="w-full bg-transparent py-3.5 pl-11 pr-4 text-sm font-medium placeholder:text-muted-foreground/50 focus:outline-none"
            />
          </div>
        </div>

        <div className="max-h-[45vh] overflow-y-auto px-2 pb-2">
          {filteredItems.length > 0 ? (
            <div className="space-y-0.5">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => runItem(item)}
                  className="group flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-accent/60 focus:bg-accent/80 focus:outline-none"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-transparent bg-transparent transition-colors group-hover:border-border/60 group-hover:bg-background/80">
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60 transition-colors group-hover:text-foreground" strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-medium text-foreground/90 transition-colors group-hover:text-foreground">
                        {item.label}
                      </div>
                      {item.description ? (
                        <div className="mt-0.5 truncate text-[11px] text-muted-foreground/70">
                          {item.description}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  {item.shortcut ? (
                    <div className="ml-3 shrink-0">
                      <Kbd combo={item.shortcut} className="bg-transparent shadow-none border-border/40 group-hover:bg-background/50 group-hover:border-border/80" />
                    </div>
                  ) : null}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-border/50 bg-accent/30 shadow-sm">
                <Search className="h-5 w-5 text-muted-foreground/50" strokeWidth={2} />
              </div>
              <p className="text-[13px] font-medium text-foreground/80">No results found</p>
              <p className="mt-1 text-[12px] text-muted-foreground/70">
                No commands match "{query}"
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
