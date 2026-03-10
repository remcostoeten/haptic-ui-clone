"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { FileText } from "lucide-react";
import { NoteFile, RichTextDocument } from "@/types/notes";
import { MarkdownRenderer } from "./markdown-renderer";

type EditorMode = "raw" | "block";

// Dynamically import RichTextEditor to avoid SSR issues with BlockNote
const RichTextEditor = dynamic(
  () => import("./rich-text-editor").then((mod) => ({ default: mod.RichTextEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm">Loading block editor...</div>
      </div>
    ),
  },
);

interface EditorProps {
  file: NoteFile | null;
  editorMode: EditorMode;
  isMobile?: boolean;
  onContentChange: (
    id: string,
    content: string,
    options?: {
      richContent?: RichTextDocument;
      preferredEditorMode?: EditorMode;
    },
  ) => void;
}

export function Editor({ file, editorMode, onContentChange }: EditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current && isEditing) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [file?.content, isEditing]);

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to end
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [isEditing]);

  const handleMarkdownChange = useCallback(
    (content: string) => {
      if (file) {
        onContentChange(file.id, content);
      }
    },
    [file, onContentChange],
  );

  const handleRichTextChange = useCallback(
    (next: { markdown: string; richContent: RichTextDocument }) => {
      if (file) {
        onContentChange(file.id, next.markdown, {
          richContent: next.richContent,
          preferredEditorMode: "block",
        });
      }
    },
    [file, onContentChange],
  );

  if (!file) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#1e1e1e]">
        <div className="flex flex-col items-center justify-center text-center animate-in fade-in duration-700">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[1.8rem] border border-white/5 bg-black/20 shadow-[inset_0_1px_rgba(255,255,255,0.05),0_12px_40px_rgba(0,0,0,0.18)]">
            <FileText className="h-8 w-8 text-white/40" strokeWidth={1.5} />
          </div>
          <h3 className="text-base font-medium tracking-tight text-white/90">No note selected</h3>
          <p className="mt-2 max-w-[200px] text-[13px] leading-relaxed text-white/50">
            Select a note from the sidebar or press <kbd className="px-1.5 py-0.5 rounded-md bg-black/30 border border-white/10 font-mono text-[10px] mx-0.5">Alt + N</kbd> to create a new one.
          </p>
        </div>
      </div>
    );
  }

  const containerClass = "flex min-h-full flex-1 flex-col overflow-y-auto bg-[#1e1e1e]";
  const contentClass = "mx-auto w-full max-w-3xl px-4 pb-28 pt-5 sm:px-8 sm:py-8";

  if (editorMode === "block") {
    return (
      <div className={containerClass}>
        <RichTextEditor
          content={file.content}
          richContent={file.richContent}
          onChange={handleRichTextChange}
        />
      </div>
    );
  }

  // Raw mode
  return (
    <div className={containerClass}>
      <div className={contentClass}>
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={file.content}
            onChange={(e) => handleMarkdownChange(e.target.value)}
            onBlur={() => setIsEditing(false)}
            className="w-full min-h-[80vh] bg-transparent text-foreground/90 font-mono text-sm resize-none outline-hidden leading-relaxed"
            spellCheck={false}
          />
        ) : (
          <div onClick={() => setIsEditing(true)} className="min-h-[80vh] cursor-text">
            <MarkdownRenderer content={file.content} />
          </div>
        )}
      </div>
    </div>
  );
}
