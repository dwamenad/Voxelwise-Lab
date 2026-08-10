"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Clock3, PlayCircle } from "lucide-react";
import type { Course } from "@/lib/types";
import { useProgress } from "@/components/progress-provider";

export function CourseCurriculum({ course }: { course: Course }) {
  const { state } = useProgress();
  return <div className="curriculum-list">{course.modules.map((module) => (
    <section key={module.id} className="curriculum-module">
      <header><div><span>Module {module.number}</span><h3>{module.title}</h3></div><span>{module.lessons.length} {module.lessons.length === 1 ? "lesson" : "lessons"}</span></header>
      <ol>{module.lessons.map((lesson) => {
        const complete = state.completedLessonIds.includes(lesson.id);
        return <li key={lesson.id}><Link href={`/courses/${course.slug}/lessons/${lesson.slug}`}>{complete ? <CheckCircle2 className="is-complete" /> : <Circle />}<span><small>{lesson.number}</small><strong>{lesson.title}</strong><em>{lesson.description}</em></span><span><Clock3 />{lesson.durationMinutes} min</span><PlayCircle /></Link></li>;
      })}</ol>
    </section>
  ))}</div>;
}

