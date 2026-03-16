"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Calendar, Sparkles } from "lucide-react";
import { useJournalStore, parseDateKey, formatDateKey, DailyNote } from "@/modules/journal";
import { JournalMetadataEditor } from "../JournalMetadataEditor";
import { MoodLevel } from "@/types/notes";

interface DailyNoteEditorProps {
  showMetadata?: boolean;
}

export function DailyNoteEditor({ showMetadata = false }: DailyNoteEditorProps) {
  const {
    selectedDate,
    getDailyNote,
    getOrCreateDailyNote,
    updateDailyNote,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    getThisDayLastWeek,
    getThisDayLastMonth,
    getTemplates,
    applyTemplate,
  } = useJournalStore();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const note = getDailyNote();
  const today = formatDateKey(new Date());
  const isToday = selectedDate === today;
  const dateObj = parseDateKey(selectedDate);

  const thisDayLastWeek = getThisDayLastWeek();
  const thisDayLastMonth = getThisDayLastMonth();
  const templates = getTemplates();

  // Auto-create daily note when date changes
  useEffect(() => {
    if (!note) {
      getOrCreateDailyNote(selectedDate);
    }
  }, [selectedDate, note, getOrCreateDailyNote]);

  // Focus textarea when note loads
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [selectedDate]);

  const handleContentChange = (content: string) => {
    updateDailyNote(selectedDate, { content });
  };

  const handleMoodChange = (mood: MoodLevel | undefined) => {
    updateDailyNote(selectedDate, { mood });
  };

  const handleTagsChange = (tags: string[]) => {
    updateDailyNote(selectedDate, { tags });
  };

  const handleApplyTemplate = (templateId: string) => {
    applyTemplate(selectedDate, templateId);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Arrow for day navigation
      if ((e.metaKey || e.ctrlKey) && e.key === "ArrowLeft") {
        e.preventDefault();
        goToPreviousDay();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "ArrowRight") {
        e.preventDefault();
        goToNextDay();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "t") {
        e.preventDefault();
        goToToday();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToPreviousDay, goToNextDay, goToToday]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header with date navigation */}
      <div className="h-[52px] flex items-center justify-between px-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousDay}
            className="p-1.5 rounded-md hover:bg-accent transition-colors"
            title="Previous day (Cmd+Left)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goToNextDay}
            className="p-1.5 rounded-md hover:bg-accent transition-colors"
            title="Next day (Cmd+Right)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">
            {isToday ? "Today" : dateObj.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </span>
          {!isToday && (
            <button
              onClick={goToToday}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              (Go to today)
            </button>
          )}
        </div>

        {/* Template selector */}
        <div className="flex items-center gap-2">
          {templates.length > 0 && (
            <div className="relative group">
              <button className="p-1.5 rounded-md hover:bg-accent transition-colors flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Templates</span>
              </button>
              <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleApplyTemplate(template.id)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors first:rounded-t-md last:rounded-b-md"
                  >
                    <div className="font-medium">{template.name}</div>
                    {template.description && (
                      <div className="text-xs text-muted-foreground">{template.description}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-6">
            <textarea
              ref={textareaRef}
              value={note?.content || ""}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Start writing..."
              className="w-full min-h-[400px] bg-transparent border-0 outline-none resize-none text-sm leading-relaxed placeholder:text-muted-foreground font-mono"
              style={{ fieldSizing: "content" }}
            />
          </div>
        </div>

        {/* Metadata panel */}
        {showMetadata && (
          <div className="w-64 border-l border-border overflow-y-auto shrink-0">
            <div className="p-4 space-y-6">
              {/* Mood and tags */}
              <JournalMetadataEditor
                selectedMood={note?.mood}
                selectedTags={note?.tags || []}
                onMoodChange={handleMoodChange}
                onTagsChange={handleTagsChange}
              />

              {/* This day in the past */}
              {(thisDayLastWeek || thisDayLastMonth) && (
                <div className="space-y-2 pt-4 border-t border-border">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    On This Day
                  </h4>

                  {thisDayLastWeek && (
                    <PastEntryPreview
                      note={thisDayLastWeek}
                      label="Last week"
                    />
                  )}

                  {thisDayLastMonth && (
                    <PastEntryPreview
                      note={thisDayLastMonth}
                      label="Last month"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PastEntryPreview({ note, label }: { note: DailyNote; label: string }) {
  const preview = note.content
    .replace(/^#.*\n?/gm, "")
    .replace(/\n+/g, " ")
    .trim()
    .slice(0, 100);

  return (
    <div className="rounded-md border border-border p-2 text-xs">
      <div className="text-muted-foreground mb-1">{label}</div>
      <p className="line-clamp-3">{preview || "Empty entry"}</p>
    </div>
  );
}
