"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Inbox, Trash2, Calendar, FileText, Check, ChevronDown, ChevronRight } from "lucide-react";
import { useJournalStore, formatDateKey, parseDateKey, InboxItem } from "@/modules/journal";
import { formatDistanceToNow } from "date-fns";

interface InboxPanelProps {
  onClose?: () => void;
}

export function InboxPanel({ onClose }: InboxPanelProps) {
  const {
    inbox,
    getUnprocessedInbox,
    processInboxItem,
    deleteInboxItem,
    getOrCreateDailyNote,
    updateDailyNote,
    selectedDate,
    setSelectedDate,
  } = useJournalStore();

  const [showProcessed, setShowProcessed] = useState(false);

  const unprocessedItems = getUnprocessedInbox();
  const processedItems = inbox.filter((item) => item.isProcessed);

  const handleAddToToday = (item: InboxItem) => {
    const today = formatDateKey(new Date());
    const note = getOrCreateDailyNote(today);
    const timestamp = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    const newContent = `${note.content}\n\n*${timestamp} (from inbox)*\n${item.content}`;
    updateDailyNote(today, { content: newContent });
    processInboxItem(item.id, today);
    setSelectedDate(today);
  };

  const handleAddToSelected = (item: InboxItem) => {
    const note = getOrCreateDailyNote(selectedDate);
    const timestamp = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    const newContent = `${note.content}\n\n*${timestamp} (from inbox)*\n${item.content}`;
    updateDailyNote(selectedDate, { content: newContent });
    processInboxItem(item.id, selectedDate);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-[52px] flex items-center justify-between px-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Inbox className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">Inbox</span>
          {unprocessedItems.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-foreground text-background text-[10px] font-medium">
              {unprocessedItems.length}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {unprocessedItems.length === 0 ? (
            <div className="text-center py-12">
              <Inbox className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Your inbox is empty</p>
              <p className="text-xs text-muted-foreground mt-1">
                Use <kbd className="px-1 py-0.5 rounded bg-accent text-[10px] font-mono">Cmd+Shift+N</kbd> to quickly capture thoughts
              </p>
            </div>
          ) : (
            unprocessedItems.map((item) => (
              <InboxItemCard
                key={item.id}
                item={item}
                onAddToToday={() => handleAddToToday(item)}
                onAddToSelected={() => handleAddToSelected(item)}
                onDelete={() => deleteInboxItem(item.id)}
                selectedDateLabel={parseDateKey(selectedDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              />
            ))
          )}

          {/* Processed items */}
          {processedItems.length > 0 && (
            <div className="pt-4 border-t border-border">
              <button
                onClick={() => setShowProcessed(!showProcessed)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {showProcessed ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
                Processed ({processedItems.length})
              </button>

              {showProcessed && (
                <div className="mt-2 space-y-2">
                  {processedItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 rounded-md bg-accent/30 text-muted-foreground"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs line-clamp-2">{item.content}</p>
                        <button
                          onClick={() => deleteInboxItem(item.id)}
                          className="p-1 rounded hover:bg-accent transition-colors shrink-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-[10px]">
                        <Check className="w-3 h-3 text-green-500" />
                        <span>Added to {item.targetDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface InboxItemCardProps {
  item: InboxItem;
  onAddToToday: () => void;
  onAddToSelected: () => void;
  onDelete: () => void;
  selectedDateLabel: string;
}

function InboxItemCard({
  item,
  onAddToToday,
  onAddToSelected,
  onDelete,
  selectedDateLabel,
}: InboxItemCardProps) {
  const timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true });

  return (
    <div className="p-3 rounded-lg border border-border bg-card">
      <p className="text-sm whitespace-pre-wrap mb-3">{item.content}</p>

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{timeAgo}</span>

        <div className="flex items-center gap-1">
          <button
            onClick={onAddToToday}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-accent transition-colors"
            title="Add to today's journal"
          >
            <Calendar className="w-3 h-3" />
            Today
          </button>
          <button
            onClick={onAddToSelected}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-accent transition-colors"
            title={`Add to ${selectedDateLabel}`}
          >
            <FileText className="w-3 h-3" />
            {selectedDateLabel}
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-accent transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
