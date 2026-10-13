import type { MetadataRoute } from "next";
import { courses, getAllLessons } from "@/lib/content/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://voxelwiselab.com";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/courses`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/tools`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/resources`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/glossary`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/troubleshooting`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const courseRoutes: MetadataRoute.Sitemap = courses.map((course) => ({
    url: `${baseUrl}/courses/${course.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const lessonRoutes: MetadataRoute.Sitemap = courses.flatMap((course) =>
    getAllLessons(course).map((lesson) => ({
      url: `${baseUrl}/courses/${course.slug}/lessons/${lesson.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
    }))
  );

  return [...staticRoutes, ...courseRoutes, ...lessonRoutes];
}
