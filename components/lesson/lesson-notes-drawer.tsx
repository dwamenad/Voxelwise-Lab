"use client";

import { useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  FileText,
  Plus,
  Trash2,
  X,
  Download,
  Check,
} from "lucide-react";
import { useNotebook } from "@/lib/notes/use-notebook";
import {
  saveNote,
  deleteNote,
  toggleBookmark,
  exportNotesAsMarkdown,
} from "@/lib/notes/store";

interface LessonNotesDrawerProps {
  lessonId: string;
  courseSlug: string;
  lessonSlug: string;
  lessonTitle: string;
  courseTitle: string;
}

export function LessonNotesDrawer({
  lessonId,
  courseSlug,
  lessonSlug,
  lessonTitle,
  courseTitle,
}: LessonNotesDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const notebook = useNotebook();
  const bookmarked = notebook.bookmarks.some((bookmark) => bookmark.lessonId === lessonId);
  const notes = notebook.notes.filter((note) => note.lessonId === lessonId);
  const [storageError, setStorageError] = useState("");
  const [newContent, setNewContent] = useState("");
  const [timestampSec, setTimestampSec] = useState<number | undefined>(undefined);
  const [copiedExport, setCopiedExport] = useState(false);

  function handleBookmarkToggle() {
    try {
      toggleBookmark({
        lessonId,
        courseSlug,
        lessonSlug,
        lessonTitle,
        courseTitle,
      });
      setStorageError("");
    } catch (error) {
      setStorageError(error instanceof Error ? error.message : "Could not save your bookmark. Please retry.");
    }
  }

  function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      saveNote({
        lessonId,
        courseSlug,
        lessonSlug,
        lessonTitle,
        content: newContent.trim(),
        timestampSeconds: timestampSec,
      });
      setStorageError("");
      setNewContent("");
      setTimestampSec(undefined);
    } catch (error) {
      setStorageError(`${error instanceof Error ? error.message : "Could not save your note."} Your draft has been kept.`);
    }
  }

  function handleDeleteNote(noteId: string) {
    try {
      deleteNote(noteId);
      setStorageError("");
    } catch {
      setStorageError("Could not delete this note from browser storage. It has been kept; please retry.");
    }
  }

  function handleExport() {
    const md = exportNotesAsMarkdown();
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `voxelwise-notes-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Bookmark button */}
        <button
          type="button"
          className={`notebook-bookmark-button flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
            bookmarked
              ? "bg-[var(--accent)]/15 border-[var(--accent)] text-[var(--ink)]"
              : "bg-[var(--surface-sunken)] border-[var(--border)] text-[var(--ink-secondary)] hover:text-[var(--ink)]"
          }`}
          onClick={handleBookmarkToggle}
          aria-label={bookmarked ? "Bookmarked" : "Bookmark"}
          aria-pressed={bookmarked}
          title={bookmarked ? "Bookmarked" : "Bookmark this lesson"}
        >
          {bookmarked ? (
            <>
              <BookmarkCheck size={14} className="text-[var(--warning)] fill-amber-500" />
              <span className="notebook-bookmark-label">Bookmarked</span>
            </>
          ) : (
            <>
              <Bookmark size={14} />
              <span className="notebook-bookmark-label">Bookmark</span>
            </>
          )}
        </button>

        {/* Notes drawer trigger */}
        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-sunken)] text-xs font-semibold text-[var(--ink-secondary)] hover:text-[var(--ink)] transition-colors"
          onClick={() => setIsOpen(true)}
        >
          <FileText size={14} />
          <span>Notes</span>
          {notes.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-[var(--acid)] text-[var(--on-accent)] font-mono text-[10px] flex items-center justify-center font-bold">
              {notes.length}
            </span>
          )}
        </button>
      </div>

      {storageError && !isOpen && <p role="alert" className="text-xs text-[var(--danger)]">{storageError}</p>}

      {/* Drawer overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-[var(--surface)] h-full shadow-2xl border-l border-[var(--border)] flex flex-col animate-in slide-in-from-right duration-200"
            role="dialog"
            aria-label="Personal Lesson Notes"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[var(--accent)] uppercase tracking-wider block">
                  Study Notebook
                </span>
                <h3 className="font-bold text-base text-[var(--ink)] truncate max-w-[280px]">
                  {lessonTitle}
                </h3>
              </div>
              <button
                type="button"
                className="p-1 rounded-md text-[var(--muted)] hover:text-[var(--ink)]"
                onClick={() => setIsOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Note Creation Form */}
            <form onSubmit={handleAddNote} className="p-4 border-b border-[var(--border)] space-y-3 bg-[var(--surface-sunken)]">
              <textarea
                aria-label="New study note"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Record personal notes, command parameters to remember, or questions..."
                className="w-full h-24 p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm text-[var(--ink)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--accent)] resize-none"
              />
              {storageError && <p role="alert" className="text-xs text-[var(--danger)]">{storageError}</p>}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--muted)]">
                  Stored privately on your device.
                </span>
                <button
                  type="submit"
                  disabled={!newContent.trim()}
                  className="button button--acid text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  <Plus size={14} /> Save Note
                </button>
              </div>
            </form>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notes.length === 0 ? (
                <div className="text-center py-12 text-[var(--muted)] space-y-2">
                  <FileText size={32} className="mx-auto opacity-40" />
                  <p className="text-sm">No notes recorded for this lesson yet.</p>
                  <p className="text-xs">Type your insights above to save them locally.</p>
                </div>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 bg-[var(--surface-sunken)] rounded-lg border border-[var(--border)] space-y-2 relative group"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
                      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                      <button
                        type="button"
                        className="text-[var(--muted)] hover:text-[var(--danger)] opacity-60 hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteNote(note.id)}
                        title="Delete note"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <p className="text-sm text-[var(--ink)] whitespace-pre-wrap">{note.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[var(--border)] flex items-center justify-between bg-[var(--surface-sunken)]">
              <button
                type="button"
                className="text-xs text-[var(--ink-secondary)] hover:text-[var(--ink)] flex items-center gap-1.5 font-medium"
                onClick={handleExport}
              >
                {copiedExport ? <Check size={14} className="text-[var(--success)]" /> : <Download size={14} />}
                <span>{copiedExport ? "Exported!" : "Export All Notes (.md)"}</span>
              </button>
              <button
                type="button"
                className="button button--outline text-xs py-1 px-3"
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
