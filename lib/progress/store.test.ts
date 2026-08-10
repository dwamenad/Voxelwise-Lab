import { describe, expect, it } from "vitest";
import { getCourse } from "@/lib/content/catalog";
import { calculateCourseProgress, enrollInCourse, toggleLessonCompletion, type LocalProgressState } from "@/lib/progress/store";

const empty: LocalProgressState = { enrolledCourseSlugs: [], completedLessonIds: [] };

describe("enrollment and progress", () => {
  it("enrolls once", () => {
    const first = enrollInCourse(empty, "fsl-neuroimaging-foundations");
    const second = enrollInCourse(first, "fsl-neuroimaging-foundations");
    expect(second.enrolledCourseSlugs).toEqual(["fsl-neuroimaging-foundations"]);
  });

  it("adds and removes manual lesson completion", () => {
    const completed = toggleLessonCompletion(empty, "lesson-1", true);
    expect(completed.completedLessonIds).toContain("lesson-1");
    expect(toggleLessonCompletion(completed, "lesson-1", false).completedLessonIds).toEqual([]);
  });

  it("calculates rounded course completion", () => {
    const course = getCourse("fsl-neuroimaging-foundations")!;
    const lessons = course.modules.flatMap((module) => module.lessons);
    expect(calculateCourseProgress(course, lessons.slice(0, 3).map((lesson) => lesson.id))).toBe(27);
    expect(calculateCourseProgress(course, lessons.map((lesson) => lesson.id))).toBe(100);
  });
});

