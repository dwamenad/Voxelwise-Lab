import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { getVideoMetadata } from "@remotion/renderer";
import { liveWalkthroughs } from "../content/live-walkthroughs.mjs";
import { validateVideoAudio } from "./validate-video-audio.mjs";

const projectRoot = process.cwd();
const flags = new Set(process.argv.slice(2));
const requirePublishable = flags.has("--require-publishable") || flags.has("--require-published");
const requirePublished = flags.has("--require-published");
const errors = [];

const readJson = async (relativePath) =>
  JSON.parse(await readFile(path.join(projectRoot, relativePath), "utf8"));

const [ledger, conceptLibrary, contrasts] = await Promise.all([
  readJson("production/metadata/video-release.json"),
  readJson("production/video/content/concept-library.json"),
  readJson("production/video/content/understanding-contrasts.json"),
]);

const expected = [
  ...conceptLibrary.videos.map((video) => ({
    id: `concept:${video.slug}`,
    slug: video.slug,
    lessonSlug:
      video.slug === "reviewing-complete-feat-report"
        ? "complete-guided-analysis"
        : video.slug,
    courseSlug: video.courseSlug,
    kind: "concept",
  })),
  {
    id: `concept:${contrasts.slug}`,
    slug: contrasts.slug,
    lessonSlug: contrasts.slug,
    courseSlug: contrasts.courseSlug,
    kind: "concept",
  },
  ...liveWalkthroughs.map((video) => ({
    id: `walkthrough:${video.slug}`,
    slug: video.slug,
    lessonSlug: video.slug,
    courseSlug: "first-level-fmri-analysis-feat",
    kind: "walkthrough",
  })),
];

const allowedStates = new Set([
  "planned",
  "captured",
  "prepared",
  "mastered",
  "review",
  "approved",
  "published",
]);
const allowedReview = {
  technical: new Set(["pending", "passed"]),
  editorial: new Set(["pending", "changes_requested", "approved"]),
  scientific: new Set(["pending", "source_checked", "changes_requested", "approved"]),
};
const expectedById = new Map(expected.map((video) => [video.id, video]));
const actualById = new Map();

if (ledger.version !== 1) errors.push("Release ledger version must be 1.");
if (ledger.releaseTarget !== expected.length) {
  errors.push(`Release target must be ${expected.length}; found ${ledger.releaseTarget}.`);
}
if (ledger.videos?.length !== expected.length) {
  errors.push(`Release ledger must contain ${expected.length} videos; found ${ledger.videos?.length ?? 0}.`);
}

const requireLocalArtifact = async (video, key) => {
  const relativePath = video.artifacts?.[key];
  if (!relativePath) {
    errors.push(`${video.id}: ${key} is required.`);
    return;
  }
  if (path.isAbsolute(relativePath)) {
    errors.push(`${video.id}: ${key} must be a repository-relative path.`);
    return;
  }
  try {
    const file = await stat(path.join(projectRoot, relativePath));
    if (!file.isFile() || file.size === 0) errors.push(`${video.id}: ${key} is empty or not a file.`);
  } catch {
    errors.push(`${video.id}: ${key} does not exist at ${relativePath}.`);
  }
};

const validateEncodedMedia = async (video, key) => {
  const relativePath = video.artifacts?.[key];
  if (!relativePath) return;
  try {
    const metadata = await getVideoMetadata(path.join(projectRoot, relativePath));
    if (metadata.width !== 1920 || metadata.height !== 1080) {
      errors.push(`${video.id}: ${key} must be 1920x1080.`);
    }
    if (metadata.fps !== 30) errors.push(`${video.id}: ${key} must be 30 fps.`);
    if (metadata.codec !== "h264") errors.push(`${video.id}: ${key} must use H.264.`);
    if (metadata.audioCodec !== "aac") errors.push(`${video.id}: ${key} must use AAC audio.`);
    if (!metadata.canPlayInVideoTag || !metadata.supportsSeeking) {
      errors.push(`${video.id}: ${key} must be seekable browser-compatible media.`);
    }
  } catch (error) {
    errors.push(`${video.id}: ${key} media validation failed (${error.message}).`);
  }
};

