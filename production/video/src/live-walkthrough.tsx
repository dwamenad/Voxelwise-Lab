import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame } from "remotion";

interface VisualSceneTiming {
  id: string;
  assetRoot: string;
  frameCount: number;
}

interface LiveSceneTiming {
  id: string;
  title: string;
  audioPath: string;
  durationInFrames: number;
  startFrame: number;
  visualScenes: VisualSceneTiming[];
}

interface LiveCaptionCue {
  text: string;
  startFrame: number;
  endFrame: number;
}

export interface LiveWalkthroughTiming {
  title?: string;
  slug: string;
  compositionId: string;
  rawCompositionId?: string;
  fps: number;
  captureFps: number;
  width: number;
  height: number;
  totalFrames: number;
  totalSeconds: number;
  rawTotalFrames?: number;
  scenes: LiveSceneTiming[];
  cues: LiveCaptionCue[];
}

const padFrame = (frame: number) => String(frame).padStart(5, "0");

const AuthenticCapture = ({ scene }: { scene: LiveSceneTiming }) => {
  const frame = useCurrentFrame();
  const totalSourceFrames = scene.visualScenes.reduce(
    (sum, visualScene) => sum + visualScene.frameCount,
    0,
  );
  const progress = Math.min(0.999999, frame / Math.max(1, scene.durationInFrames));
  let sourceFrame = Math.min(totalSourceFrames - 1, Math.floor(progress * totalSourceFrames));
  let selectedScene = scene.visualScenes[0];

  for (const visualScene of scene.visualScenes) {
    if (sourceFrame < visualScene.frameCount) {
      selectedScene = visualScene;
      break;
    }
    sourceFrame -= visualScene.frameCount;
  }

  return (
    <Img
      src={staticFile(`${selectedScene.assetRoot}/${padFrame(sourceFrame)}.png`)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        background: "#050706",
      }}
    />
  );
};

const Captions = ({ timing }: { timing: LiveWalkthroughTiming }) => {
  const frame = useCurrentFrame();
  const cue = timing.cues.find((item) => frame >= item.startFrame && frame < item.endFrame);
  if (!cue) return null;

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 20,
        left: 120,
        right: 120,
        bottom: 42,
        minHeight: 96,
        display: "grid",
        placeItems: "center",
        color: "#fff",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: 36,
        fontWeight: 700,
        lineHeight: 1.24,
        textAlign: "center",
        whiteSpace: "pre-line",
        textShadow: "0 2px 3px rgba(0,0,0,.75)",
      }}
    >
      <span
        style={{
          background: "rgba(5,11,9,.91)",
          borderRadius: 8,
          padding: "13px 24px 15px",
          boxShadow: "0 6px 18px rgba(0,0,0,.28)",
        }}
      >
        {cue.text}
      </span>
    </div>
  );
};

export const LiveWalkthrough = ({ timing }: { timing: LiveWalkthroughTiming }) => (
  <AbsoluteFill style={{ background: "#050706" }}>
    {timing.scenes.map((scene) => (
      <Sequence
        key={scene.id}
        from={scene.startFrame}
        durationInFrames={scene.durationInFrames}
        premountFor={30}
      >
        <AuthenticCapture scene={scene} />
        <Audio src={staticFile(scene.audioPath)} />
      </Sequence>
    ))}
    <Captions timing={timing} />
  </AbsoluteFill>
);

export const RawLiveWalkthrough = ({ timing }: { timing: LiveWalkthroughTiming }) => {
  const frame = useCurrentFrame();
  const sourceFrame = Math.floor((frame * timing.captureFps) / timing.fps);
  const visualScenes = timing.scenes.flatMap((scene) => scene.visualScenes);
  let remainingFrame = sourceFrame;
  let selectedScene = visualScenes[0];

  for (const visualScene of visualScenes) {
    if (remainingFrame < visualScene.frameCount) {
      selectedScene = visualScene;
      break;
    }
    remainingFrame -= visualScene.frameCount;
  }

  const selectedFrame = Math.min(selectedScene.frameCount - 1, remainingFrame);
  return (
    <AbsoluteFill style={{ background: "#050706" }}>
      <Img
        src={staticFile(`${selectedScene.assetRoot}/${padFrame(selectedFrame)}.png`)}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
    </AbsoluteFill>
  );
};
