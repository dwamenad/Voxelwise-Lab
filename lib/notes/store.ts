import type { UserNote, UserBookmark } from "@/lib/types";

const NOTES_KEY = "voxelwise_notes";
const BOOKMARKS_KEY = "voxelwise_bookmarks";

function getStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error("Failed to save to localStorage:", err);
  }
}

export function getAllNotes(): UserNote[] {
  return getStorage<UserNote[]>(NOTES_KEY, []);
}

export function getNotesForLesson(lessonId: string): UserNote[] {
  return getAllNotes().filter((n) => n.lessonId === lessonId);
}

export function saveNote(
  noteInput: Omit<UserNote, "id" | "createdAt" | "updatedAt"> & { id?: string }
): UserNote {
  const notes = getAllNotes();
  const now = new Date().toISOString();

  if (noteInput.id) {
    // Update existing note
    const updated = notes.map((n) =>
      n.id === noteInput.id
        ? {
            ...n,
            content: noteInput.content,
            timestampSeconds: noteInput.timestampSeconds,
            anchorBlockId: noteInput.anchorBlockId,
            updatedAt: now,
          }
        : n
    );
    setStorage(NOTES_KEY, updated);
    return updated.find((n) => n.id === noteInput.id)!;
  } else {
    // Create new note
    const newNote: UserNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      lessonId: noteInput.lessonId,
      courseSlug: noteInput.courseSlug,
      lessonSlug: noteInput.lessonSlug,
      lessonTitle: noteInput.lessonTitle,
      timestampSeconds: noteInput.timestampSeconds,
      anchorBlockId: noteInput.anchorBlockId,
      content: noteInput.content,
      createdAt: now,
      updatedAt: now,
    };
    setStorage(NOTES_KEY, [newNote, ...notes]);
    return newNote;
  }
}

export function deleteNote(id: string): void {
  const notes = getAllNotes().filter((n) => n.id !== id);
  setStorage(NOTES_KEY, notes);
}

export function getBookmarks(): UserBookmark[] {
  return getStorage<UserBookmark[]>(BOOKMARKS_KEY, []);
}

export function isLessonBookmarked(lessonId: string): boolean {
  return getBookmarks().some((b) => b.lessonId === lessonId);
}

export function toggleBookmark(
  item: Omit<UserBookmark, "id" | "createdAt">
): boolean {
  const bookmarks = getBookmarks();
  const exists = bookmarks.some((b) => b.lessonId === item.lessonId);
  if (exists) {
    setStorage(
      BOOKMARKS_KEY,
      bookmarks.filter((b) => b.lessonId !== item.lessonId)
    );
    return false;
  } else {
    const newBookmark: UserBookmark = {
      id: `bm-${Date.now()}`,
      lessonId: item.lessonId,
      courseSlug: item.courseSlug,
      lessonSlug: item.lessonSlug,
      lessonTitle: item.lessonTitle,
      courseTitle: item.courseTitle,
      createdAt: new Date().toISOString(),
    };
    setStorage(BOOKMARKS_KEY, [newBookmark, ...bookmarks]);
    return true;
  }
}

export function exportNotesAsMarkdown(): string {
  const notes = getAllNotes();
  if (notes.length === 0) return "# Voxelwise Lab Notes\n\nNo notes recorded yet.";

  let md = "# My Voxelwise Lab Study Notes\n\n";
  const groupedByCourse = new Map<string, UserNote[]>();

  for (const note of notes) {
    const list = groupedByCourse.get(note.courseSlug) || [];
    list.push(note);
    groupedByCourse.set(note.courseSlug, list);
  }

  groupedByCourse.forEach((courseNotes, courseSlug) => {
    md += `## Course: ${courseSlug}\n\n`;
    for (const note of courseNotes) {
      const timeStr =
        note.timestampSeconds !== undefined
          ? ` [Timestamp: ${Math.floor(note.timestampSeconds / 60)}:${(
              note.timestampSeconds % 60
            )
              .toString()
              .padStart(2, "0")}]`
          : "";
      md += `### ${note.lessonTitle}${timeStr}\n`;
      md += `*Saved on ${new Date(note.createdAt).toLocaleDateString()}*\n\n`;
      md += `${note.content}\n\n---\n\n`;
    }
  });

  return md;
}
