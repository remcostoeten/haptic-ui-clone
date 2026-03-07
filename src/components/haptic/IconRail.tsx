import { FolderOpen, Sun, Moon, Settings, BookOpen, Inbox, CalendarDays, BarChart3, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useJournalStore } from "@/modules/journal";

interface IconRailProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenSettings: () => void;
  onQuickCapture?: () => void;
}

export function IconRail({ activeTab, onTabChange, onOpenSettings, onQuickCapture }: IconRailProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { getUnprocessedInbox } = useJournalStore();
  const inboxCount = getUnprocessedInbox().length;

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="w-12 flex flex-col items-center py-3 gap-1 bg-card border-r border-border">
      {/* Notes/Folders tab */}
      <button
        onClick={() => onTabChange("notes")}
        className={cn(
          "w-9 h-9 flex items-center justify-center rounded-md transition-colors",
          activeTab === "notes"
            ? "bg-accent text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-accent",
        )}
        title="Notes"
      >
        <FolderOpen className="w-[18px] h-[18px]" strokeWidth={1.5} />
      </button>

      {/* Journal tab */}
      <button
        onClick={() => onTabChange("journal")}
        className={cn(
          "w-9 h-9 flex items-center justify-center rounded-md transition-colors",
          activeTab === "journal"
            ? "bg-accent text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-accent",
        )}
        title="Journal"
      >
        <BookOpen className="w-[18px] h-[18px]" strokeWidth={1.5} />
      </button>

      {/* Inbox tab */}
      <button
        onClick={() => onTabChange("inbox")}
        className={cn(
          "w-9 h-9 flex items-center justify-center rounded-md transition-colors relative",
          activeTab === "inbox"
            ? "bg-accent text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-accent",
        )}
        title="Inbox"
      >
        <Inbox className="w-[18px] h-[18px]" strokeWidth={1.5} />
        {inboxCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-foreground" />
        )}
      </button>

      {/* Weekly Review tab */}
      <button
        onClick={() => onTabChange("weekly")}
        className={cn(
          "w-9 h-9 flex items-center justify-center rounded-md transition-colors",
          activeTab === "weekly"
            ? "bg-accent text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-accent",
        )}
        title="Weekly Review"
      >
        <CalendarDays className="w-[18px] h-[18px]" strokeWidth={1.5} />
      </button>

      {/* Monthly Review tab */}
      <button
        onClick={() => onTabChange("monthly")}
        className={cn(
          "w-9 h-9 flex items-center justify-center rounded-md transition-colors",
          activeTab === "monthly"
            ? "bg-accent text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-accent",
        )}
        title="Monthly Review"
      >
        <BarChart3 className="w-[18px] h-[18px]" strokeWidth={1.5} />
      </button>

      {/* Bottom icons - Quick Capture, Settings and Theme toggle */}
      <div className="mt-auto flex flex-col gap-1">
        {/* Quick capture */}
        <button
          onClick={onQuickCapture}
          className="w-9 h-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Quick Capture (Cmd+Shift+N)"
        >
          <Zap className="w-[18px] h-[18px]" strokeWidth={1.5} />
        </button>
        <button
          onClick={onOpenSettings}
          className="w-9 h-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Settings"
        >
          <Settings className="w-[18px] h-[18px]" strokeWidth={1.5} />
        </button>
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Toggle theme"
        >
          {mounted ? (
            theme === "dark" ? (
              <Sun className="w-[18px] h-[18px]" strokeWidth={1.5} />
            ) : (
              <Moon className="w-[18px] h-[18px]" strokeWidth={1.5} />
            )
          ) : (
            <Sun className="w-[18px] h-[18px]" strokeWidth={1.5} />
          )}
        </button>
      </div>
    </div>
  );
}
