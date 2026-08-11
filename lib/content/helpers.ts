import type { Lesson, LessonBlock, VideoType } from "@/lib/types";
import { getVideoRelease } from "@/lib/content/video-release";

interface LearningLessonInput {
  id: string;
  slug: string;
  number: string;
  title: string;
  description: string;
  duration?: number;
  objectives: string[];
  conceptTitle: string;
  concept: string;
  explanation: string;
  task: string[];
  command?: string;
  expected?: { output: string; explanation: string };
  selfCheck: { question: string; answer: string };
  summary: string[];
  sourceLab: string;
  sourceSection: string;
  videoType?: VideoType;
  videoTitle?: string;
  image?: { src: string; alt: string; caption: string };
  troubleshooting?: { title: string; body: string; command?: string };
  callout?: { variant: "note" | "warning" | "quality-control" | "desktop"; title: string; body: string };
}

export function learningLesson(input: LearningLessonInput): Lesson {
  const videoType = input.videoType ?? "concept";
  const release = getVideoRelease(`${videoType === "walkthrough" ? "walkthrough" : "concept"}:${input.slug}`);
  const blocks: LessonBlock[] = [
    {
      type: "video",
      videoType,
      title: input.videoTitle ?? input.title,
      provider: release.provider,
      videoId: release.videoId,
      url: release.url,
      durationMinutes: Math.max(5, Math.round((input.duration ?? 20) * 0.35)),
      status: release.status,
      captionsPath: `/production/captions/${input.slug}.vtt`,
      transcript:
        "A reviewed transcript will appear here when this video is published. The complete written lesson below covers the same learning objectives.",
    },
    { type: "concept", title: input.conceptTitle, body: input.concept },
    { type: "text", body: input.explanation },
  ];

  if (input.image) blocks.push({ type: "image", ...input.image });
  if (input.callout) blocks.push({ type: "callout", ...input.callout });
  blocks.push({ type: "neurodesk-task", title: "Try this in Neurodesk", steps: input.task, command: input.command });
  if (input.command) {
    blocks.push({
      type: "command",
      command: input.command,
      language: "bash",
      explanation: "Run this command in the FSL-enabled terminal. Paths are case-sensitive; adapt the example path to your working directory.",
    });
  }
  if (input.expected) blocks.push({ type: "expected-output", title: "What you should see", ...input.expected });
  if (input.troubleshooting) blocks.push({ type: "troubleshooting", ...input.troubleshooting });
  blocks.push({ type: "self-check", ...input.selfCheck }, { type: "summary", points: input.summary });

  return {
    id: input.id,
    slug: input.slug,
    number: input.number,
    title: input.title,
    description: input.description,
    durationMinutes: input.duration ?? 20,
    objectives: input.objectives,
    blocks,
    production: {
      sourceLab: input.sourceLab,
      sourceSection: input.sourceSection,
      scientificReviewStatus: "pending",
      videoStatus: release.status,
      narrationScriptPath: `production/narration/${input.slug}.md`,
      videoStoryboardPath: `production/storyboards/${input.slug}.md`,
    },
  };
}

export function outlineLesson(
  id: string,
  slug: string,
  number: string,
  title: string,
  description: string,
  sourceLab: string,
): Lesson {
  return learningLesson({
    id,
    slug,
    number,
    title,
    description,
    duration: 15,
    objectives: [`Explain ${title.toLowerCase()} in an fMRI workflow`, "Identify the next practical quality-control step"],
    conceptTitle: title,
    concept: description,
    explanation:
      "This lesson outline is included in the course model so the curriculum can grow without changing routes or the lesson player. A scientifically reviewed walkthrough is in production.",
    task: ["Open Neurodesk beside this lesson.", "Locate the relevant FSL tool or output.", "Record one observation before continuing."],
    selfCheck: {
      question: `What is the main purpose of ${title.toLowerCase()}?`,
      answer: description,
    },
    summary: [description, "Inspect intermediate outputs before drawing conclusions."],
    sourceLab,
    sourceSection: title,
  });
}
