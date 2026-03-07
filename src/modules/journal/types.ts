import { MoodLevel } from "@/types/notes";

// Daily journal entry
export interface DailyNote {
  id: string;
  date: string; // YYYY-MM-DD format
  content: string;
  mood?: MoodLevel;
  tags: string[];
  createdAt: Date;
  modifiedAt: Date;
  // Journal-specific fields
  intentions?: string;
  gratitude?: string;
  wins?: string;
  blockers?: string;
  weather?: string;
  location?: string;
}

// Quick capture item that goes to inbox
export interface InboxItem {
  id: string;
  content: string;
  createdAt: Date;
  isProcessed: boolean;
  targetDate?: string; // If assigned to a daily note
  targetNoteId?: string; // If assigned to a regular note
}

// Journal template for reusable prompts
export interface JournalTemplate {
  id: string;
  name: string;
  description?: string;
  fields: JournalTemplateField[];
  isDefault: boolean;
  createdAt: Date;
}

export interface JournalTemplateField {
  id: string;
  type: "text" | "textarea" | "mood" | "tags" | "checklist";
  label: string;
  placeholder?: string;
  isRequired: boolean;
}

// Streak tracking
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastEntryDate: string | null;
  totalEntries: number;
  thisWeekEntries: number;
  thisMonthEntries: number;
}

// Weekly review data
export interface WeeklyReview {
  weekStart: string; // YYYY-MM-DD (Monday)
  weekEnd: string; // YYYY-MM-DD (Sunday)
  entries: DailyNote[];
  moodTrend: MoodTrendPoint[];
  topTags: TagStat[];
  streak: number;
  completedDays: number;
}

export interface MoodTrendPoint {
  date: string;
  mood: MoodLevel;
  label: string;
}

export interface TagStat {
  tag: string;
  count: number;
}

// Monthly review data
export interface MonthlyReview {
  month: string; // YYYY-MM
  entries: DailyNote[];
  moodDistribution: Record<MoodLevel, number>;
  topTags: TagStat[];
  totalEntries: number;
  streakData: StreakData;
  weeksCompleted: number;
}

// Journal configuration
export interface JournalConfig {
  defaultTemplate: string | null;
  reminderTime?: string; // HH:mm format
  showWeather: boolean;
  showLocation: boolean;
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
  autoCreateDailyNote: boolean;
}

// Default journal config
export const DEFAULT_JOURNAL_CONFIG: JournalConfig = {
  defaultTemplate: null,
  reminderTime: undefined,
  showWeather: false,
  showLocation: false,
  weekStartsOn: 1, // Monday
  autoCreateDailyNote: true,
};

// Default journal templates
export const DEFAULT_TEMPLATES: JournalTemplate[] = [
  {
    id: "morning",
    name: "Morning Pages",
    description: "Start your day with intention",
    isDefault: true,
    createdAt: new Date(),
    fields: [
      { id: "mood", type: "mood", label: "How are you feeling?", isRequired: false },
      { id: "gratitude", type: "textarea", label: "Gratitude", placeholder: "What are you grateful for today?", isRequired: false },
      { id: "intentions", type: "textarea", label: "Intentions", placeholder: "What do you want to accomplish today?", isRequired: false },
      { id: "freewrite", type: "textarea", label: "Free Write", placeholder: "What's on your mind?", isRequired: false },
    ],
  },
  {
    id: "evening",
    name: "Evening Reflection",
    description: "Review and reflect on your day",
    isDefault: true,
    createdAt: new Date(),
    fields: [
      { id: "mood", type: "mood", label: "How was your day?", isRequired: false },
      { id: "wins", type: "textarea", label: "Wins", placeholder: "What went well today?", isRequired: false },
      { id: "blockers", type: "textarea", label: "Challenges", placeholder: "What was difficult?", isRequired: false },
      { id: "lessons", type: "textarea", label: "Lessons", placeholder: "What did you learn?", isRequired: false },
      { id: "tomorrow", type: "textarea", label: "Tomorrow", placeholder: "What do you want to focus on tomorrow?", isRequired: false },
    ],
  },
  {
    id: "simple",
    name: "Simple Entry",
    description: "Just write",
    isDefault: true,
    createdAt: new Date(),
    fields: [
      { id: "mood", type: "mood", label: "Mood", isRequired: false },
      { id: "tags", type: "tags", label: "Tags", isRequired: false },
      { id: "content", type: "textarea", label: "Entry", placeholder: "Write freely...", isRequired: false },
    ],
  },
];

// Helper to format date as YYYY-MM-DD
export function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Helper to parse date key back to Date
export function parseDateKey(dateKey: string): Date {
  return new Date(dateKey + "T00:00:00");
}

// Helper to get week number
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// Helper to get start and end of week
export function getWeekBounds(date: Date, weekStartsOn: 0 | 1 = 1): { start: Date; end: Date } {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  
  const start = new Date(d);
  start.setDate(d.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

// Helper to get start and end of month
export function getMonthBounds(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}
