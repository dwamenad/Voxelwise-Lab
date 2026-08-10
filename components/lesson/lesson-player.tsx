"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronLeft, ChevronRight, Circle, Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import type { Course, CourseModule, Lesson } from "@/lib/types";
import { BrandMark } from "@/components/ui/brand-mark";
import { LessonBlocks } from "@/components/lesson/lesson-blocks";
import { ProgressBar } from "@/components/progress-bar";
import { useProgress } from "@/components/progress-provider";
import { calculateCourseProgress } from "@/lib/progress/store";

interface LessonPlayerProps {
  course: Course;
  module: CourseModule;
  lesson: Lesson;
  previous?: Lesson;
  next?: Lesson;
}

export function LessonPlayer({ course, module, lesson, previous, next }: LessonPlayerProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOutlineOpen, setMobileOutlineOpen] = useState(false);
  const { state, markComplete, recordView, enroll } = useProgress();
  const complete = state.completedLessonIds.includes(lesson.id);
  const progress = calculateCourseProgress(course, state.completedLessonIds);
  const completedCount = useMemo(
    () => course.modules.flatMap((item) => item.lessons).filter((item) => state.completedLessonIds.includes(item.id)).length,
    [course, state.completedLessonIds],
  );
  const lessonCount = course.modules.reduce((sum, item) => sum + item.lessons.length, 0);

  useEffect(() => {
    enroll(course.slug);
    recordView(course.slug, lesson.slug);
  }, [course.slug, lesson.slug, enroll, recordView]);

  useEffect(() => {
    if (!window.matchMedia("(min-width: 901px)").matches) return;
    const activeLesson = document.querySelector<HTMLElement>(".desktop-sidebar-wrap a[aria-current='page']");
    window.requestAnimationFrame(() => activeLesson?.scrollIntoView({ block: "center" }));
  }, [lesson.id]);

  function completeAndContinue() {
    markComplete(lesson.id, true);
  }

  const sidebar = (
    <aside className="lesson-sidebar" aria-label="Course outline">
      <div className="lesson-sidebar__head"><span>Course outline</span><button type="button" onClick={() => setMobileOutlineOpen(false)} aria-label="Close course outline"><X size={18} /></button></div>
      <div className="lesson-sidebar__scroll">
        {course.modules.map((courseModule) => (
          <section key={courseModule.id} className="sidebar-module">
            <div><span>Module {courseModule.number}</span><h2>{courseModule.title}</h2></div>
            <ol>
              {courseModule.lessons.map((item) => {
                const itemComplete = state.completedLessonIds.includes(item.id);
                const current = item.id === lesson.id;
                return <li key={item.id}><Link aria-current={current ? "page" : undefined} className={current ? "is-current" : undefined} href={`/courses/${course.slug}/lessons/${item.slug}`} onClick={() => setMobileOutlineOpen(false)}>{itemComplete ? <CheckCircle2 size={17} /> : current ? <span className="current-dot" /> : <Circle size={16} />}<span><small>{item.number}</small>{item.title}</span></Link></li>;
              })}
            </ol>
          </section>
        ))}
      </div>
    </aside>
  );

  return (
    <div className={`lesson-shell ${sidebarOpen ? "" : "lesson-shell--collapsed"}`}>
      <header className="lesson-topbar">
        <div className="lesson-topbar__brand">
          <Link href="/" aria-label="FSL Academy home"><BrandMark className="h-8 w-8 text-[var(--ink)]" /></Link>
          <span />
          <Link href={`/courses/${course.slug}`}>{course.shortTitle}</Link>
        </div>
        <div className="lesson-topbar__progress"><span>{completedCount} of {lessonCount} lessons</span><ProgressBar value={progress} /><strong>{progress}%</strong></div>
        <button className="mobile-outline-button" type="button" onClick={() => setMobileOutlineOpen(true)}><Menu size={18} />Outline</button>
      </header>
      <div className="lesson-workspace">
        <div className="desktop-sidebar-wrap">{sidebar}</div>
        <button className="sidebar-toggle" type="button" onClick={() => setSidebarOpen((value) => !value)} aria-label={sidebarOpen ? "Collapse course outline" : "Expand course outline"}>{sidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}</button>
        {mobileOutlineOpen && <div className="mobile-outline"><button type="button" className="mobile-outline__scrim" aria-label="Close course outline" onClick={() => setMobileOutlineOpen(false)} />{sidebar}</div>}
        <main className="lesson-main">
          <div className="lesson-main__inner">
            <nav className="lesson-breadcrumb" aria-label="Lesson breadcrumb"><Link href={`/courses/${course.slug}`}>Course</Link><ChevronRight size={14} /><span>Module {module.number}</span></nav>
            <header className="lesson-heading" id="lesson-content">
              <div className="eyebrow-row"><span>{lesson.number}</span><span>{lesson.durationMinutes} min</span></div>
              <h1>{lesson.title}</h1>
              <p>{lesson.description}</p>
              <div className="lesson-objectives"><span>By the end, you can</span><ul>{lesson.objectives.map((objective) => <li key={objective}><Check size={16} />{objective}</li>)}</ul></div>
            </header>
            <LessonBlocks blocks={lesson.blocks} />
            <section className="lesson-complete-panel">
              <div>{complete ? <CheckCircle2 /> : <Circle />}<div><h2>{complete ? "Lesson complete" : "Ready to continue?"}</h2><p>Completion is manual so progress reflects your practical work—not video playback.</p></div></div>
              <button className={complete ? "button button--outline" : "button button--acid"} type="button" onClick={() => markComplete(lesson.id, !complete)}>{complete ? "Mark incomplete" : "Mark complete"}</button>
            </section>
            <nav className="lesson-pagination" aria-label="Lesson navigation">
              {previous ? <Link href={`/courses/${course.slug}/lessons/${previous.slug}`}><ChevronLeft /><span><small>Previous</small>{previous.title}</span></Link> : <Link href={`/courses/${course.slug}`}><ChevronLeft /><span><small>Back to</small>Course overview</span></Link>}
              {next ? <Link href={`/courses/${course.slug}/lessons/${next.slug}`} onClick={completeAndContinue}><span><small>Next lesson</small>{next.title}</span><ChevronRight /></Link> : <Link href={`/courses/${course.slug}`} onClick={completeAndContinue}><span><small>Course</small>Return to overview</span><ChevronRight /></Link>}
            </nav>
          </div>
        </main>
        <aside className="lesson-context">
          <div><span>In this lesson</span><a href="#lesson-content">Overview</a><a href="#practice">Practice</a><a href="#summary">Summary</a></div>
          <div className="neurodesk-presence"><span><span className="presence-dot" />Neurodesk</span><p>Keep your FSL terminal open beside this lesson.</p></div>
        </aside>
      </div>
      <div className="mobile-lesson-nav">
        {previous ? <Link href={`/courses/${course.slug}/lessons/${previous.slug}`} aria-label="Previous lesson"><ArrowLeft /></Link> : <span />}
        <button type="button" onClick={() => markComplete(lesson.id, !complete)}>{complete ? <CheckCircle2 /> : <Circle />}{complete ? "Completed" : "Mark complete"}</button>
        {next ? <Link href={`/courses/${course.slug}/lessons/${next.slug}`} onClick={completeAndContinue} aria-label="Next lesson"><ArrowRight /></Link> : <span />}
      </div>
    </div>
  );
}
