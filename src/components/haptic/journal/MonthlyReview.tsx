"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Flame, Calendar, Tag, BarChart3 } from "lucide-react";
import { useJournalStore, parseDateKey, formatDateKey, getMonthBounds } from "@/modules/journal";
import { MOOD_OPTIONS, MoodLevel } from "@/types/notes";

export function MonthlyReview() {
  const {
    selectedDate,
    getMonthlyReview,
    setSelectedDate,
    dailyNotes,
    config,
  } = useJournalStore();

  const [viewMonth, setViewMonth] = useState(() => {
    const d = parseDateKey(selectedDate);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const review = useMemo(() => {
    const date = new Date(viewMonth.year, viewMonth.month, 15);
    return getMonthlyReview(date);
  }, [viewMonth, getMonthlyReview]);

  const today = formatDateKey(new Date());
  const monthName = new Date(viewMonth.year, viewMonth.month).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Calculate days in month for calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewMonth.year, viewMonth.month, 1);
    const lastDay = new Date(viewMonth.year, viewMonth.month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const adjustedStartDay = config.weekStartsOn === 1
      ? (startDay === 0 ? 6 : startDay - 1)
      : startDay;

    const days: (number | null)[] = [];
    for (let i = 0; i < adjustedStartDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [viewMonth, config.weekStartsOn]);

  const weekDays = config.weekStartsOn === 1
    ? ["M", "T", "W", "T", "F", "S", "S"]
    : ["S", "M", "T", "W", "T", "F", "S"];

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

  const getDayInfo = (day: number) => {
    const dateKey = `${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const note = dailyNotes[dateKey];
    return { dateKey, note };
  };

  // Calculate mood distribution percentages
  const moodTotal = Object.values(review.moodDistribution).reduce((a, b) => a + b, 0);
  const moodPercentages = useMemo(() => {
    if (moodTotal === 0) return {};
    return Object.fromEntries(
      Object.entries(review.moodDistribution).map(([mood, count]) => [
        mood,
        Math.round((count / moodTotal) * 100),
      ])
    ) as Record<MoodLevel, number>;
  }, [review.moodDistribution, moodTotal]);

  // Get days in month for completion rate
  const { start: monthStart, end: monthEnd } = getMonthBounds(new Date(viewMonth.year, viewMonth.month, 15));
  const daysInMonth = monthEnd.getDate();
  const todayInViewMonth = viewMonth.year === new Date().getFullYear() && viewMonth.month === new Date().getMonth();
  const daysElapsed = todayInViewMonth ? new Date().getDate() : daysInMonth;
  const completionRate = Math.round((review.totalEntries / daysElapsed) * 100);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-[52px] flex items-center justify-between px-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-md hover:bg-accent transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-md hover:bg-accent transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <span className="font-medium">{monthName}</span>

        <button
          onClick={() => {
            const now = new Date();
            setViewMonth({ year: now.getFullYear(), month: now.getMonth() });
          }}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          This month
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-8">
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-xs">Entries</span>
              </div>
              <div className="text-2xl font-semibold">{review.totalEntries}</div>
              <div className="text-xs text-muted-foreground">{completionRate}% completion</div>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-xs">Best Streak</span>
              </div>
              <div className="text-2xl font-semibold">{review.streakData.longestStreak}</div>
              <div className="text-xs text-muted-foreground">days in a row</div>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs">Moods Logged</span>
              </div>
              <div className="text-2xl font-semibold">{moodTotal}</div>
              <div className="text-xs text-muted-foreground">of {review.totalEntries} entries</div>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Tag className="w-4 h-4" />
                <span className="text-xs">Unique Tags</span>
              </div>
              <div className="text-2xl font-semibold">{review.topTags.length}</div>
              <div className="text-xs text-muted-foreground">used this month</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Calendar heatmap */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Activity</h3>
              <div className="p-4 rounded-lg border border-border">
                {/* Week day headers */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {weekDays.map((day, i) => (
                    <div
                      key={i}
                      className="h-6 flex items-center justify-center text-[10px] text-muted-foreground"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, i) => {
                    if (day === null) {
                      return <div key={`empty-${i}`} className="aspect-square" />;
                    }

                    const { dateKey, note } = getDayInfo(day);
                    const isToday = dateKey === today;
                    const isFuture = dateKey > today;

                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDate(dateKey)}
                        disabled={isFuture}
                        className={cn(
                          "aspect-square rounded text-[10px] transition-all flex items-center justify-center",
                          note && "font-medium",
                          note?.mood === "great" && "bg-emerald-400/30 text-emerald-600 dark:text-emerald-400",
                          note?.mood === "good" && "bg-green-400/30 text-green-600 dark:text-green-400",
                          note?.mood === "neutral" && "bg-muted text-muted-foreground",
                          note?.mood === "low" && "bg-amber-400/30 text-amber-600 dark:text-amber-400",
                          note?.mood === "rough" && "bg-red-400/30 text-red-600 dark:text-red-400",
                          note && !note.mood && "bg-accent",
                          !note && !isFuture && "hover:bg-accent/50",
                          isFuture && "opacity-30",
                          isToday && "ring-1 ring-foreground/50",
                        )}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Mood distribution */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Mood Distribution</h3>
              <div className="p-4 rounded-lg border border-border space-y-3">
                {moodTotal === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No moods logged this month
                  </p>
                ) : (
                  Object.entries(MOOD_OPTIONS).map(([level, mood]) => {
                    const count = review.moodDistribution[level as MoodLevel];
                    const percentage = moodPercentages[level as MoodLevel] || 0;

                    return (
                      <div key={level} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className={cn("flex items-center gap-2", mood.color)}>
                            <span className="font-mono">{mood.icon}</span>
                            {mood.label}
                          </span>
                          <span className="text-muted-foreground">{count}</span>
                        </div>
                        <div className="h-2 bg-accent rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              level === "great" && "bg-emerald-400",
                              level === "good" && "bg-green-400",
                              level === "neutral" && "bg-muted-foreground",
                              level === "low" && "bg-amber-400",
                              level === "rough" && "bg-red-400",
                            )}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Top tags */}
          {review.topTags.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Top Tags This Month</h3>
              <div className="flex flex-wrap gap-2">
                {review.topTags.map(({ tag, count }, index) => (
                  <div
                    key={tag}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors",
                      index === 0 && "border-foreground bg-accent",
                      index !== 0 && "border-border hover:bg-accent/50",
                    )}
                  >
                    <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm">{tag}</span>
                    <span className="text-xs text-muted-foreground bg-background px-1.5 py-0.5 rounded">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monthly reflection prompts */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Monthly Reflection</h3>
            <div className="grid grid-cols-2 gap-3">
              <ReflectionCard
                title="Wins"
                prompt="What were your biggest accomplishments this month?"
              />
              <ReflectionCard
                title="Growth"
                prompt="How did you grow or change this month?"
              />
              <ReflectionCard
                title="Challenges"
                prompt="What obstacles did you face and how did you handle them?"
              />
              <ReflectionCard
                title="Next Month"
                prompt="What do you want to focus on in the coming month?"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReflectionCard({ title, prompt }: { title: string; prompt: string }) {
  return (
    <div className="p-4 rounded-lg border border-dashed border-border hover:border-foreground/30 transition-colors cursor-pointer">
      <h4 className="text-sm font-medium mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground">{prompt}</p>
    </div>
  );
}
