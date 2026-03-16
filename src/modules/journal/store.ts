import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MoodLevel } from "@/types/notes";
import {
  DailyNote,
  InboxItem,
  JournalTemplate,
  JournalConfig,
  StreakData,
  WeeklyReview,
  MonthlyReview,
  MoodTrendPoint,
  TagStat,
  DEFAULT_JOURNAL_CONFIG,
  DEFAULT_TEMPLATES,
  formatDateKey,
  parseDateKey,
  getWeekBounds,
  getMonthBounds,
} from "./types";

interface JournalState {
  // Data
  dailyNotes: Record<string, DailyNote>; // Keyed by date string YYYY-MM-DD
  inbox: InboxItem[];
  templates: JournalTemplate[];
  config: JournalConfig;

  // Current state
  selectedDate: string; // YYYY-MM-DD
  isQuickCaptureOpen: boolean;

  // Daily notes
  getDailyNote: (date?: string) => DailyNote | null;
  getOrCreateDailyNote: (date?: string) => DailyNote;
  updateDailyNote: (date: string, updates: Partial<DailyNote>) => void;
  deleteDailyNote: (date: string) => void;
  getDailyNotesInRange: (startDate: string, endDate: string) => DailyNote[];

  // Navigation
  setSelectedDate: (date: string) => void;
  goToToday: () => void;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;

  // Inbox
  addToInbox: (content: string) => InboxItem;
  processInboxItem: (itemId: string, targetDate?: string, targetNoteId?: string) => void;
  deleteInboxItem: (itemId: string) => void;
  getUnprocessedInbox: () => InboxItem[];

  // Quick capture
  openQuickCapture: () => void;
  closeQuickCapture: () => void;
  toggleQuickCapture: () => void;

  // Templates
  getTemplates: () => JournalTemplate[];
  applyTemplate: (date: string, templateId: string) => void;

  // Stats and reviews
  getStreakData: () => StreakData;
  getWeeklyReview: (date?: Date) => WeeklyReview;
  getMonthlyReview: (date?: Date) => MonthlyReview;
  getThisDayLastWeek: () => DailyNote | null;
  getThisDayLastMonth: () => DailyNote | null;
  getThisDayLastYear: () => DailyNote | null;

  // Config
  updateConfig: (updates: Partial<JournalConfig>) => void;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      dailyNotes: {},
      inbox: [],
      templates: DEFAULT_TEMPLATES,
      config: DEFAULT_JOURNAL_CONFIG,
      selectedDate: formatDateKey(new Date()),
      isQuickCaptureOpen: false,

      // Daily notes
      getDailyNote: (date?: string) => {
        const targetDate = date || get().selectedDate;
        return get().dailyNotes[targetDate] || null;
      },

      getOrCreateDailyNote: (date?: string) => {
        const targetDate = date || get().selectedDate;
        const existing = get().dailyNotes[targetDate];
        if (existing) return existing;

        const dateObj = parseDateKey(targetDate);
        const newNote: DailyNote = {
          id: crypto.randomUUID(),
          date: targetDate,
          content: `# ${dateObj.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}\n\n`,
          tags: [],
          createdAt: new Date(),
          modifiedAt: new Date(),
        };

        set((state) => ({
          dailyNotes: {
            ...state.dailyNotes,
            [targetDate]: newNote,
          },
        }));

        return newNote;
      },

      updateDailyNote: (date: string, updates: Partial<DailyNote>) => {
        set((state) => {
          const existing = state.dailyNotes[date];
          if (!existing) return state;

          return {
            dailyNotes: {
              ...state.dailyNotes,
              [date]: {
                ...existing,
                ...updates,
                modifiedAt: new Date(),
              },
            },
          };
        });
      },

      deleteDailyNote: (date: string) => {
        set((state) => {
          const { [date]: _, ...rest } = state.dailyNotes;
          return { dailyNotes: rest };
        });
      },

      getDailyNotesInRange: (startDate: string, endDate: string) => {
        const notes = get().dailyNotes;
        return Object.values(notes)
          .filter((note) => note.date >= startDate && note.date <= endDate)
          .sort((a, b) => a.date.localeCompare(b.date));
      },

      // Navigation
      setSelectedDate: (date: string) => {
        set({ selectedDate: date });
      },

      goToToday: () => {
        set({ selectedDate: formatDateKey(new Date()) });
      },

