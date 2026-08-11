import { Composition } from "remotion";
import conceptLibraryJson from "../content/concept-library.json";
import content from "../content/understanding-contrasts.json";
import conceptTimingJson from "../generated/concept-library.json";
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
const openingFeatRawFrames =
  openingFeatTiming.scenes
    .flatMap((scene) => scene.visualScenes)
    .reduce((sum, scene) => sum + scene.frameCount, 0) *
  (30 / openingFeatTiming.captureFps);

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
    <Composition
      id="OpeningFeatWalkthrough"
      component={LiveWalkthrough}
      defaultProps={{ timing: openingFeatTiming }}
      durationInFrames={Math.max(1, openingFeatTiming.totalFrames)}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="OpeningFeatRaw"
      component={RawLiveWalkthrough}
      defaultProps={{ timing: openingFeatTiming }}
      durationInFrames={Math.max(1, Math.ceil(openingFeatRawFrames))}
      fps={30}
      width={1920}
      height={1080}
    />
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
