import { Composition } from "remotion";
import conceptLibraryJson from "../content/concept-library.json";
import content from "../content/understanding-contrasts.json";
import conceptTimingJson from "../generated/concept-library.json";
import timing from "../generated/understanding-contrasts.json";
import { ConceptLesson, type ConceptTiming, type ConceptVideo } from "./concept-lesson";
import { UnderstandingContrasts } from "./understanding-contrasts";

const conceptLibrary = conceptLibraryJson as { videos: ConceptVideo[] };
const conceptTiming = conceptTimingJson as { videos: ConceptTiming[] };

export const VideoRoot = () => (
  <>
    <Composition
      id="UnderstandingContrasts"
      component={UnderstandingContrasts}
      durationInFrames={Math.max(1, timing.totalFrames)}
      fps={content.fps}
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
