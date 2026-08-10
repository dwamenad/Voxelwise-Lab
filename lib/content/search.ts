import { courses, getAllLessons } from "@/lib/content/catalog";
import { glossaryTerms } from "@/lib/content/glossary";
import { troubleshootingArticles } from "@/lib/content/troubleshooting";

export interface SearchResult {
  id: string;
  type: "Course" | "Lesson" | "Glossary" | "Troubleshooting";
  title: string;
  description: string;
  href: string;
}

export function searchContent(query: string): SearchResult[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const results: SearchResult[] = [];
  for (const course of courses) {
    if (`${course.title} ${course.description} ${course.objectives.join(" ")}`.toLowerCase().includes(normalized)) {
      results.push({ id: course.id, type: "Course", title: course.title, description: course.description, href: `/courses/${course.slug}` });
    }
    for (const lesson of getAllLessons(course)) {
      const haystack = `${lesson.title} ${lesson.description} ${lesson.objectives.join(" ")} ${lesson.blocks
        .map((block) => JSON.stringify(block))
        .join(" ")}`.toLowerCase();
      if (haystack.includes(normalized)) {
        results.push({ id: lesson.id, type: "Lesson", title: lesson.title, description: `${course.shortTitle} · ${lesson.description}`, href: `/courses/${course.slug}/lessons/${lesson.slug}` });
      }
    }
  }
  for (const term of glossaryTerms) {
    if (`${term.term} ${term.definition}`.toLowerCase().includes(normalized)) {
      results.push({ id: `glossary-${term.slug}`, type: "Glossary", title: term.term, description: term.definition, href: `/glossary?q=${encodeURIComponent(term.term)}` });
    }
  }
  for (const article of troubleshootingArticles) {
    if (`${article.title} ${article.symptom} ${article.resolution} ${article.tags.join(" ")}`.toLowerCase().includes(normalized)) {
      results.push({ id: `trouble-${article.id}`, type: "Troubleshooting", title: article.title, description: article.resolution, href: `/troubleshooting?q=${encodeURIComponent(article.title)}` });
    }
  }
  const typeRank: Record<SearchResult["type"], number> = { Glossary: 0, Lesson: 1, Troubleshooting: 2, Course: 3 };
  return results
    .sort((a, b) => {
      const aExact = a.title.toLowerCase() === normalized ? 0 : 1;
      const bExact = b.title.toLowerCase() === normalized ? 0 : 1;
      return aExact - bExact || typeRank[a.type] - typeRank[b.type];
    })
    .slice(0, 40);
}
