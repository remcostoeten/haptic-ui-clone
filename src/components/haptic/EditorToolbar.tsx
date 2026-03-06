import { ChevronLeft, ChevronRight, Columns2, ZoomIn, Maximize, Code, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

export type EditorMode = 'markdown' | 'richtext';

interface EditorToolbarProps {
  fileName: string;
  breadcrumb?: string[];
  editorMode: EditorMode;
  onToggleSidebar: () => void;
  onToggleMetadata: () => void;
  onToggleEditorMode: () => void;
}

export function EditorToolbar({ 
  fileName, 
  breadcrumb, 
  editorMode,
  onToggleSidebar, 
  onToggleMetadata,
  onToggleEditorMode 
}: EditorToolbarProps) {
  return (
    <div className="h-11 flex items-center px-3 border-b border-haptic-divider bg-haptic-editor">
      {/* Left controls */}
      <div className="flex items-center gap-0.5">
        <button 
          onClick={onToggleSidebar}
          className="w-7 h-7 flex items-center justify-center rounded text-haptic-dim hover:text-foreground hover:bg-haptic-hover transition-colors"
        >
          <Columns2 className="w-4 h-4" strokeWidth={1.5} />
        </button>
        <button className="w-7 h-7 flex items-center justify-center rounded text-haptic-dim hover:text-foreground hover:bg-haptic-hover transition-colors">
          <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
        </button>
        <button className="w-7 h-7 flex items-center justify-center rounded text-haptic-dim hover:text-foreground hover:bg-haptic-hover transition-colors">
          <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      {/* Center - filename and mode toggle */}
      <div className="flex-1 flex items-center justify-center gap-3 text-sm">
        {breadcrumb && breadcrumb.length > 0 && (
          <>
            {breadcrumb.map((part, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className="text-haptic-dim">{part}</span>
                <ChevronRight className="w-3 h-3 text-haptic-dim" />
              </span>
            ))}
          </>
        )}
        <span className="text-foreground/80 font-medium">{fileName}</span>
        
        {/* Mode toggle */}
        <div className="flex items-center ml-2">
          <button
            onClick={onToggleEditorMode}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-colors",
              "border border-haptic-divider hover:bg-haptic-hover"
            )}
            title={editorMode === 'markdown' ? 'Switch to Rich Text' : 'Switch to Markdown'}
          >
            {editorMode === 'markdown' ? (
              <>
                <Code className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span className="text-haptic-dim">Markdown</span>
              </>
            ) : (
              <>
                <Type className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span className="text-haptic-dim">Rich Text</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-0.5">
        <button className="w-7 h-7 flex items-center justify-center rounded text-haptic-dim hover:text-foreground hover:bg-haptic-hover transition-colors">
          <Maximize className="w-4 h-4" strokeWidth={1.5} />
        </button>
        <button className="w-7 h-7 flex items-center justify-center rounded text-haptic-dim hover:text-foreground hover:bg-haptic-hover transition-colors">
          <ZoomIn className="w-4 h-4" strokeWidth={1.5} />
        </button>
        <button 
          onClick={onToggleMetadata}
          className="w-7 h-7 flex items-center justify-center rounded text-haptic-dim hover:text-foreground hover:bg-haptic-hover transition-colors"
        >
          <Columns2 className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
