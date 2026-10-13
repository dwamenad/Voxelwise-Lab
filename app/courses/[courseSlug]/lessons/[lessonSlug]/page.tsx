import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonPlayer } from "@/components/lesson/lesson-player";
import { courses, getAdjacentLessons, getLesson } from "@/lib/content/catalog";

export function generateStaticParams() {
  return courses.flatMap((course) =>
    course.modules.flatMap((module) =>
      module.lessons.map((lesson) => ({
        courseSlug: course.slug,
        lessonSlug: lesson.slug,
      }))
    )
  );
}

type LessonPageProps = {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
};

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { courseSlug, lessonSlug } = await params;
  const result = getLesson(courseSlug, lessonSlug);
  if (!result) return { title: "Lesson not found | Voxelwise Lab" };

  const { course, lesson } = result;
  const title = `${lesson.title} · ${course.shortTitle} | Voxelwise Lab`;
  const description = lesson.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      siteName: "Voxelwise Lab",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { courseSlug, lessonSlug } = await params;
  const result = getLesson(courseSlug, lessonSlug);
  if (!result) notFound();
  const adjacent = getAdjacentLessons(result.course, lessonSlug);
  return <LessonPlayer {...result} {...adjacent} />;
}