      goToPreviousDay: () => {
        const current = parseDateKey(get().selectedDate);
        current.setDate(current.getDate() - 1);
        set({ selectedDate: formatDateKey(current) });
      },

      goToNextDay: () => {
        const current = parseDateKey(get().selectedDate);
        current.setDate(current.getDate() + 1);
        set({ selectedDate: formatDateKey(current) });
      },

      goToPreviousWeek: () => {
        const current = parseDateKey(get().selectedDate);
        current.setDate(current.getDate() - 7);
        set({ selectedDate: formatDateKey(current) });
      },

      goToNextWeek: () => {
        const current = parseDateKey(get().selectedDate);
        current.setDate(current.getDate() + 7);
        set({ selectedDate: formatDateKey(current) });
      },

      // Inbox
      addToInbox: (content: string) => {
        const item: InboxItem = {
          id: crypto.randomUUID(),
          content,
          createdAt: new Date(),
          isProcessed: false,
        };
        set((state) => ({
          inbox: [item, ...state.inbox],
        }));
        return item;
      },

      processInboxItem: (itemId: string, targetDate?: string, targetNoteId?: string) => {
        set((state) => ({
          inbox: state.inbox.map((item) =>
            item.id === itemId
              ? { ...item, isProcessed: true, targetDate, targetNoteId }
              : item
          ),
        }));
      },

      deleteInboxItem: (itemId: string) => {
        set((state) => ({
          inbox: state.inbox.filter((item) => item.id !== itemId),
        }));
      },

      getUnprocessedInbox: () => {
        return get().inbox.filter((item) => !item.isProcessed);
      },

      // Quick capture
      openQuickCapture: () => set({ isQuickCaptureOpen: true }),
      closeQuickCapture: () => set({ isQuickCaptureOpen: false }),
      toggleQuickCapture: () =>
        set((state) => ({ isQuickCaptureOpen: !state.isQuickCaptureOpen })),

      // Templates
      getTemplates: () => get().templates,

      applyTemplate: (date: string, templateId: string) => {
        const template = get().templates.find((t) => t.id === templateId);
        if (!template) return;

        const note = get().getOrCreateDailyNote(date);
        const dateObj = parseDateKey(date);

        // Generate content from template
        let content = `# ${dateObj.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}\n\n`;

        template.fields.forEach((field) => {
          if (field.type === "textarea" || field.type === "text") {
            content += `## ${field.label}\n\n${field.placeholder ? `> ${field.placeholder}\n\n` : ""}\n`;
          }
        });

        get().updateDailyNote(date, { content });
      },

      // Stats and reviews
      getStreakData: (): StreakData => {
        const notes = Object.values(get().dailyNotes).sort((a, b) =>
          b.date.localeCompare(a.date)
        );

        if (notes.length === 0) {
          return {
            currentStreak: 0,
            longestStreak: 0,
            lastEntryDate: null,
            totalEntries: 0,
            thisWeekEntries: 0,
            thisMonthEntries: 0,
          };
        }

        const today = formatDateKey(new Date());
        const yesterday = formatDateKey(
          new Date(Date.now() - 24 * 60 * 60 * 1000)
        );

        // Calculate current streak
        let currentStreak = 0;
        let checkDate = today;

        // Start from today or yesterday
        if (get().dailyNotes[today]) {
          currentStreak = 1;
          checkDate = yesterday;
        } else if (get().dailyNotes[yesterday]) {
          currentStreak = 1;
          const dayBefore = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
          checkDate = formatDateKey(dayBefore);
        }

        // Count consecutive days
        while (get().dailyNotes[checkDate]) {
          currentStreak++;
          const prev = parseDateKey(checkDate);
          prev.setDate(prev.getDate() - 1);
          checkDate = formatDateKey(prev);
        }

        // Calculate longest streak
        let longestStreak = 0;
        let tempStreak = 0;
        const sortedDates = Object.keys(get().dailyNotes).sort();

        for (let i = 0; i < sortedDates.length; i++) {
          if (i === 0) {
            tempStreak = 1;
          } else {
            const prev = parseDateKey(sortedDates[i - 1]);
            const curr = parseDateKey(sortedDates[i]);
            const diffDays = Math.round(
              (curr.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000)
            );
            if (diffDays === 1) {
              tempStreak++;
            } else {
              longestStreak = Math.max(longestStreak, tempStreak);
              tempStreak = 1;
            }
          }
        }
        longestStreak = Math.max(longestStreak, tempStreak);

        // This week and month entries
        const { start: weekStart, end: weekEnd } = getWeekBounds(
          new Date(),
          get().config.weekStartsOn
        );
        const { start: monthStart, end: monthEnd } = getMonthBounds(new Date());

        const thisWeekEntries = notes.filter((n) => {
          const d = parseDateKey(n.date);
          return d >= weekStart && d <= weekEnd;
        }).length;

        const thisMonthEntries = notes.filter((n) => {
          const d = parseDateKey(n.date);
          return d >= monthStart && d <= monthEnd;
        }).length;

        return {
          currentStreak,
          longestStreak,
          lastEntryDate: notes[0]?.date || null,
          totalEntries: notes.length,
          thisWeekEntries,
          thisMonthEntries,
        };
      },

