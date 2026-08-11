import { Composition } from "remotion";
import conceptLibraryJson from "../content/concept-library.json";
import content from "../content/understanding-contrasts.json";
import conceptTimingJson from "../generated/concept-library.json";
import walkthroughBatchJson from "../generated/walkthroughs/batch.json";
import openingFeatTimingJson from "../generated/walkthroughs/opening-feat.json";
import timing from "../generated/understanding-contrasts.json";
import { ConceptLesson, type ConceptTiming, type ConceptVideo } from "./concept-lesson";
import {
  LiveWalkthrough,
  RawLiveWalkthrough,
  type LiveWalkthroughTiming,
} from "./live-walkthrough";

const conceptLibrary = conceptLibraryJson as { videos: ConceptVideo[] };
const conceptTiming = conceptTimingJson as { videos: ConceptTiming[] };
const contrastVideo = content as ConceptVideo;
const contrastTiming = timing as unknown as ConceptTiming;
const openingFeatTiming = openingFeatTimingJson as LiveWalkthroughTiming;
const walkthroughBatch = walkthroughBatchJson as { walkthroughs: LiveWalkthroughTiming[] };
const walkthroughTimings = [openingFeatTiming, ...walkthroughBatch.walkthroughs];
const rawDurationInFrames = (walkthroughTiming: LiveWalkthroughTiming) =>
  walkthroughTiming.rawTotalFrames ??
  walkthroughTiming.scenes
    .flatMap((scene) => scene.visualScenes)
    .reduce((sum, scene) => sum + scene.frameCount, 0) *
    (walkthroughTiming.fps / walkthroughTiming.captureFps);

export const VideoRoot = () => (
  <>
    <Composition
      id="UnderstandingContrasts"
      component={ConceptLesson}
      defaultProps={{ video: contrastVideo, timing: contrastTiming }}
      durationInFrames={Math.max(1, contrastTiming.totalFrames)}
      fps={content.fps}
      width={1920}
      height={1080}
    />
    {walkthroughTimings.flatMap((walkthroughTiming) => [
      <Composition
        key={`${walkthroughTiming.slug}-review`}
        id={walkthroughTiming.compositionId}
        component={LiveWalkthrough}
        defaultProps={{ timing: walkthroughTiming }}
        durationInFrames={Math.max(1, walkthroughTiming.totalFrames)}
        fps={walkthroughTiming.fps}
        width={walkthroughTiming.width}
        height={walkthroughTiming.height}
      />,
      <Composition
        key={`${walkthroughTiming.slug}-raw`}
        id={walkthroughTiming.rawCompositionId ?? (walkthroughTiming.slug === "opening-feat" ? "OpeningFeatRaw" : `${walkthroughTiming.compositionId}Raw`)}
        component={RawLiveWalkthrough}
        defaultProps={{ timing: walkthroughTiming }}
        durationInFrames={Math.max(1, Math.ceil(rawDurationInFrames(walkthroughTiming)))}
        fps={walkthroughTiming.fps}
        width={walkthroughTiming.width}
        height={walkthroughTiming.height}
      />,
    ])}
    {conceptLibrary.videos.map((video) => {
      const generated = conceptTiming.videos.find((item) => item.slug === video.slug);
      if (!generated) return null;
      return (
        <Composition
          key={video.slug}
          id={video.compositionId}
          component={ConceptLesson}
          defaultProps={{ video, timing: generated }}
          durationInFrames={Math.max(1, generated.totalFrames)}
          fps={30}
          width={1920}
          height={1080}
        />
      );
    })}
  </>
);
