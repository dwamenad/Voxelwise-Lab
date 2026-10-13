"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  CheckCircle2,
  Download,
  FileText,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { courses, getLesson } from "@/lib/content/catalog";
import { calculateCourseProgress } from "@/lib/progress/store";
import { useProgress } from "@/components/progress-provider";
import { ProgressBar } from "@/components/progress-bar";
import {
  deleteNote,
  exportNotesAsMarkdown,
} from "@/lib/notes/store";
import { useNotebook } from "@/lib/notes/use-notebook";

export function DashboardContent() {
  const { state, resetProgress } = useProgress();
  const { bookmarks, notes } = useNotebook();
  const [storageError, setStorageError] = useState("");

  const enrolledCourses = courses.filter((course) =>
    state.enrolledCourseSlugs.includes(course.slug)
  );
  const lastViewed = state.lastViewed
    ? getLesson(state.lastViewed.courseSlug, state.lastViewed.lessonSlug)
    : undefined;
  const continueCourse = lastViewed?.course ?? enrolledCourses[0];
  const continueLesson = lastViewed?.lesson ?? continueCourse?.modules[0]?.lessons[0];
  const suggested = courses.find(
    (course) => !state.enrolledCourseSlugs.includes(course.slug)
  );

  function handleDeleteNote(id: string) {
    try {
      deleteNote(id);
      setStorageError("");
    } catch {
      setStorageError("Could not delete this note from browser storage. It has been kept; please retry.");
    }
  }

  function handleExportNotes() {
    const md = exportNotesAsMarkdown();
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `voxelwise-notes-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="dashboard page-shell space-y-8">
      <header className="dashboard__header">
        <div>
          <span className="eyebrow">Private learning shelf</span>
          <h1>Keep your progress close.</h1>
          <p>Progress, bookmarks, and notes are saved only in this browser. No account required.</p>
        </div>
        <button className="reset-progress" type="button" onClick={resetProgress}>
          <RotateCcw size={15} /> Reset local progress
        </button>
      </header>
      {storageError && <p role="alert" className="text-sm text-[var(--danger)]">{storageError}</p>}

      {continueCourse && continueLesson ? (
        <section className="continue-panel" data-accent={continueCourse.accent}>
          <div>
            <span>Continue learning</span>
            <h2>{continueCourse.title}</h2>
            <p>Next: {continueLesson.title}</p>
          </div>
          <div className="continue-panel__progress">
            <div>
              <strong>
                {calculateCourseProgress(continueCourse, state.completedLessonIds)}%
              </strong>
              <span>complete</span>
            </div>
            <ProgressBar
              value={calculateCourseProgress(continueCourse, state.completedLessonIds)}
            />
          </div>
          <Link
            className="button button--acid"
            href={`/courses/${continueCourse.slug}/lessons/${continueLesson.slug}`}
          >
            Continue <ArrowRight size={17} />
          </Link>
        </section>
      ) : (
        <section className="empty-state">
          <BookOpen />
          <h2>Your course shelf is empty</h2>
          <p>Add a course to keep progress and resume the last lesson on this device.</p>
          <Link className="button button--dark" href="/courses">
            Browse courses
          </Link>
        </section>
      )}

      {/* Enrolled Courses */}
      <section className="dashboard-section">
        <div className="section-heading section-heading--row">
          <div>
            <span className="eyebrow">My courses</span>
            <h2>Enrolled courses</h2>
          </div>
          <Link className="text-link" href="/courses">
            Find another course <ArrowRight size={15} />
          </Link>
        </div>
        <div className="my-courses">
          {enrolledCourses.map((course) => {
            const progress = calculateCourseProgress(course, state.completedLessonIds);
            return (
              <article key={course.id}>
                <div className="my-courses__code">{course.catalogNumber}</div>
                <div>
                  <span>{course.difficulty}</span>
                  <h3>
                    <Link href={`/courses/${course.slug}`}>{course.title}</Link>
                  </h3>
                  <ProgressBar value={progress} />
                  <p>{progress}% complete</p>
                </div>
                <CheckCircle2 className={progress === 100 ? "is-complete" : ""} />
              </article>
            );
          })}
        </div>
      </section>

      {/* Bookmarks Section */}
      {bookmarks.length > 0 && (
        <section className="dashboard-section">
          <div className="section-heading">
            <span className="eyebrow">Bookmarks</span>
            <h2>Saved Lessons ({bookmarks.length})</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {bookmarks.map((bm) => (
              <Link
                key={bm.id}
                href={`/courses/${bm.courseSlug}/lessons/${bm.lessonSlug}`}
                className="p-4 bg-[var(--surface-sunken)] rounded-xl border border-[var(--border)] hover:border-[var(--accent)] transition-all flex flex-col justify-between group"
              >
                <div>
                  <span className="text-xs text-[var(--muted)] flex items-center gap-1 mb-1">
                    <Bookmark size={13} className="text-[var(--warning)] fill-amber-500" />
                    {bm.courseTitle}
                  </span>
                  <h4 className="font-semibold text-sm text-[var(--ink)] group-hover:text-[var(--accent)]">
                    {bm.lessonTitle}
                  </h4>
                </div>
                <span className="text-xs text-[var(--ink-secondary)] mt-3 flex items-center gap-1 font-medium">
                  Resume lesson <ArrowRight size={13} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Personal Notes Section */}
      {notes.length > 0 && (
        <section className="dashboard-section">
          <div className="section-heading section-heading--row">
            <div>
              <span className="eyebrow">Notebook</span>
              <h2>Personal Study Notes ({notes.length})</h2>
            </div>
            <button
              type="button"
              onClick={handleExportNotes}
              className="text-link flex items-center gap-1.5"
            >
              <Download size={15} /> Export notes (.md)
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-4 bg-[var(--surface-sunken)] rounded-xl border border-[var(--border)] flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1">
                    <Link
                      href={`/courses/${note.courseSlug}/lessons/${note.lessonSlug}`}
                      className="font-medium text-[var(--accent)] hover:underline truncate max-w-[200px]"
                    >
                      {note.lessonTitle}
                    </Link>
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-[var(--ink)] whitespace-pre-wrap">{note.content}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]/50 text-xs">
                  <Link
                    href={`/courses/${note.courseSlug}/lessons/${note.lessonSlug}`}
                    className="text-[var(--ink-secondary)] hover:text-[var(--ink)] flex items-center gap-1"
                  >
                    <FileText size={13} /> Open in lesson
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-[var(--muted)] hover:text-[var(--danger)]"
                    title="Delete note"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {suggested && (
        <section className="suggested-course">
          <div>
            <span className="eyebrow">Suggested next</span>
            <h2>{suggested.title}</h2>
            <p>{suggested.description}</p>
          </div>
          <Link href={`/courses/${suggested.slug}`} className="button button--outline">
            View curriculum <ArrowRight size={17} />
          </Link>
        </section>
      )}
    </main>
  );
}
