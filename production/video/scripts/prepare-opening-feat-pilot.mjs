import { prepareLiveWalkthrough } from "./prepare-live-walkthrough.mjs";

await prepareLiveWalkthrough({
  slug: "opening-feat",
  captureRootArgument: process.argv[2],
});
