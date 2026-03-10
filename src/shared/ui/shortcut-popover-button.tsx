"use client";

import * as React from "react";
import { Command, Keyboard } from "lucide-react";
import { Button, type ButtonProps } from "@/shared/ui/button-component";
import { Kbd } from "@/shared/ui/kbd";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";

export type ShortcutPopoverGroup = {
  id: string;
  title: string;
  shortcuts: Array<{
    id: string;
    label: string;
    combo: string;
    description?: string;
  }>;
};

type ShortcutButtonProps = Omit<ButtonProps, "children"> & {
  combo: string;
  label?: string;
};

export function ShortcutButton({
  combo,
  label = "Shortcuts",
  variant = "outline",
  size = "sm",
  className,
  ...props
}: ShortcutButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn("gap-2 rounded-xl border-border/70 bg-card/70 backdrop-blur-sm", className)}
      {...props}
    >
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Kbd combo={combo} className="bg-background/85" />
    </Button>
  );
}

type ShortcutPopoverButtonProps = {
  groups: ShortcutPopoverGroup[];
  combo?: string;
  label?: string;
  iconOnly?: boolean;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  className?: string;
};

export function ShortcutPopoverButton({
  groups,
  combo = "shift+/",
  label = "Shortcuts",
  iconOnly = false,
  side = "bottom",
  align = "end",
  className,
}: ShortcutPopoverButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {iconOnly ? (
          <Button
            variant="ghost"
            size="icon"
            className={cn("rounded-xl text-muted-foreground hover:text-foreground", className)}
            aria-label={label}
            title={label}
          >
            <Keyboard className="h-4 w-4" strokeWidth={1.6} />
          </Button>
        ) : (
          <ShortcutButton combo={combo} label={label} className={className} />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={side}
        align={align}
        className="w-[min(26rem,calc(100vw-1.5rem))] rounded-2xl border-border/70 bg-popover/96 p-0 shadow-2xl backdrop-blur-xl"
      >
        <div className="border-b border-border/60 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Command className="h-4 w-4 text-muted-foreground" strokeWidth={1.6} />
            <span>{label}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Route-aware shortcuts available from this view.
          </p>
        </div>

        <div className="max-h-[22rem] overflow-y-auto p-2">
          {groups.map((group, groupIndex) => (
            <div key={group.id}>
              {groupIndex > 0 ? <DropdownMenuSeparator /> : null}
              <DropdownMenuLabel className="px-2 pb-2 pt-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground/80">
                {group.title}
              </DropdownMenuLabel>
              <div className="space-y-1 pb-1">
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.id}
                    className="flex items-start justify-between gap-3 rounded-xl px-2 py-2"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground">{shortcut.label}</div>
                      {shortcut.description ? (
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {shortcut.description}
                        </div>
                      ) : null}
                    </div>
                    <Kbd combo={shortcut.combo} className="shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
