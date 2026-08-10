import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Download, Laptop2, Layers3, LockKeyhole, Timer } from "lucide-react";
import { CourseActions } from "@/components/course/course-actions";
import { CourseCurriculum } from "@/components/course/course-curriculum";
import { courses, getCourse, getLessonCount } from "@/lib/content/catalog";

export function generateStaticParams() {
  return courses.map((course) => ({ courseSlug: course.slug }));
}

type CoursePageProps = { params: Promise<{ courseSlug: string }> };

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { courseSlug } = await params;
  const course = getCourse(courseSlug);
  return course ? { title: course.title, description: course.description } : { title: "Course not found" };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseSlug } = await params;
  const course = getCourse(courseSlug);
  if (!course) notFound();

  return <main className="course-detail">
    <section className="course-detail__hero" data-accent={course.accent}>
      <div className="course-detail__hero-inner">
        <Link href="/courses" className="back-link"><ArrowLeft size={16} />All courses</Link>
        <div className="course-detail__title">
          <div className="eyebrow-row"><span>{course.catalogNumber}</span><span>{course.difficulty}</span><span>{course.status === "available" ? "Full course" : "Curriculum preview"}</span></div>
          <h1>{course.title}</h1>
          <p>{course.description}</p>
          <div className="course-detail__facts"><span><Timer />{course.duration}</span><span><Layers3 />{course.modules.length} modules · {getLessonCount(course)} lessons</span><span><Laptop2 />Desktop lab</span></div>
        </div>
        <CourseActions course={course} />
      </div>
    </section>

    <div className="course-detail__body">
      <div className="course-detail__main">
        <section className="learning-objectives"><span className="eyebrow">Learning objectives</span><h2>What you will be able to do</h2><ul>{course.objectives.map((objective) => <li key={objective}><Check />{objective}</li>)}</ul></section>
        <section className="course-curriculum"><div className="section-heading section-heading--row"><div><span className="eyebrow">Curriculum</span><h2>Course outline</h2></div><span>{getLessonCount(course)} lessons</span></div><CourseCurriculum course={course} /></section>
      </div>
      <aside className="course-detail__aside">
        <section><h2>Before you begin</h2><h3>Prerequisites</h3><ul>{course.prerequisites.map((item) => <li key={item}><Check />{item}</li>)}</ul><h3>Software</h3><ul>{course.requirements.map((item) => <li key={item}><Check />{item}</li>)}</ul></section>
        <section><h2>Course resources</h2>{course.resources.map((resource) => <div className="resource-mini" key={resource.id}><Download /><div><strong>{resource.title}</strong><span>{resource.format}{resource.size ? ` · ${resource.size}` : ""}</span></div>{resource.available ? <a href={resource.href} target="_blank" rel="noreferrer">Open</a> : <LockKeyhole />}</div>)}</section>
        <section className="source-note"><span>Source curriculum</span><p>{course.sourceLabs.join(" · ")}</p><p>Adapted from TUBRIC under the MIT License. FSL Academy is not an official Temple University product.</p></section>
      </aside>
    </div>
  </main>;
}
