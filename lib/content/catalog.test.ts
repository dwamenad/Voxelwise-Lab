import { describe, expect, it } from "vitest";
import { courses, getAllLessons, getCourse, getLesson } from "@/lib/content/catalog";

describe("course catalog", () => {
  it("loads all six requested courses", () => {
    expect(courses).toHaveLength(6);
    expect(courses.filter((course) => course.status === "available").map((course) => course.slug)).toEqual([
      "fsl-neuroimaging-foundations",
      "first-level-fmri-analysis-feat",
    ]);
  });

  it("resolves course and lesson routes from slugs", () => {
    expect(getCourse("fsl-neuroimaging-foundations")?.title).toBe("FSL & Neuroimaging Foundations");
    const route = getLesson("first-level-fmri-analysis-feat", "understanding-contrasts");
    expect(route?.lesson.title).toBe("Understanding contrasts");
    expect(route?.module.number).toBe(7);
  });

  it("keeps lesson slugs and ids unique", () => {
    const lessons = courses.flatMap(getAllLessons);
    expect(new Set(lessons.map((lesson) => lesson.id)).size).toBe(lessons.length);
    for (const course of courses) {
      const courseLessons = getAllLessons(course);
      expect(new Set(courseLessons.map((lesson) => lesson.slug)).size).toBe(courseLessons.length);
    }
  });

  it("provides accessible video metadata", () => {
    const videos = courses.flatMap(getAllLessons).flatMap((lesson) => lesson.blocks.filter((block) => block.type === "video"));
    expect(videos.length).toBeGreaterThan(20);
    for (const video of videos) {
      if (video.type !== "video") continue;
      expect(video.transcript.length).toBeGreaterThan(20);
      expect(video.durationMinutes).toBeGreaterThan(0);
      expect(video.provider).toBeTruthy();
    }
  });
});

