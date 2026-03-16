"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Flame, Calendar, Tag, TrendingUp } from "lucide-react";
import { useJournalStore, parseDateKey, formatDateKey } from "@/modules/journal";
import { MOOD_OPTIONS, MoodLevel } from "@/types/notes";

export function WeeklyReview() {
  const {
    selectedDate,
    getWeeklyReview,
    goToPreviousWeek,
    goToNextWeek,
    setSelectedDate,
  } = useJournalStore();

  const review = getWeeklyReview();
  const today = formatDateKey(new Date());

  // Generate week days for display
  const weekDays = useMemo(() => {
    const start = parseDateKey(review.weekStart);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push({
        date: formatDateKey(d),
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        dayNum: d.getDate(),
      });
    }
    return days;
  }, [review.weekStart]);

  const weekLabel = useMemo(() => {
    const start = parseDateKey(review.weekStart);
    const end = parseDateKey(review.weekEnd);
    const startMonth = start.toLocaleDateString("en-US", { month: "short" });
    const endMonth = end.toLocaleDateString("en-US", { month: "short" });
    
    if (startMonth === endMonth) {
      return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
    }
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${start.getFullYear()}`;
  }, [review.weekStart, review.weekEnd]);

  // Calculate mood average
  const moodAverage = useMemo(() => {
    if (review.moodTrend.length === 0) return null;
    const moodValues: Record<MoodLevel, number> = {
      great: 5,
      good: 4,
      neutral: 3,
      low: 2,
      rough: 1,
    };
    const sum = review.moodTrend.reduce((acc, m) => acc + moodValues[m.mood], 0);
    const avg = sum / review.moodTrend.length;
    
    if (avg >= 4.5) return "great";
    if (avg >= 3.5) return "good";
    if (avg >= 2.5) return "neutral";
    if (avg >= 1.5) return "low";
    return "rough";
  }, [review.moodTrend]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-[52px] flex items-center justify-between px-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousWeek}
            className="p-1.5 rounded-md hover:bg-accent transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goToNextWeek}
            className="p-1.5 rounded-md hover:bg-accent transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <span className="font-medium">Week of {weekLabel}</span>

        <button
          onClick={() => setSelectedDate(today)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          This week
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-8">
          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              icon={<Calendar className="w-4 h-4" />}
              label="Days Journaled"
              value={`${review.completedDays}/7`}
              sublabel={`${Math.round((review.completedDays / 7) * 100)}% completion`}
            />
            <StatCard
              icon={<Flame className="w-4 h-4 text-orange-400" />}
              label="Current Streak"
              value={`${review.streak}`}
              sublabel="consecutive days"
            />
            <StatCard
              icon={<TrendingUp className="w-4 h-4" />}
              label="Avg Mood"
              value={moodAverage ? MOOD_OPTIONS[moodAverage].label : "N/A"}
              sublabel={moodAverage ? MOOD_OPTIONS[moodAverage].icon : "-"}
              valueClass={moodAverage ? MOOD_OPTIONS[moodAverage].color : ""}
            />
          </div>

          {/* Week day overview */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Daily Overview</h3>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map(({ date, dayName, dayNum }) => {
                const entry = review.entries.find((e) => e.date === date);
                const isToday = date === today;
                const isSelected = date === selectedDate;
                const isFuture = date > today;

                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    disabled={isFuture}
                    className={cn(
                      "flex flex-col items-center p-3 rounded-lg border transition-all",
                      isSelected && "border-foreground bg-accent",
                      !isSelected && entry && "border-border bg-card hover:bg-accent",
                      !isSelected && !entry && !isFuture && "border-dashed border-border hover:border-foreground/30",
                      isFuture && "opacity-50 cursor-not-allowed border-border",
                      isToday && !isSelected && "ring-1 ring-foreground/30",
                    )}
                  >
                    <span className="text-[10px] text-muted-foreground">{dayName}</span>
                    <span className={cn("text-lg font-medium", !entry && !isFuture && "text-muted-foreground")}>
                      {dayNum}
                    </span>
                    {entry?.mood && (
                      <span className={cn("text-xs mt-1", MOOD_OPTIONS[entry.mood].color)}>
                        {MOOD_OPTIONS[entry.mood].icon}
                      </span>
                    )}
                    {entry && !entry.mood && (
                      <span className="w-1.5 h-1.5 rounded-full bg-foreground/30 mt-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mood trend */}
          {review.moodTrend.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Mood Trend</h3>
              <div className="h-24 flex items-end gap-1">
                {weekDays.map(({ date, dayName }) => {
                  const moodPoint = review.moodTrend.find((m) => m.date === date);
                  const moodValues: Record<MoodLevel, number> = {
                    great: 100,
                    good: 75,
                    neutral: 50,
                    low: 25,
                    rough: 10,
                  };
                  const height = moodPoint ? moodValues[moodPoint.mood] : 0;

                  return (
                    <div key={date} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex-1 flex items-end">
                        {moodPoint ? (
                          <div
                            className={cn(
                              "w-full rounded-t transition-all",
                              moodPoint.mood === "great" && "bg-emerald-400",
                              moodPoint.mood === "good" && "bg-green-400",
                              moodPoint.mood === "neutral" && "bg-muted-foreground/50",
                              moodPoint.mood === "low" && "bg-amber-400",
                              moodPoint.mood === "rough" && "bg-red-400",
                            )}
                            style={{ height: `${height}%` }}
                          />
                        ) : (
                          <div className="w-full h-1 bg-border rounded" />
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{dayName}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top tags */}
          {review.topTags.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Frequent Tags</h3>
              <div className="flex flex-wrap gap-2">
                {review.topTags.map(({ tag, count }) => (
                  <div
                    key={tag}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-accent text-sm"
                  >
                    <Tag className="w-3 h-3 text-muted-foreground" />
                    <span>{tag}</span>
                    <span className="text-xs text-muted-foreground">({count})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reflection prompts */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Reflection Prompts</h3>
            <div className="space-y-2">
              <ReflectionPrompt prompt="What was the highlight of this week?" />
              <ReflectionPrompt prompt="What challenged you, and how did you respond?" />
              <ReflectionPrompt prompt="What would you do differently?" />
              <ReflectionPrompt prompt="What are you grateful for from this week?" />
            </div>
          </div>

          {/* Entries list */}
          {review.entries.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">This Week&apos;s Entries</h3>
              <div className="space-y-2">
                {review.entries.map((entry) => {
                  const d = parseDateKey(entry.date);
                  const preview = entry.content
                    .replace(/^#.*\n?/gm, "")
                    .replace(/\n+/g, " ")
                    .trim()
                    .slice(0, 150);

                  return (
                    <button
                      key={entry.id}
                      onClick={() => setSelectedDate(entry.date)}
                      className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          {d.toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        {entry.mood && (
                          <span className={cn("text-xs", MOOD_OPTIONS[entry.mood].color)}>
                            {MOOD_OPTIONS[entry.mood].icon} {MOOD_OPTIONS[entry.mood].label}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{preview || "No content"}</p>
                      {entry.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {entry.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 rounded bg-accent text-[10px]"
                            >
                              {tag}
                            </span>
                          ))}
                          {entry.tags.length > 3 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{entry.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sublabel,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel: string;
  valueClass?: string;
}) {
  return (
    <div className="p-4 rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className={cn("text-2xl font-semibold", valueClass)}>{value}</div>
      <div className="text-xs text-muted-foreground">{sublabel}</div>
    </div>
  );
}

function ReflectionPrompt({ prompt }: { prompt: string }) {
  return (
    <div className="p-3 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:border-foreground/30 transition-colors cursor-pointer">
      {prompt}
    </div>
  );
}
