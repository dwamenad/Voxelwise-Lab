import { describe, expect, it, beforeEach } from "vitest";
import {
  getAllNotes,
  saveNote,
  deleteNote,
  getBookmarks,
  toggleBookmark,
  exportNotesAsMarkdown,
} from "@/lib/notes/store";

describe("personal notes and bookmarks store", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }
  });

  it("saves and retrieves notes anonymously", () => {
    const note = saveNote({
      lessonId: "test-lesson-1",
      courseSlug: "fmri-preprocessing-fsl",
      lessonSlug: "motion-correction-with-mcflirt",
      lessonTitle: "Motion Correction with MCFLIRT",
      content: "Remember: MCFLIRT uses 6 DOF rigid body realignment.",
      timestampSeconds: 125,
    });

    expect(note.id).toBeTruthy();
    expect(note.content).toContain("6 DOF");

    const all = getAllNotes();
    expect(all.length).toBeGreaterThanOrEqual(1);

    deleteNote(note.id);
    expect(getAllNotes().some((n) => n.id === note.id)).toBe(false);
  });

  it("toggles bookmarks cleanly", () => {
    const isBookmarked = toggleBookmark({
      lessonId: "lesson-bm-1",
      courseSlug: "roi-analysis-fsl",
      lessonSlug: "avoiding-circularity",
      lessonTitle: "Avoiding Circularity",
      courseTitle: "ROI Analysis with FSL",
    });

    expect(isBookmarked).toBe(true);
    expect(getBookmarks().some((b) => b.lessonId === "lesson-bm-1")).toBe(true);

    const toggledOff = toggleBookmark({
      lessonId: "lesson-bm-1",
      courseSlug: "roi-analysis-fsl",
      lessonSlug: "avoiding-circularity",
      lessonTitle: "Avoiding Circularity",
      courseTitle: "ROI Analysis with FSL",
    });
    expect(toggledOff).toBe(false);
  });

  it("exports formatted markdown notes", () => {
    saveNote({
      lessonId: "test-export-1",
      courseSlug: "ppi-and-ica",
      lessonSlug: "the-three-ppi-terms",
      lessonTitle: "The Three PPI Terms",
      content: "Phys, Psych, and PPI interaction term.",
    });

    const markdown = exportNotesAsMarkdown();
    expect(markdown).toContain("# My Voxelwise Lab Study Notes");
    expect(markdown).toContain("The Three PPI Terms");
  });
});
