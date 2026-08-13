import { build } from "esbuild";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { editorialV2 } from "../content/editorial-v2.mjs";

const projectRoot = process.cwd();
const voiceRegistry = JSON.parse(
  await readFile(path.join(projectRoot, "production", "video", "config", "voices.json"), "utf8"),
);

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
          path: path.extname(args.path) === ".json"
            ? path.join(projectRoot, args.path.slice(2))
            : `${path.join(projectRoot, args.path.slice(2))}.ts`,
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

const compositionId = (slug) =>
  `Lesson${slug
    .split("-")
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join("")}`;

const videos = [];
const usedEditorialSlugs = new Set();

for (const course of courses.filter((item) => eligibleCourses.has(item.slug))) {
  for (const courseModule of course.modules) {
    for (const lesson of courseModule.lessons) {
      for (const videoBlock of lesson.blocks.filter((block) => block.type === "video")) {
        const included =
          (videoBlock.videoType === "concept" && lesson.slug !== "understanding-contrasts") ||
          videoBlock.videoType === "quality-control";
        if (!included) continue;

        const editorialSlug =
          videoBlock.videoType === "quality-control"
            ? "reviewing-complete-feat-report"
            : lesson.slug;
        const editorial = editorialV2[editorialSlug];
        if (!editorial) {
          throw new Error(`Missing v2 editorial content for ${editorialSlug}`);
        }
        usedEditorialSlugs.add(editorialSlug);

        const sourceFile = lesson.production?.sourceLab ?? course.sourceLabs[0];
        const sourceSection = lesson.production?.sourceSection ?? courseModule.title;
        const labRef = {
          type: "course-lab",
          file: sourceFile,
          section: sourceSection,
          note: "Curriculum implementation reference",
          visibility: "internal",
        };

        videos.push({
          slug: editorialSlug,
          compositionId: compositionId(editorialSlug),
          courseSlug: course.slug,
          courseTitle: course.title,
          courseLabel: course.shortTitle,
          catalogNumber: course.catalogNumber,
          moduleTitle: courseModule.title,
          lessonNumber: lesson.number,
          title: videoBlock.title,
          description: editorial.description,
          videoType: videoBlock.videoType,
          accent: accentColors[course.accent] ?? "#79e6bf",
          defaultVoiceId: voiceRegistry.defaultVoiceId,
          voiceIds: voiceRegistry.voices.map((voice) => voice.id),
          fps: 30,
          source: {
            repository: "tubric/2026s-fmri-class",
            file: sourceFile,
            section: sourceSection,
            license: "MIT",
            visibility: "internal",
          },
          scenes: editorial.scenes.map((scene) => ({
            ...scene,
            sourceRefs: [...scene.sourceRefs, labRef],
          })),
        });
      }
    }
  }
}

const unusedEditorialSlugs = Object.keys(editorialV2).filter(
  (slug) => !usedEditorialSlugs.has(slug),
);
if (unusedEditorialSlugs.length) {
  throw new Error(`Unused v2 editorial content: ${unusedEditorialSlugs.join(", ")}`);
}

const library = {
  version: 3,
  narration: {
    registryVersion: voiceRegistry.version,
    defaultVoiceId: voiceRegistry.defaultVoiceId,
    voices: voiceRegistry.voices,
    audioTargets: voiceRegistry.audioTargets,
  },
  selection: {
    courses: [...eligibleCourses],
    includedTypes: ["concept", "quality-control"],
    excludedSlug: "understanding-contrasts",
    reason: "Builds videos that do not require a live Neurodesk session.",
  },
  editorialPolicy: {
    learnerCreditsEnabled: false,
    acknowledgementSlideEnabled: false,
    sourceReferences: "internal-only",
  },
  videos,
};

await writeFile(
  path.join(projectRoot, "production", "video", "content", "concept-library.json"),
  `${JSON.stringify(library, null, 2)}\n`,
);

console.log(`Prepared ${videos.length} five-voice videos with internal-only source references.`);
