import { firstLevelCourse } from "@/lib/content/first-level";
import { foundationsCourse } from "@/lib/content/foundations";
import { preprocessingCourse } from "@/lib/content/preprocessing";
import { higherLevelCourse } from "@/lib/content/higher-level";
import { roiCourse } from "@/lib/content/roi";
import { ppiIcaCourse } from "@/lib/content/ppi-ica";
import type { Course, CourseModule, Lesson } from "@/lib/types";

export {
  foundationsCourse,
  preprocessingCourse,
  firstLevelCourse,
  higherLevelCourse,
  roiCourse,
  ppiIcaCourse,
};

export const courses: Course[] = [
  foundationsCourse,
  preprocessingCourse,
  firstLevelCourse,
  higherLevelCourse,
  roiCourse,
  ppiIcaCourse,
];

export function getCourse(courseSlug: string): Course | undefined {
  return courses.find((course) => course.slug === courseSlug);
}

export function getLesson(
  courseSlug: string,
  lessonSlug: string
): { course: Course; lesson: Lesson; module: CourseModule } | undefined {
  const course = getCourse(courseSlug);
  if (!course) return undefined;
  for (const courseModule of course.modules) {
    const lesson = courseModule.lessons.find((item) => item.slug === lessonSlug);
    if (lesson) return { course, lesson, module: courseModule };
  }
  return undefined;
}

export function getAllLessons(course: Course): Lesson[] {
  return course.modules.flatMap((module) => module.lessons);
}

export function getAdjacentLessons(
  course: Course,
  lessonSlug: string
): { previous?: Lesson; next?: Lesson } {
  const lessons = getAllLessons(course);
  const index = lessons.findIndex((lesson) => lesson.slug === lessonSlug);
  return {
    previous: index > 0 ? lessons[index - 1] : undefined,
    next: index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : undefined,
  };
}

export function getLessonCount(course: Course): number {
  return getAllLessons(course).length;
}
