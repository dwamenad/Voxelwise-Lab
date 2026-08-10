import { build } from "esbuild";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();

const result = await build({
  absWorkingDir: projectRoot,
  entryPoints: ["lib/content/catalog.ts"],
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node20",
  write: false,
  plugins: [
    {
      name: "project-alias",
      setup(builder) {
        builder.onResolve({ filter: /^@\// }, (args) => ({
          path: `${path.join(projectRoot, args.path.slice(2))}.ts`,
        }));
      },
    },
  ],
});

const bundle = Buffer.from(result.outputFiles[0].contents).toString("base64");
const { courses } = await import(`data:text/javascript;base64,${bundle}`);

const eligibleCourses = new Set([
  "fsl-neuroimaging-foundations",
  "first-level-fmri-analysis-feat",
]);

const accentColors = {
  mint: "#79e6bf",
  amber: "#ffbf69",
};

const stripMarkdown = (value) =>
  value
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

const toSpoken = (value) =>
  stripMarkdown(value)
    .replace(/\bdot dot\b/gi, "dot dot")
    .replace(/\.\./g, "dot dot")
    .replace(/(^|\s)\.(?=\s|$)/g, "$1dot")
    .replace(/(^|\s)~(?=\s|$)/g, "$1tilde")
    .replace(/\.feat\b/gi, " dot feat")
    .replace(/\.fsf\b/gi, " dot F S F")
    .replace(/\bFSLEyes\b/g, "F S L Eyes")
    .replace(/\bfslinfo\b/gi, "F S L info")
    .replace(/\bfslstats\b/gi, "F S L stats")
    .replace(/\bfslmaths\b/gi, "F S L maths")
    .replace(/\bfslmeants\b/gi, "F S L means")
    .replace(/\bFSL\b/g, "F S L")
    .replace(/\bFMRIB\b/g, "F M R I B")
    .replace(/\bfMRI\b/g, "functional M R I")
    .replace(/\bMRI\b/g, "M R I")
    .replace(/\bHRF\b/g, "H R F")
    .replace(/\b4D\b/g, "four-D")
    .replace(/\b3D\b/g, "three-D")
    .replace(/mm³/g, "cubic millimetres")
    .replace(/→/g, "then")
    .replace(/×/g, "by")
    .replace(/\bEVs\b/g, "E V's")
    .replace(/\bEV\b/g, "E V")
    .replace(/\bGLM\b/g, "G L M")
    .replace(/\bBOLD\b/g, "bold")
    .replace(/\bTR\b/g, "T R")
    .replace(/\bQC\b/g, "quality control")
    .replace(/\s+/g, " ")
    .trim();

const sentence = (value) => {
  const cleaned = toSpoken(value);
  return /[.!?]$/.test(cleaned) ? cleaned : `${cleaned}.`;
};

const speakList = (items) => {
  const transitions = ["First", "Next", "Then", "After that", "Finally"];
  return items
    .map((item, index) => {
      const naturalCase = /^[A-Z][a-z]/.test(item) ? `${item[0].toLowerCase()}${item.slice(1)}` : item;
      return `${transitions[Math.min(index, transitions.length - 1)]}, ${sentence(naturalCase)}`;
    })
    .join(" ");
};

const compositionId = (slug) =>
  `Lesson${slug
    .split("-")
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join("")}`;

