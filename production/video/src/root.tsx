import { Composition } from "remotion";
import content from "../content/understanding-contrasts.json";
import timing from "../generated/understanding-contrasts.json";
import { UnderstandingContrasts } from "./understanding-contrasts";

export const VideoRoot = () => (
  <Composition
    id="UnderstandingContrasts"
    component={UnderstandingContrasts}
    durationInFrames={Math.max(1, timing.totalFrames)}
    fps={content.fps}
    width={1920}
    height={1080}
  />
);
