import { format, formatDistanceToNow } from "date-fns";
import {
  CalendarDays,
  Clock3,
  FileText,
  Hash,
  Info,
  Layers,
  ScanText,
  Sparkles,
  Timer,
  Type,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { NoteFile } from "@/types/notes";
import { cn } from "@/shared/lib/utils";

interface MetadataPanelProps {
  file: NoteFile | null;
  className?: string;
  isMobile?: boolean;
  onDragHandlePointerDown?: React.PointerEventHandler<HTMLDivElement>;
  onRequestClose?: () => void;
}

type MetadataTab = "info" | "outline";

type InfoCard = {
  label: string;
  value: string;
  icon: typeof CalendarDays;
};

function formatAbsoluteTime(date: Date) {
  return format(date, "MMM d, yyyy • HH:mm");
}

function formatRelativeTime(date: Date) {
  return `${formatDistanceToNow(date, { addSuffix: true })}`;
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getReadingTimeLabel(wordCount: number) {
  return `${Math.max(1, Math.ceil(wordCount / 200))} min`;
}

function getFileKind(file: NoteFile) {
  if (file.journalMeta) return "Journal note";
  if (file.name.toLowerCase().endsWith(".md")) return "Markdown note";
  return "Note";
}

function SectionTitle({
  icon: Icon,
  title,
  caption,
}: {
  icon: typeof Info;
  title: string;
  caption?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-2xl border border-border/70 bg-background/70 text-muted-foreground">
          <Icon className="h-4 w-4" strokeWidth={1.7} />
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground/72">
            {title}
          </p>
          {caption ? <p className="mt-0.5 text-xs text-muted-foreground">{caption}</p> : null}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  icon: Icon,
  label,
  onClick,
  isMobile,
}: {
  active: boolean;
  icon: typeof Info;
  label: string;
  onClick: () => void;
  isMobile: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "pressable flex items-center justify-center gap-2 rounded-2xl transition-colors",
        isMobile ? "h-11 flex-1 px-4 text-sm font-medium" : "h-9 px-3 text-xs font-medium",
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" strokeWidth={1.7} />
      <span>{label}</span>
    </button>
  );
}

export function MetadataPanel({
  file,
  className,
  isMobile = false,
  onDragHandlePointerDown,
  onRequestClose,
}: MetadataPanelProps) {
  const [activeTab, setActiveTab] = useState<MetadataTab>("info");

  const outlineItems = useMemo(() => {
    if (!file) return [];

    return file.content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => /^#{1,3}\s/.test(line))
      .map((heading, index) => {
        const level = heading.match(/^(#+)/)?.[1].length ?? 1;
        return {
          id: `${heading}-${index}`,
          level,
          text: heading.replace(/^#+\s+/, ""),
        };
      });
  }, [file]);

  const derived = useMemo(() => {
    if (!file) return null;

    const wordCount = file.content.split(/\s+/).filter(Boolean).length;
    const characterCount = file.content.length;
    const fileSize = new Blob([file.content]).size;
    const tagCount = file.journalMeta?.tags.length ?? 0;

    const cards: InfoCard[] = [
      { label: "Words", value: wordCount.toLocaleString(), icon: ScanText },
      { label: "Characters", value: characterCount.toLocaleString(), icon: Type },
      { label: "Reading", value: getReadingTimeLabel(wordCount), icon: Timer },
      { label: "Size", value: formatFileSize(fileSize), icon: FileText },
    ];

    return {
      wordCount,
      characterCount,
      fileSize,
      tagCount,
      cards,
      kind: getFileKind(file),
      createdAbsolute: formatAbsoluteTime(file.createdAt),
      createdRelative: formatRelativeTime(file.createdAt),
      updatedAbsolute: formatAbsoluteTime(file.modifiedAt),
      updatedRelative: formatRelativeTime(file.modifiedAt),
      headingsCount: outlineItems.length,
    };
  }, [file, outlineItems.length]);

  if (!file || !derived) return null;

  return (
    <aside
      className={cn(
        "flex flex-col bg-card/96 text-foreground",
        isMobile
          ? "h-full w-full rounded-[inherit] border-0 bg-transparent"
          : "border-l border-border/70 shadow-[inset_1px_0_0_rgba(255,255,255,0.03)]",
        className,
      )}
    >
      <div
        className={cn(
          "shrink-0 border-b border-border/70",
          isMobile ? "bg-background/78 px-4 pb-3 pt-3 backdrop-blur-xl" : "px-4 pb-4 pt-4",
        )}
      >
        {isMobile ? (
          <div
            className="cursor-grab touch-none active:cursor-grabbing"
            onPointerDown={onDragHandlePointerDown}
          >
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-border/90" />
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-muted-foreground/70">
                  Inspector
                </p>
                <p className="mt-1 truncate text-sm font-semibold tracking-[-0.02em] text-foreground">
                  {file.name}
                </p>
              </div>
              {onRequestClose ? (
                <button
                  onClick={onRequestClose}
                  onPointerDown={(event) => event.stopPropagation()}
                  className="pressable flex h-10 w-10 items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  title="Close details"
                >
                  <X className="h-4 w-4" strokeWidth={1.7} />
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-muted-foreground/68">
                Note Details
              </p>
              <p className="mt-1 truncate text-sm font-semibold tracking-[-0.02em] text-foreground">
                {file.name}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{derived.kind}</p>
            </div>
          </div>
        )}

        <div className="rounded-[1.35rem] border border-border/70 bg-background/80 p-3 shadow-[0_18px_38px_rgba(0,0,0,0.16)]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-border/70 bg-accent/60 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {derived.kind}
                </span>
                {file.preferredEditorMode ? (
                  <span className="inline-flex items-center rounded-full border border-border/70 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    {file.preferredEditorMode === "block" ? "Block" : "Raw"}
                  </span>
                ) : null}
              </div>
              <p className="mt-3 line-clamp-2 text-sm font-semibold tracking-[-0.02em] text-foreground">
                {file.name.replace(/\.md$/i, "")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Updated {derived.updatedRelative}
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-foreground text-background shadow-[0_12px_28px_rgba(255,255,255,0.08)]">
              <Sparkles className="h-4 w-4" strokeWidth={1.8} />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {derived.cards.map((card) => (
              <div
                key={card.label}
                className="rounded-[1rem] border border-border/70 bg-card/80 px-3 py-3"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <card.icon className="h-3.5 w-3.5" strokeWidth={1.7} />
                  <span className="text-[11px] uppercase tracking-[0.16em]">{card.label}</span>
                </div>
                <div className="mt-2 text-sm font-semibold tracking-[-0.02em] text-foreground">
                  {card.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={cn("mt-3 flex items-center gap-1 rounded-2xl bg-background/80 p-1.5")}>
          <TabButton
            active={activeTab === "info"}
            icon={Info}
            label="Info"
            onClick={() => setActiveTab("info")}
            isMobile={isMobile}
          />
          <TabButton
            active={activeTab === "outline"}
            icon={Layers}
            label="Outline"
            onClick={() => setActiveTab("outline")}
            isMobile={isMobile}
          />
        </div>
      </div>

      {activeTab === "info" ? (
        <div className={cn("flex-1 space-y-5 overflow-y-auto px-4 py-4")}>
          <section className="space-y-3">
            <SectionTitle
              icon={Clock3}
              title="Timeline"
              caption="When this note was created and last changed."
            />
            <div className="space-y-2">
              <div className="rounded-[1.1rem] border border-border/70 bg-background/58 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Last updated
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">{derived.updatedAbsolute}</p>
                <p className="mt-1 text-xs text-muted-foreground">{derived.updatedRelative}</p>
              </div>
              <div className="rounded-[1.1rem] border border-border/70 bg-background/58 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Created
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">{derived.createdAbsolute}</p>
                <p className="mt-1 text-xs text-muted-foreground">{derived.createdRelative}</p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <SectionTitle
              icon={CalendarDays}
              title="Document"
              caption="Basic metadata and structure signals."
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-[1.1rem] border border-border/70 bg-background/58 px-4 py-3">
                <span className="text-[13px] text-muted-foreground">Headings</span>
                <span className="text-[13px] font-medium tabular-nums text-foreground">
                  {derived.headingsCount}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-[1.1rem] border border-border/70 bg-background/58 px-4 py-3">
                <span className="text-[13px] text-muted-foreground">Journal tags</span>
                <span className="text-[13px] font-medium tabular-nums text-foreground">
                  {derived.tagCount}
                </span>
              </div>
            </div>
          </section>

          {file.journalMeta ? (
            <section className="space-y-3">
              <SectionTitle
                icon={Hash}
                title="Journal Metadata"
                caption="Metadata already attached to this note."
              />
              {file.journalMeta.mood ? (
                <div className="rounded-[1.1rem] border border-border/70 bg-background/58 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Mood
                  </p>
                  <p className="mt-1 text-sm font-medium capitalize text-foreground">
                    {file.journalMeta.mood}
                  </p>
                </div>
              ) : null}

              <div className="rounded-[1.1rem] border border-border/70 bg-background/58 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Tags
                </p>
                {file.journalMeta.tags.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {file.journalMeta.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full border border-border/70 bg-accent/60 px-2.5 py-1 text-xs text-foreground/88"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">No tags added yet.</p>
                )}
              </div>

              {(file.journalMeta.location || file.journalMeta.weather) && (
                <div className="grid grid-cols-1 gap-2">
                  {file.journalMeta.location ? (
                    <div className="rounded-[1.1rem] border border-border/70 bg-background/58 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        Location
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {file.journalMeta.location}
                      </p>
                    </div>
                  ) : null}
                  {file.journalMeta.weather ? (
                    <div className="rounded-[1.1rem] border border-border/70 bg-background/58 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        Weather
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {file.journalMeta.weather}
                      </p>
                    </div>
                  ) : null}
                </div>
              )}
            </section>
          ) : null}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="mb-3">
            <SectionTitle
              icon={Layers}
              title="Outline"
              caption="Markdown headings detected in the current note."
            />
          </div>

          {outlineItems.length > 0 ? (
            <div className="space-y-2">
              {outlineItems.map((heading) => (
                <div
                  key={heading.id}
                  className={cn(
                    "rounded-[1.1rem] border border-border/70 bg-background/58 px-4 py-3 text-sm text-foreground/86 transition-colors hover:bg-accent/50",
                  )}
                  style={{ paddingLeft: `${16 + (heading.level - 1) * 12}px` }}
                >
                  <p className="truncate">{heading.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.35rem] border border-dashed border-border/80 bg-background/45 px-4 py-6 text-center">
              <p className="text-sm font-medium text-foreground">No headings yet</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Add markdown headings like #, ##, or ### to build an outline for longer notes.
              </p>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