const makeStandardVideo = ({ course, module, lesson, videoBlock }) => {
  const concept = lesson.blocks.find((block) => block.type === "concept");
  const explanation = lesson.blocks.find((block) => block.type === "text");
  const task = lesson.blocks.find((block) => block.type === "neurodesk-task");
  const command = lesson.blocks.find((block) => block.type === "command");
  const expected = lesson.blocks.find((block) => block.type === "expected-output");
  const callout = lesson.blocks.find((block) => block.type === "callout");
  const troubleshooting = lesson.blocks.find((block) => block.type === "troubleshooting");
  const selfCheck = lesson.blocks.find((block) => block.type === "self-check");
  const summary = lesson.blocks.find((block) => block.type === "summary");
  const image = lesson.blocks.find((block) => block.type === "image");
  const objective = lesson.objectives[0] ?? lesson.description;
  const qualityText =
    callout?.body ??
    troubleshooting?.body ??
    expected?.explanation ??
    "Before interpreting the result, confirm that the input, operation, and output support the same scientific question.";

  return {
    slug: lesson.slug,
    compositionId: compositionId(lesson.slug),
    courseSlug: course.slug,
    courseTitle: course.title,
    courseLabel: course.shortTitle,
    catalogNumber: course.catalogNumber,
    moduleTitle: module.title,
    lessonNumber: lesson.number,
    title: videoBlock.title,
    description: lesson.description,
    videoType: videoBlock.videoType,
    accent: accentColors[course.accent] ?? "#79e6bf",
    voice: "Daniel",
    speechRate: 148,
    fps: 30,
    source: {
      repository: "tubric/2026s-fmri-class",
      file: lesson.production?.sourceLab ?? course.sourceLabs[0],
      section: lesson.production?.sourceSection ?? module.title,
      license: "MIT",
    },
    scenes: [
      {
        id: "opening",
        kind: "opening",
        display: {
          eyebrow: `${course.catalogNumber} · Concept video`,
          title: videoBlock.title,
          body: lesson.description,
          bullets: lesson.objectives.slice(0, 3),
        },
        narration: `${sentence(videoBlock.title)} ${sentence(lesson.description)} The goal is clear: ${sentence(objective)}`,
      },
      {
        id: "core-idea",
        kind: "explanation",
        display: {
          eyebrow: "Core idea",
          title: concept?.title ?? videoBlock.title,
          body: concept?.body ?? lesson.description,
          image: image?.src,
          imageCaption: image?.caption,
        },
        narration: `${sentence(concept?.title ?? videoBlock.title)} ${sentence(concept?.body ?? lesson.description)} ${sentence(explanation?.body ?? "Connect this idea to the input, operation, and output used in the workflow")}`,
      },
      {
        id: "observable-check",
        kind: image ? "evidence" : "practice",
        display: {
          eyebrow: "Connect concept to evidence",
          title: task?.title ?? "Make the idea observable",
          body: "Use a small, explicit check before drawing a scientific conclusion.",
          bullets: task?.steps.slice(0, 5) ?? lesson.objectives,
          code: command?.command,
          image: image?.src,
          imageCaption: image?.caption,
        },
        narration: `Now connect the idea to an observable check. ${speakList(task?.steps.slice(0, 5) ?? lesson.objectives)} ${command ? "The command shown on screen is an example. Adapt its path to your own working directory and verify the target before running it." : "Record what you observe so the decision remains reviewable."}`,
      },
      {
        id: "quality-control",
        kind: "quality-control",
        display: {
          eyebrow: callout?.title ?? troubleshooting?.title ?? "Quality-control question",
          title: "What would make this interpretation trustworthy?",
          body: qualityText,
          output: expected?.output,
          bullets: selfCheck ? [selfCheck.question, selfCheck.answer] : summary?.points,
        },
        narration: `${sentence(callout?.title ?? troubleshooting?.title ?? "Quality control comes before interpretation")} ${sentence(qualityText)} ${selfCheck ? `A useful self-check is this: ${sentence(selfCheck.question)} ${sentence(selfCheck.answer)}` : "A successful command or completed interface step is evidence of execution, not proof that the scientific result is valid."}`,
      },
      {
        id: "summary",
        kind: "summary",
        display: {
          eyebrow: "Take-away",
          title: "Carry the reasoning into the next step",
          body: objective,
          bullets: summary?.points ?? lesson.objectives,
        },
        narration: `To recap: ${speakList(summary?.points ?? lesson.objectives)} Before continuing, make sure you can explain this objective: ${sentence(objective)}`,
      },
    ],
  };
};

