"use client";

import { X } from "lucide-react";
import type { ShortcutScope } from "@/shared/lib/shortcuts";
import {
  SHORTCUTS,
  SHORTCUT_DESCRIPTIONS,
  SHORTCUT_SCOPE_LABELS,
  SHORTCUT_SCOPES_MAP,
} from "@/shared/lib/shortcuts";
import { Kbd } from "@/shared/ui/kbd";

type ShortcutsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  activeScopes?: ShortcutScope[];
};

export function ShortcutsDialog({ isOpen, onClose, activeScopes = [] }: ShortcutsDialogProps) {
  // Filter shortcuts by active scopes
  const filteredShortcuts = Object.entries(SHORTCUTS).filter(([key]) => {
    if (activeScopes.length === 0) return true;
    
    const scopes = SHORTCUT_SCOPES_MAP[key as keyof typeof SHORTCUTS];
    return scopes.some(scope => activeScopes.includes(scope));
  });

  // Group shortcuts by scope
  const shortcutsByScope = filteredShortcuts.reduce((groups, [key, combo]) => {
    const scopes = SHORTCUT_SCOPES_MAP[key as keyof typeof SHORTCUTS];
    
    // Find the most relevant scope for display
    let displayScope: ShortcutScope = "global";
    if (activeScopes.length > 0) {
      // Use the first matching scope from activeScopes
      displayScope = scopes.find(scope => activeScopes.includes(scope)) || "global";
    } else {
      // Use the first scope if no active scopes specified
      displayScope = scopes[0] || "global";
    }

    if (!groups[displayScope]) {
      groups[displayScope] = [];
    }
    
    groups[displayScope].push({
      key: key as keyof typeof SHORTCUTS,
      combo,
      description: SHORTCUT_DESCRIPTIONS[key as keyof typeof SHORTCUTS],
    });
    
    return groups;
  }, {} as Record<ShortcutScope, Array<{ key: keyof typeof SHORTCUTS; combo: string; description: string }>>);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden bg-background border rounded-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            {Object.entries(shortcutsByScope)
              .sort(([a], [b]) => {
                // Sort scopes: GLOBAL first, then alphabetically
                if (a === "global") return -1;
                if (b === "global") return 1;
                return a.localeCompare(b);
              })
              .map(([scope, shortcuts]) => (
                <div key={scope}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    {SHORTCUT_SCOPE_LABELS[scope as ShortcutScope]}
                  </h3>
                  <div className="grid gap-2">
                    {shortcuts
                      .sort((a, b) => a.description.localeCompare(b.description))
                      .map(({ key, combo, description }) => (
                        <div
                          key={key}
                          className="flex items-center justify-between py-2 px-3 rounded-md bg-accent/20"
                        >
                          <span className="text-sm text-foreground">{description}</span>
                          <Kbd combo={combo} />
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
          
          {activeScopes.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-xs text-muted-foreground">
                Showing shortcuts for: {activeScopes.map(scope => SHORTCUT_SCOPE_LABELS[scope]).join(", ")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
