import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const args = new Map(
  process.argv
    .slice(2)
    .filter((value) => value.startsWith("--") && value.includes("="))
    .map((value) => {
      const separator = value.indexOf("=");
      return [value.slice(2, separator), value.slice(separator + 1)];
    }),
);
const videoId = args.get("video");
const kind = args.get("kind");
const decision = args.get("decision");
const reviewer = args.get("reviewer");
const reviewedAt = args.get("date");
const evidence = args.get("evidence");

if (!videoId || !["editorial", "scientific"].includes(kind) || !["approved", "changes_requested"].includes(decision)) {
  throw new Error(
    "Usage: node record-video-review.mjs --video=<concept:slug|walkthrough:slug> --kind=<editorial|scientific> --decision=<approved|changes_requested> --reviewer=<name> --date=<YYYY-MM-DD> --evidence=<repo-path-or-url>",
  );
}
if (!reviewer?.trim()) throw new Error("A non-empty --reviewer value is required.");
if (!/^\d{4}-\d{2}-\d{2}$/.test(reviewedAt ?? "")) {
  throw new Error("--date must use YYYY-MM-DD format.");
}
if (!evidence?.trim()) throw new Error("A non-empty --evidence value is required.");
if (!/^https?:\/\//.test(evidence)) await access(path.join(projectRoot, evidence));

const ledgerPath = path.join(projectRoot, "production", "metadata", "video-release.json");
const ledger = JSON.parse(await readFile(ledgerPath, "utf8"));
const video = ledger.videos.find((item) => item.id === videoId);
if (!video) throw new Error(`Unknown release-ledger video: ${videoId}`);

video.review[kind] = decision;
video.reviewDecisions ??= {};
video.reviewDecisions[kind] = { reviewer: reviewer.trim(), reviewedAt, evidence: evidence.trim() };
await writeFile(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`);

console.log(`Recorded ${kind} ${decision} for ${videoId}.`);
if (videoId === "walkthrough:opening-feat") {
  console.log("Regenerate capture packages after both pilot decisions are approved.");
}
