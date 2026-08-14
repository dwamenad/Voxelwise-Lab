"use client";

import Link from "next/link";
import { Check, Play } from "lucide-react";
import type { Course } from "@/lib/types";
import { getAllLessons } from "@/lib/content/catalog";
import { calculateCourseProgress } from "@/lib/progress/store";
import { useProgress } from "@/components/progress-provider";
import { ProgressBar } from "@/components/progress-bar";

export function CourseActions({ course }: { course: Course }) {
  const { state, enroll } = useProgress();
  const isEnrolled = state.enrolledCourseSlugs.includes(course.slug);
  const progress = calculateCourseProgress(course, state.completedLessonIds);
  const lessons = getAllLessons(course);
  const firstIncomplete = lessons.find((lesson) => !state.completedLessonIds.includes(lesson.id)) ?? lessons[0];

  return (
    <div className="course-actions">
      {isEnrolled ? (
        <>
          <div className="course-actions__progress">
            <div><span>Your progress</span><strong>{progress}%</strong></div>
            <ProgressBar value={progress} />
          </div>
          {firstIncomplete && <Link className="button button--acid" href={`/courses/${course.slug}/lessons/${firstIncomplete.slug}`}><Play size={17} fill="currentColor" />{progress > 0 ? "Continue course" : "Start course"}</Link>}
        </>
      ) : (
        <button className="button button--acid" type="button" onClick={() => enroll(course.slug)}><Check size={18} />Add to my progress</button>
      )}
      <p>Saved privately in this browser. No account or payment required.</p>
    </div>
  );
}
