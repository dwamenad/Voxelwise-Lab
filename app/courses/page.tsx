import type { Metadata } from "next";
import { CourseCard } from "@/components/course/course-card";
import { courses } from "@/lib/content/catalog";

export const metadata: Metadata = { title: "Courses", description: "Browse FSL Academy's self-paced fMRI analysis curriculum." };

export default function CoursesPage() {
  return <main className="page-shell courses-page">
    <header className="page-intro"><span className="eyebrow">Course catalog</span><h1>Build your analysis practice in a deliberate order.</h1><p>Begin with tools and data, then move from preprocessing to first-level and group inference. Full courses include reviewed written lessons; curriculum previews show what is in production.</p></header>
    <div className="catalog-filter" aria-label="Course overview"><span>6 courses</span><span>2 available now</span><span>4 curriculum previews</span></div>
    <div className="course-list">{courses.map((course) => <CourseCard course={course} key={course.id} />)}</div>
  </main>;
}
