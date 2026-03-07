"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Calendar, Flame, BookOpen } from "lucide-react";
import { useJournalStore, formatDateKey, parseDateKey } from "@/modules/journal";
import { MOOD_OPTIONS } from "@/types/notes";

interface CalendarSidebarProps {
  onDateSelect?: (date: string) => void;
}

export function CalendarSidebar({ onDateSelect }: CalendarSidebarProps) {
  const {
    selectedDate,
    setSelectedDate,
    goToToday,
    dailyNotes,
    getStreakData,
    config,
  } = useJournalStore();

  const [viewMonth, setViewMonth] = useState(() => {
    const d = parseDateKey(selectedDate);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const streakData = getStreakData();
  const today = formatDateKey(new Date());

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewMonth.year, viewMonth.month, 1);
    const lastDay = new Date(viewMonth.year, viewMonth.month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    // Adjust for week start (0 = Sunday, 1 = Monday)
    const adjustedStartDay = config.weekStartsOn === 1
      ? (startDay === 0 ? 6 : startDay - 1)
      : startDay;

    const days: (number | null)[] = [];

    // Leading empty days
    for (let i = 0; i < adjustedStartDay; i++) {
      days.push(null);
    }

    // Days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }, [viewMonth, config.weekStartsOn]);

  const weekDays = config.weekStartsOn === 1
    ? ["M", "T", "W", "T", "F", "S", "S"]
    : ["S", "M", "T", "W", "T", "F", "S"];

  const monthName = new Date(viewMonth.year, viewMonth.month).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const handlePrevMonth = () => {
    setViewMonth((prev) => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { ...prev, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setViewMonth((prev) => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { ...prev, month: prev.month + 1 };
    });
  };

  const handleDayClick = (day: number) => {
    const dateKey = `${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateKey);
    onDateSelect?.(dateKey);
  };

  const getDayInfo = (day: number) => {
    const dateKey = `${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const note = dailyNotes[dateKey];
    const isToday = dateKey === today;
    const isSelected = dateKey === selectedDate;
    const hasEntry = !!note;
    const mood = note?.mood;

    return { dateKey, isToday, isSelected, hasEntry, mood };
  };

  return (
    <div className="w-56 flex flex-col bg-background border-r border-border">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium">Journal</h2>
          <button
            onClick={goToToday}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Today
          </button>
        </div>

        {/* Streak info */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1" title="Current streak">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>{streakData.currentStreak}</span>
          </div>
          <div className="flex items-center gap-1" title="Total entries">
            <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{streakData.totalEntries}</span>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="p-2">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded hover:bg-accent transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium">{monthName}</span>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded hover:bg-accent transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {weekDays.map((day, i) => (
            <div
              key={i}
              className="h-6 flex items-center justify-center text-[10px] text-muted-foreground font-medium"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {calendarDays.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} className="h-7" />;
            }

            const { isToday, isSelected, hasEntry, mood } = getDayInfo(day);

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "h-7 w-full flex items-center justify-center text-xs rounded transition-all relative",
                  isSelected && "bg-foreground text-background font-medium",
                  !isSelected && isToday && "ring-1 ring-foreground/50",
                  !isSelected && hasEntry && "font-medium",
                  !isSelected && !hasEntry && "text-muted-foreground hover:bg-accent",
                  !isSelected && hasEntry && !mood && "bg-accent/50",
                )}
              >
                {day}
                {/* Mood indicator dot */}
                {hasEntry && mood && !isSelected && (
                  <span
                    className={cn(
                      "absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
                      mood === "great" && "bg-emerald-400",
                      mood === "good" && "bg-green-400",
                      mood === "neutral" && "bg-muted-foreground",
                      mood === "low" && "bg-amber-400",
                      mood === "rough" && "bg-red-400",
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent entries */}
      <div className="flex-1 overflow-y-auto border-t border-border">
        <div className="px-3 py-2">
          <h3 className="text-xs font-medium text-muted-foreground mb-2">Recent</h3>
          <div className="space-y-1">
            {Object.values(dailyNotes)
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 7)
              .map((note) => {
                const d = parseDateKey(note.date);
                const isSelected = note.date === selectedDate;
                const isToday = note.date === today;

                return (
                  <button
                    key={note.id}
                    onClick={() => {
                      setSelectedDate(note.date);
                      onDateSelect?.(note.date);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors",
                      isSelected ? "bg-accent" : "hover:bg-accent/50",
                    )}
                  >
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs truncate">
                        {isToday
                          ? "Today"
                          : d.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                      </div>
                    </div>
                    {note.mood && (
                      <span className={cn("text-[10px]", MOOD_OPTIONS[note.mood].color)}>
                        {MOOD_OPTIONS[note.mood].icon}
                      </span>
                    )}
                  </button>
                );
              })}
            {Object.keys(dailyNotes).length === 0 && (
              <p className="text-xs text-muted-foreground py-2 text-center">
                No journal entries yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
