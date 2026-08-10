import type { Course } from "@/lib/types";

export interface LocalProgressState {
  enrolledCourseSlugs: string[];
  completedLessonIds: string[];
  lastViewed?: { courseSlug: string; lessonSlug: string; viewedAt: string };
}

export const DEMO_PROGRESS: LocalProgressState = {
  enrolledCourseSlugs: ["fsl-neuroimaging-foundations", "first-level-fmri-analysis-feat"],
  completedLessonIds: [
    "foundations-what-is-fsl",
    "foundations-course-workflow",
    "foundations-neurodesk",
    "first-level-what-first-level-means",
    "first-level-what-is-a-glm",
    "first-level-experimental-timing-files",
    "first-level-what-is-an-ev",
    "first-level-hrf-and-convolution",
    "first-level-confound-regressors",
    "first-level-understanding-contrasts",
    "first-level-opening-feat",
  ],
  lastViewed: {
    courseSlug: "first-level-fmri-analysis-feat",
    lessonSlug: "configuring-data-tab",
    viewedAt: "2026-08-08T19:30:00.000Z",
  },
};

export function calculateCourseProgress(course: Course, completedLessonIds: string[]): number {
  const lessons = course.modules.flatMap((module) => module.lessons);
  if (lessons.length === 0) return 0;
  const completed = lessons.filter((lesson) => completedLessonIds.includes(lesson.id)).length;
  return Math.round((completed / lessons.length) * 100);
}

export function toggleLessonCompletion(state: LocalProgressState, lessonId: string, completed = true): LocalProgressState {
  const ids = new Set(state.completedLessonIds);
  if (completed) ids.add(lessonId);
  else ids.delete(lessonId);
  return { ...state, completedLessonIds: [...ids] };
}

export function enrollInCourse(state: LocalProgressState, courseSlug: string): LocalProgressState {
  return state.enrolledCourseSlugs.includes(courseSlug)
    ? state
    : { ...state, enrolledCourseSlugs: [...state.enrolledCourseSlugs, courseSlug] };
}

