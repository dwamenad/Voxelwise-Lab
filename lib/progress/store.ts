import type { Course } from "@/lib/types";

export interface LocalProgressState {
  enrolledCourseSlugs: string[];
  completedLessonIds: string[];
  lastViewed?: { courseSlug: string; lessonSlug: string; viewedAt: string };
}

export const DEFAULT_PROGRESS: LocalProgressState = {
  enrolledCourseSlugs: [],
  completedLessonIds: [],
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