      getWeeklyReview: (date?: Date): WeeklyReview => {
        const targetDate = date || parseDateKey(get().selectedDate);
        const { start, end } = getWeekBounds(targetDate, get().config.weekStartsOn);

        const startKey = formatDateKey(start);
        const endKey = formatDateKey(end);

        const entries = get().getDailyNotesInRange(startKey, endKey);

        // Mood trend
        const moodTrend: MoodTrendPoint[] = entries
          .filter((e) => e.mood)
          .map((e) => ({
            date: e.date,
            mood: e.mood!,
            label: parseDateKey(e.date).toLocaleDateString("en-US", {
              weekday: "short",
            }),
          }));

        // Top tags
        const tagCounts: Record<string, number> = {};
        entries.forEach((e) => {
          e.tags.forEach((tag) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        });
        const topTags: TagStat[] = Object.entries(tagCounts)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Calculate streak for this week
        const streak = get().getStreakData().currentStreak;

        return {
          weekStart: startKey,
          weekEnd: endKey,
          entries,
          moodTrend,
          topTags,
          streak,
          completedDays: entries.length,
        };
      },

      getMonthlyReview: (date?: Date): MonthlyReview => {
        const targetDate = date || parseDateKey(get().selectedDate);
        const { start, end } = getMonthBounds(targetDate);

        const startKey = formatDateKey(start);
        const endKey = formatDateKey(end);

        const entries = get().getDailyNotesInRange(startKey, endKey);

        // Mood distribution
        const moodDistribution: Record<MoodLevel, number> = {
          great: 0,
          good: 0,
          neutral: 0,
          low: 0,
          rough: 0,
        };
        entries.forEach((e) => {
          if (e.mood) {
            moodDistribution[e.mood]++;
          }
        });

        // Top tags
        const tagCounts: Record<string, number> = {};
        entries.forEach((e) => {
          e.tags.forEach((tag) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        });
        const topTags: TagStat[] = Object.entries(tagCounts)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        // Weeks with entries
        const weeksWithEntries = new Set<number>();
        entries.forEach((e) => {
          const d = parseDateKey(e.date);
          const weekNum = Math.floor(d.getDate() / 7);
          weeksWithEntries.add(weekNum);
        });

        return {
          month: `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}`,
          entries,
          moodDistribution,
          topTags,
          totalEntries: entries.length,
          streakData: get().getStreakData(),
          weeksCompleted: weeksWithEntries.size,
        };
      },

      getThisDayLastWeek: () => {
        const current = parseDateKey(get().selectedDate);
        current.setDate(current.getDate() - 7);
        return get().dailyNotes[formatDateKey(current)] || null;
      },

      getThisDayLastMonth: () => {
        const current = parseDateKey(get().selectedDate);
        current.setMonth(current.getMonth() - 1);
        return get().dailyNotes[formatDateKey(current)] || null;
      },

      getThisDayLastYear: () => {
        const current = parseDateKey(get().selectedDate);
        current.setFullYear(current.getFullYear() - 1);
        return get().dailyNotes[formatDateKey(current)] || null;
      },

      // Config
      updateConfig: (updates: Partial<JournalConfig>) => {
        set((state) => ({
          config: { ...state.config, ...updates },
        }));
      },
    }),
    {
      name: "haptic-journal",
      partialize: (state) => ({
        dailyNotes: state.dailyNotes,
        inbox: state.inbox,
        templates: state.templates,
        config: state.config,
      }),
    }
  )
);
