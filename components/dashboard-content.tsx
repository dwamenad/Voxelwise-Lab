"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, RotateCcw } from "lucide-react";
import { courses, getLesson } from "@/lib/content/catalog";
import { calculateCourseProgress } from "@/lib/progress/store";
import { useProgress } from "@/components/progress-provider";
import { ProgressBar } from "@/components/progress-bar";
import { demoStudent } from "@/lib/config";

export function DashboardContent() {
  const { state, resetDemo } = useProgress();
  const enrolledCourses = courses.filter((course) => state.enrolledCourseSlugs.includes(course.slug));
  const lastViewed = state.lastViewed ? getLesson(state.lastViewed.courseSlug, state.lastViewed.lessonSlug) : undefined;
  const continueCourse = lastViewed?.course ?? enrolledCourses[0];
  const continueLesson = lastViewed?.lesson ?? continueCourse?.modules[0]?.lessons[0];
  const suggested = courses.find((course) => !state.enrolledCourseSlugs.includes(course.slug));

  return <main className="dashboard page-shell">
    <header className="dashboard__header"><div><span className="eyebrow">Student workspace</span><h1>Good to see you, {demoStudent.displayName.split(" ")[0]}.</h1><p>Pick up where you left off or review the work you have completed.</p></div><button className="reset-demo" type="button" onClick={resetDemo}><RotateCcw size={15} />Reset demo progress</button></header>
    {continueCourse && continueLesson ? <section className="continue-panel" data-accent={continueCourse.accent}>
      <div><span>Continue learning</span><h2>{continueCourse.title}</h2><p>Next: {continueLesson.title}</p></div>
      <div className="continue-panel__progress"><div><strong>{calculateCourseProgress(continueCourse, state.completedLessonIds)}%</strong><span>complete</span></div><ProgressBar value={calculateCourseProgress(continueCourse, state.completedLessonIds)} /></div>
      <Link className="button button--acid" href={`/courses/${continueCourse.slug}/lessons/${continueLesson.slug}`}>Continue <ArrowRight size={17} /></Link>
    </section> : <section className="empty-state"><BookOpen /><h2>Your course shelf is empty</h2><p>Enroll in a course to keep progress and resume the last lesson.</p><Link className="button button--dark" href="/courses">Browse courses</Link></section>}

    <section className="dashboard-section"><div className="section-heading section-heading--row"><div><span className="eyebrow">My courses</span><h2>Enrolled courses</h2></div><Link className="text-link" href="/courses">Find another course <ArrowRight size={15} /></Link></div>
      <div className="my-courses">{enrolledCourses.map((course) => {
        const progress = calculateCourseProgress(course, state.completedLessonIds);
        return <article key={course.id}><div className="my-courses__code">{course.catalogNumber}</div><div><span>{course.difficulty}</span><h3><Link href={`/courses/${course.slug}`}>{course.title}</Link></h3><ProgressBar value={progress} /><p>{progress}% complete</p></div><CheckCircle2 className={progress === 100 ? "is-complete" : ""} /></article>;
      })}</div>
    </section>

    {suggested && <section className="suggested-course"><div><span className="eyebrow">Suggested next</span><h2>{suggested.title}</h2><p>{suggested.description}</p></div><Link href={`/courses/${suggested.slug}`} className="button button--outline">View curriculum <ArrowRight size={17} /></Link></section>}
  </main>;
}
