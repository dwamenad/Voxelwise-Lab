import Link from "next/link";
import { ArrowUpRight, Clock3, Layers3 } from "lucide-react";
import type { Course } from "@/lib/types";
import { getLessonCount } from "@/lib/content/catalog";

export function CourseCard({ course, featured = false }: { course: Course; featured?: boolean }) {
  return (
    <article className={featured ? "course-row course-row--featured" : "course-row"} data-accent={course.accent}>
      <div className="course-row__index">{course.catalogNumber}</div>
      <div className="course-row__body">
        <div className="eyebrow-row">
          <span>{course.difficulty}</span>
          <span>{course.status === "available" ? "Full course" : "Curriculum preview"}</span>
        </div>
        <h3><Link href={`/courses/${course.slug}`}>{course.title}</Link></h3>
        <p>{course.description}</p>
        <div className="course-row__meta">
          <span><Clock3 size={16} />{course.duration}</span>
          <span><Layers3 size={16} />{course.modules.length} modules · {getLessonCount(course)} lessons</span>
        </div>
      </div>
      <Link className="course-row__arrow" href={`/courses/${course.slug}`} aria-label={`View ${course.title}`}><ArrowUpRight /></Link>
    </article>
  );
}

