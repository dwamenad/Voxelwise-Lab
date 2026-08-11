import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getLiveWalkthrough, liveWalkthroughs } from "../content/live-walkthroughs.mjs";
import { getWalkthroughCaptureLayout } from "./prepare-live-walkthrough.mjs";

const projectRoot = process.cwd();
const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const includePilot = args.includes("--include-pilot");
const rootArgument = args.find((value) => value.startsWith("--root="))?.slice("--root=".length);
const requestedSlugs = args.filter((value) => !value.startsWith("--"));
const captureRoot = path.resolve(
  rootArgument ?? process.env.CAPTURE_PACKAGE_ROOT ?? path.join(projectRoot, "..", "walkthrough-captures"),
);

const selected = requestedSlugs.length
  ? requestedSlugs.map((slug) => {
      const definition = getLiveWalkthrough(slug);
      if (!definition) {
        throw new Error(
          `Unknown walkthrough "${slug}". Expected one of: ${liveWalkthroughs.map((item) => item.slug).join(", ")}`,
        );
      }
      return definition;
    })
  : liveWalkthroughs.filter((item) => includePilot || item.slug !== "opening-feat");

const batchStoryboard = await readFile(
  path.join(projectRoot, "production", "storyboards", "batch-recording-plan.md"),
  "utf8",
);
const releaseLedger = JSON.parse(
  await readFile(path.join(projectRoot, "production", "metadata", "video-release.json"), "utf8"),
);
const pilot = releaseLedger.videos.find((video) => video.id === "walkthrough:opening-feat");
const recordedApproval = (kind) => {
  const decision = pilot?.reviewDecisions?.[kind];
  return pilot?.review?.[kind] === "approved" &&
    typeof decision?.reviewer === "string" && decision.reviewer.trim() &&
    /^\d{4}-\d{2}-\d{2}$/.test(decision?.reviewedAt ?? "") &&
    typeof decision?.evidence === "string" && decision.evidence.trim();
};
const pilotApproved =
  Boolean(recordedApproval("editorial") && recordedApproval("scientific"));
const shellQuote = (value) => `'${value.replaceAll("'", `'\\''`)}'`;

const storyboardBlock = (definition) => {
  if (definition.slug === "opening-feat") {
    return "See production/storyboards/opening-feat.md for the pilot storyboard.";
  }
  const order = liveWalkthroughs.findIndex((item) => item.slug === definition.slug) + 1;
  const start = batchStoryboard.indexOf(`## ${order}. `);
  if (start === -1) throw new Error(`${definition.slug}: storyboard section ${order} is missing.`);
  const next = batchStoryboard.indexOf("\n## ", start + 4);
  return batchStoryboard.slice(start, next === -1 ? undefined : next).trim();
};

const packageFor = async (definition) => {
  const { narrationScenes, visualGroups } = await getWalkthroughCaptureLayout({
    slug: definition.slug,
    projectRoot,
  });
  const packageRoot = path.join(captureRoot, definition.slug);
  const sections = narrationScenes.map((scene, index) => ({
    id: `section-${index + 1}`,
    title: scene.title,
    directories: visualGroups[index],
  }));
  const manifest = {
    version: 1,
    slug: definition.slug,
    title: definition.title,
    targetMinutes: definition.targetMinutes,
    data: definition.data,
    fslVersion: "6.0.7.22",
    resolution: "1920x1080",
    frameRate: 30,
    captureSampleRate: 5,
    startState: definition.startState,
    endState: definition.endState,
    approvalGate: {
      pilot: "opening-feat",
      approved: pilotApproved,
      requirement: "Editorial and scientific approval of the Opening FEAT pilot",
    },
    canonicalSources: {
      narration: `production/narration/${definition.slug}.md`,
      storyboard:
        definition.slug === "opening-feat"
          ? "production/storyboards/opening-feat.md"
          : "production/storyboards/batch-recording-plan.md",
      runSpecifications: "production/metadata/feat-run-specs.yaml",
    },
    sections,
  };

  if (checkOnly) {
    const saved = JSON.parse(await readFile(path.join(packageRoot, "capture-plan.json"), "utf8"));
    for (const key of ["slug", "title", "data", "startState", "endState"]) {
      if (saved[key] !== manifest[key]) {
        throw new Error(`${definition.slug}: capture-plan.json ${key} is stale.`);
      }
    }
    if (JSON.stringify(saved.sections) !== JSON.stringify(sections)) {
      throw new Error(`${definition.slug}: capture-plan.json section layout is stale.`);
    }
    if (JSON.stringify(saved.approvalGate) !== JSON.stringify(manifest.approvalGate)) {
      throw new Error(`${definition.slug}: capture-plan.json approval gate is stale.`);
    }
    await access(path.join(packageRoot, "CAPTURE_PLAN.md"));
    for (const directory of visualGroups.flat()) await access(path.join(packageRoot, directory));
    return;
  }

  await mkdir(packageRoot, { recursive: true });
  for (const directory of visualGroups.flat()) {
    await mkdir(path.join(packageRoot, directory), { recursive: true });
  }

  const sectionList = sections
    .map(
      (section) =>
        `### ${section.id}: ${section.title}\n\n${section.directories.map((directory) => `- \`${directory}/\``).join("\n")}`,
    )
    .join("\n\n");
  const gateMessage = pilotApproved
    ? "The Opening FEAT pilot is approved. Recording may proceed."
    : "STOP: the Opening FEAT pilot still needs editorial and scientific approval. Prepare this package now, but do not record into it yet.";
  const plan = `# ${definition.title} — capture package

${gateMessage}

## Production state

- Data: \`${definition.data}\`
- FSL: \`6.0.7.22\`
- Start state: \`${definition.startState}\`
- Required end state: \`${definition.endState}\`
- Target: ${definition.targetMinutes} minutes
- Capture: 1920×1080, 30 fps; export PNG frames sampled at 5 fps

## Before recording

- Close unrelated tabs, files, notifications, and account details.
- Load the exact start state and verify the input/output identity.
- Confirm \`Feat &\` is the GUI launcher and lower-case \`feat saved-design.fsf\` is used only for a saved-design run.
- Read the canonical narration and storyboard before moving the pointer.
- Hold important selections for at least two seconds.

## Capture directories

Place each ordered PNG sequence in its matching directory. The preparation command rejects missing or empty directories.

${sectionList}

## Authentic action storyboard

${storyboardBlock(definition)}

## After recording

1. Confirm no credentials, account details, personal files, or unrelated content appear.
2. Confirm every named control and terminal result is legible at normal playback size.
3. Leave the source state at \`${definition.endState}\`.
4. Prepare and render from the repository root:

\`\`\`sh
npm run video:prepare:walkthrough -- ${definition.slug} ${shellQuote(packageRoot)}
npm run video:render:walkthrough -- ${definition.slug}
npm run video:validate:walkthroughs:masters -- ${definition.slug}
\`\`\`
`;

  await Promise.all([
    writeFile(path.join(packageRoot, "capture-plan.json"), `${JSON.stringify(manifest, null, 2)}\n`),
    writeFile(path.join(packageRoot, "CAPTURE_PLAN.md"), plan),
  ]);
};

for (const definition of selected) await packageFor(definition);

console.log(
  `${checkOnly ? "Validated" : "Created"} ${selected.length} capture package(s) in ${captureRoot}.`,
);
if (!pilotApproved) console.log("Opening FEAT approval gate: pending; packages are preparation-only.");