const validateRecordedDecision = async (video, kind) => {
  const status = video.review?.[kind];
  const decision = video.reviewDecisions?.[kind];
  if (!["approved", "changes_requested"].includes(status)) {
    if (decision) errors.push(`${video.id}: ${kind} decision evidence exists while status is ${status}.`);
    return;
  }
  if (!decision) {
    errors.push(`${video.id}: ${kind} ${status} requires recorded decision evidence.`);
    return;
  }
  if (typeof decision.reviewer !== "string" || !decision.reviewer.trim()) {
    errors.push(`${video.id}: ${kind} decision requires a reviewer.`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(decision.reviewedAt ?? "")) {
    errors.push(`${video.id}: ${kind} decision requires reviewedAt in YYYY-MM-DD format.`);
  }
  if (typeof decision.evidence !== "string" || !decision.evidence.trim()) {
    errors.push(`${video.id}: ${kind} decision requires evidence.`);
  } else if (!/^https?:\/\//.test(decision.evidence)) {
    try {
      await access(path.join(projectRoot, decision.evidence));
    } catch {
      errors.push(`${video.id}: ${kind} decision evidence does not exist at ${decision.evidence}.`);
    }
  }
};

for (const video of ledger.videos ?? []) {
  if (!video.id) {
    errors.push("Release ledger contains a video without an id.");
    continue;
  }
  if (actualById.has(video.id)) errors.push(`${video.id}: duplicate release-ledger id.`);
  actualById.set(video.id, video);

  const source = expectedById.get(video.id);
  if (!source) {
    errors.push(`${video.id}: not present in the durable concept or walkthrough sources.`);
    continue;
  }
  for (const key of ["slug", "lessonSlug", "courseSlug", "kind"]) {
    if (video[key] !== source[key]) {
      errors.push(`${video.id}: ${key} must be ${source[key]}; found ${video[key]}.`);
    }
  }
  if (!allowedStates.has(video.state)) errors.push(`${video.id}: invalid state ${video.state}.`);
  for (const [key, allowed] of Object.entries(allowedReview)) {
    if (!allowed.has(video.review?.[key])) {
      errors.push(`${video.id}: invalid ${key} review state ${video.review?.[key]}.`);
    }
  }
  await validateRecordedDecision(video, "editorial");
  await validateRecordedDecision(video, "scientific");

  if (["mastered", "review", "approved", "published"].includes(video.state)) {
    if (video.review?.technical !== "passed") {
      errors.push(`${video.id}: ${video.state} requires passed technical review.`);
    }
    await requireLocalArtifact(video, "captionsPath");
    await requireLocalArtifact(video, "transcriptPath");
  }
  if (video.state === "mastered") {
    await requireLocalArtifact(video, "masterPath");
    await validateEncodedMedia(video, "masterPath");
  }
  if (video.state === "review") {
    if (!video.artifacts?.reviewUrl) errors.push(`${video.id}: review state requires a reviewUrl.`);
    await requireLocalArtifact(video, "reviewPath");
    await validateEncodedMedia(video, "reviewPath");
    if (video.kind === "walkthrough" && video.artifacts?.reviewPath) {
      const audio = await validateVideoAudio({
        mediaPath: path.join(projectRoot, video.artifacts.reviewPath),
        srtPath: video.artifacts.captionsPath && path.join(projectRoot, video.artifacts.captionsPath),
        narrationPath: path.join(projectRoot, "production", "narration", `${video.slug}.md`),
      });
      for (const issue of audio.errors) errors.push(`${video.id}: ${issue}`);
    }
  }
  if (["approved", "published"].includes(video.state)) {
    if (video.review?.editorial !== "approved" || video.review?.scientific !== "approved") {
      errors.push(`${video.id}: ${video.state} requires editorial and scientific approval.`);
    }
    await requireLocalArtifact(video, "masterPath");
    await validateEncodedMedia(video, "masterPath");
    if (video.kind === "walkthrough" && video.artifacts?.masterPath) {
      const audio = await validateVideoAudio({
        mediaPath: path.join(projectRoot, video.artifacts.masterPath),
        srtPath: video.artifacts.captionsPath && path.join(projectRoot, video.artifacts.captionsPath),
        narrationPath: path.join(projectRoot, "production", "narration", `${video.slug}.md`),
      });
      for (const issue of audio.errors) errors.push(`${video.id}: ${issue}`);
    }
  }

  const publication = video.publication ?? {};
  const publicationValues = [publication.provider, publication.assetId, publication.playbackUrl];
  const populatedPublicationValues = publicationValues.filter(Boolean).length;
  if (populatedPublicationValues !== 0 && populatedPublicationValues !== publicationValues.length) {
    errors.push(`${video.id}: provider, assetId, and playbackUrl must be populated together.`);
  }
  if (publication.provider && ledger.selectedProvider !== publication.provider) {
    errors.push(`${video.id}: publication provider does not match selectedProvider.`);
  }
  if (video.state === "published" && populatedPublicationValues !== publicationValues.length) {
    errors.push(`${video.id}: published state requires complete provider metadata.`);
  }

  if (requirePublishable) {
    if (!["approved", "published"].includes(video.state)) {
      errors.push(`${video.id}: must be approved before release.`);
    }
    if (video.review?.technical !== "passed") errors.push(`${video.id}: technical review is not passed.`);
    if (video.review?.editorial !== "approved") errors.push(`${video.id}: editorial review is not approved.`);
    if (video.review?.scientific !== "approved") errors.push(`${video.id}: scientific review is not approved.`);
    await requireLocalArtifact(video, "masterPath");
    await requireLocalArtifact(video, "captionsPath");
    await requireLocalArtifact(video, "transcriptPath");
  }
  if (requirePublished) {
    if (video.state !== "published") errors.push(`${video.id}: state must be published.`);
    if (populatedPublicationValues !== publicationValues.length) {
      errors.push(`${video.id}: provider publication metadata is incomplete.`);
    }
  }
}

for (const video of expected) {
  if (!actualById.has(video.id)) errors.push(`${video.id}: missing from release ledger.`);
}

if (ledger.selectedProvider !== null && typeof ledger.selectedProvider !== "string") {
  errors.push("selectedProvider must be null or a non-empty string.");
}
if (requirePublished && !ledger.selectedProvider) {
  errors.push("A streaming provider must be selected before publication.");
}

const summary = (ledger.videos ?? []).reduce((counts, video) => {
  counts[video.state] = (counts[video.state] ?? 0) + 1;
  return counts;
}, {});
const approvals = (ledger.videos ?? []).reduce(
  (counts, video) => ({
    editorial: counts.editorial + Number(video.review?.editorial === "approved"),
    scientific: counts.scientific + Number(video.review?.scientific === "approved"),
    published: counts.published + Number(video.state === "published"),
  }),
  { editorial: 0, scientific: 0, published: 0 },
);

if (errors.length) {
  console.error(`Video release validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validated ${expected.length} release-ledger video(s).`);
console.log(`Production state: ${Object.entries(summary).map(([state, count]) => `${state}=${count}`).join(", ")}.`);
console.log(
  `Approvals: editorial=${approvals.editorial}/${expected.length}, scientific=${approvals.scientific}/${expected.length}, published=${approvals.published}/${expected.length}.`,
);
console.log(`Streaming provider: ${ledger.selectedProvider ?? "not selected"}.`);