const makeReportQcVideo = ({ course, module, lesson, videoBlock }) => ({
  slug: "reviewing-complete-feat-report",
  compositionId: "LessonReviewingCompleteFeatReport",
  courseSlug: course.slug,
  courseTitle: course.title,
  courseLabel: course.shortTitle,
  catalogNumber: course.catalogNumber,
  moduleTitle: module.title,
  lessonNumber: lesson.number,
  title: videoBlock.title,
  description: "Review a completed FEAT report as an ordered chain of quality-control evidence.",
  videoType: "quality-control",
  accent: accentColors[course.accent],
  voice: "Daniel",
  speechRate: 148,
  fps: 30,
  source: {
    repository: "tubric/2026s-fmri-class",
    file: "Lab-3_FSL_Level1.md",
    section: "Viewing and QC'ing FEAT output",
    license: "MIT",
  },
  scenes: [
    {
      id: "opening",
      kind: "opening",
      display: { eyebrow: "FSL 301 · Quality-control video", title: "Reviewing a complete FEAT report", body: "Treat the report as a chain of evidence, not a gallery of activation maps." },
      narration: "A completed FEAT report is not automatically a valid analysis. It is a structured record that lets you review preprocessing, registration, model design, and statistical output in an evidence-based order. This video shows how to read that record before interpreting bright clusters or reporting a result.",
    },
    {
      id: "review-order",
      kind: "explanation",
      display: { eyebrow: "Review in order", title: "Inputs before inference", body: "Later results depend on every earlier stage.", bullets: ["Pre-stats: motion and preprocessing", "Registration: anatomical correspondence", "Stats: design matrix and contrasts", "Post-stats: thresholded inference"], image: "/curriculum/feat-report.png", imageCaption: "Real FEAT report captured in the adapted source curriculum." },
      narration: "Review the report in dependency order. Begin with Pre-stats and ask whether motion, masking, and preprocessing outputs are plausible. Continue to Registration and inspect alignment across the brain. Then examine the design matrix, explanatory variables, and contrasts under Stats. Only after those checks should you interpret thresholded results under Post-stats. A failure early in this chain limits what later pages can support.",
    },
    {
      id: "three-questions",
      kind: "evidence",
      display: { eyebrow: "Three defensible statements", title: "What did you actually check?", bullets: ["Motion: acceptable, concerning, or unusable—and why?", "Registration: where do boundaries agree or fail?", "Design: do timing, columns, and contrasts match the protocol?"], image: "/curriculum/feat-registration.png", imageCaption: "Registration evidence from the source workflow." },
      narration: "Write one defensible statement for each major dependency. For motion, describe the plot and any abrupt displacement rather than saying it looks fine. For registration, name anatomical boundaries and multiple slices that support a pass or concern. For the design, match columns to timing files and contrast arrows to the planned hypothesis. Specific observations are auditable; vague reassurance is not.",
    },
    {
      id: "results-last",
      kind: "quality-control",
      display: { eyebrow: "Results come last", title: "A z-statistic is not an effect size", body: "Interpret cope, uncertainty, standardized evidence, and thresholded display as related but different outputs.", bullets: ["cope: estimated contrast effect", "varcope: uncertainty", "t or z: standardized evidence", "thresholded map: inferential display"] },
      narration: "When you reach the results, keep the output types separate. A cope is the estimated contrast effect. A varcope describes uncertainty in that estimate. A t-statistic or z-statistic standardizes evidence relative to uncertainty. A thresholded map displays locations surviving the chosen inferential procedure. Do not describe a z-statistic map as an effect-size map, and do not let an attractive cluster override failed motion, registration, or design checks.",
    },
    {
      id: "summary",
      kind: "summary",
      display: { eyebrow: "Document the decision", title: "Pass, concern, or fail—with evidence", body: "A complete analysis includes a written QC judgment, not only a dot feat directory.", bullets: ["Name the evidence reviewed", "Record concerns and their likely impact", "Link conclusions to the approved analysis plan", "Preserve the report and design"] },
      narration: "Finish with an explicit quality-control decision: pass, concern, or fail, followed by the evidence that supports it. Record any limitation and explain how it affects interpretation. Preserve the report, design files, and notes together. The purpose of review is not to prove that FEAT completed. It is to decide whether this run can support the scientific claim you intend to make.",
    },
  ],
});

const videos = [];

for (const course of courses.filter((item) => eligibleCourses.has(item.slug))) {
  for (const courseModule of course.modules) {
    for (const lesson of courseModule.lessons) {
      for (const videoBlock of lesson.blocks.filter((block) => block.type === "video")) {
        if (videoBlock.videoType === "concept" && lesson.slug !== "understanding-contrasts") {
          videos.push(makeStandardVideo({ course, module: courseModule, lesson, videoBlock }));
        }
        if (videoBlock.videoType === "quality-control") {
          videos.push(makeReportQcVideo({ course, module: courseModule, lesson, videoBlock }));
        }
      }
    }
  }
}

const library = {
  version: 1,
  productionVoice: { voice: "Daniel", accent: "UK English", cadence: "deliberate", speechRate: 148 },
  selection: {
    courses: [...eligibleCourses],
    includedTypes: ["concept", "quality-control"],
    excludedSlug: "understanding-contrasts",
    reason: "Builds source-grounded videos that do not require a live Neurodesk session.",
  },
  videos,
};

await writeFile(
  path.join(projectRoot, "production", "video", "content", "concept-library.json"),
  `${JSON.stringify(library, null, 2)}\n`,
);

console.log(`Prepared ${videos.length} source-grounded videos without Neurodesk recording dependencies.`);
