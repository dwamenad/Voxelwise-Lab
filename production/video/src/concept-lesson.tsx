import type { CSSProperties, ReactNode } from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ConceptVisual, palette, sans } from "./components/visuals";
import type { ConceptScene, ConceptTiming, ConceptVideo } from "./video-types";

export type { ConceptScene, ConceptTiming, ConceptVideo } from "./video-types";

const CONTENT_TOP = 138;
const CONTENT_BOTTOM = 170;
const SIDE = 82;

const useEntrance = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 22, stiffness: 105, mass: 0.85 },
  });
  return {
    opacity: interpolate(progress, [0, 1], [0, 1]),
    transform: `translateY(${interpolate(progress, [0, 1], [24, 0])}px)`,
  } satisfies CSSProperties;
};

const Background = ({ dark }: { dark: boolean }) => (
  <AbsoluteFill
    style={{
      background: dark ? palette.ink : palette.paper,
      backgroundImage: dark
        ? "radial-gradient(circle at 77% 43%, rgba(121,230,191,.10), transparent 34%)"
        : "linear-gradient(90deg, rgba(16,34,29,.035) 1px, transparent 1px), linear-gradient(rgba(16,34,29,.035) 1px, transparent 1px)",
      backgroundSize: dark ? "auto" : "96px 96px",
    }}
  />
);

const Header = ({ video, sceneIndex, dark }: { video: ConceptVideo; sceneIndex: number; dark: boolean }) => (
  <div style={{ position: "absolute", top: 42, left: SIDE, right: SIDE, zIndex: 5, display: "flex", alignItems: "center", justifyContent: "space-between", color: dark ? palette.white : palette.ink }}>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 44, height: 44, background: video.accent, display: "grid", placeItems: "center", color: palette.ink, fontSize: 16, fontWeight: 900 }}>VL</div>
      <div>
        <div style={{ fontSize: 21, fontWeight: 820, letterSpacing: "-.02em" }}>Voxelwise Lab</div>
        <div style={{ color: dark ? "#aabbb4" : palette.muted, fontSize: 16, marginTop: 2 }}>{video.courseLabel} · {video.lessonNumber}</div>
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <div style={{ width: 150, height: 4, background: dark ? "rgba(255,255,255,.16)" : palette.line }}>
        <div style={{ width: `${((sceneIndex + 1) / video.scenes.length) * 100}%`, height: "100%", background: video.accent }} />
      </div>
      <span style={{ fontSize: 18, fontWeight: 760, color: dark ? "#c4d0cb" : palette.muted }}>{String(sceneIndex + 1).padStart(2, "0")} / {String(video.scenes.length).padStart(2, "0")}</span>
    </div>
  </div>
);

const SceneShell = ({ video, sceneIndex, dark = false, children }: { video: ConceptVideo; sceneIndex: number; dark?: boolean; children: ReactNode }) => (
  <AbsoluteFill style={{ color: dark ? palette.white : palette.ink, fontFamily: sans, overflow: "hidden" }}>
    <Background dark={dark} />
    <Header video={video} sceneIndex={sceneIndex} dark={dark} />
    {children}
  </AbsoluteFill>
);

const Eyebrow = ({ text, accent }: { text: string; accent: string }) => (
  <div style={{ color: accent, fontWeight: 840, fontSize: 21, letterSpacing: ".09em", textTransform: "uppercase", marginBottom: 20 }}>{text}</div>
);

const titleSize = (title: string, opening = false) => {
  if (opening) return title.length > 48 ? 70 : title.length > 32 ? 80 : 92;
  return title.length > 50 ? 54 : title.length > 34 ? 61 : 69;
};

const DisplayBullets = ({ bullets, accent, dark = false }: { bullets?: string[]; accent: string; dark?: boolean }) => {
  const frame = useCurrentFrame();
  if (!bullets?.length) return null;
  return (
    <div style={{ display: "grid", gap: 16, marginTop: 28 }}>
      {bullets.slice(0, 3).map((bullet, index) => {
        const progress = interpolate(frame, [14 + index * 8, 26 + index * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={bullet} style={{ opacity: progress, transform: `translateX(${(1 - progress) * 18}px)`, display: "grid", gridTemplateColumns: "16px 1fr", gap: 15, alignItems: "start", color: dark ? "#edf3f0" : palette.ink, fontSize: 29, lineHeight: 1.24, fontWeight: 690 }}>
            <span style={{ width: 11, height: 11, marginTop: 12, borderRadius: "50%", background: accent }} />
            <span>{bullet}</span>
          </div>
        );
      })}
    </div>
  );
};

const TextBlock = ({ scene, video, dark = false, opening = false }: { scene: ConceptScene; video: ConceptVideo; dark?: boolean; opening?: boolean }) => (
  <div style={{ ...useEntrance(), maxWidth: opening ? 820 : 700 }}>
    <Eyebrow text={scene.display.eyebrow} accent={scene.kind === "quality-control" ? palette.coral : video.accent} />
    <h1 style={{ fontSize: titleSize(scene.display.title, opening), lineHeight: .98, letterSpacing: "-.052em", margin: 0, fontWeight: 820 }}>{scene.display.title}</h1>
    {scene.display.body && <p style={{ margin: "25px 0 0", color: dark ? "#b9c8c2" : palette.muted, fontSize: 32, lineHeight: 1.35, maxWidth: 720 }}>{scene.display.body}</p>}
    <DisplayBullets bullets={scene.display.bullets} accent={video.accent} dark={dark} />
  </div>
);

const OpeningScene = ({ video, scene, sceneIndex }: { video: ConceptVideo; scene: ConceptScene; sceneIndex: number }) => {
  const visualEntrance = useEntrance(8);
  return <SceneShell video={video} sceneIndex={sceneIndex} dark>
    <div style={{ position: "absolute", top: CONTENT_TOP + 28, bottom: CONTENT_BOTTOM, left: SIDE, right: SIDE, display: "grid", gridTemplateColumns: scene.visual ? ".92fr 1.08fr" : "1fr", alignItems: "center", gap: 74 }}>
      <TextBlock scene={scene} video={video} dark opening />
      {scene.visual && <div style={{ ...visualEntrance, height: "100%", minHeight: 0, display: "grid", placeItems: "center", color: palette.ink, background: palette.paper, padding: "18px 24px", boxShadow: "0 30px 90px rgba(0,0,0,.18)" }}><ConceptVisual visual={scene.visual} accent={video.accent} /></div>}
    </div>
  </SceneShell>;
};

const EditorialScene = ({ video, scene, sceneIndex }: { video: ConceptVideo; scene: ConceptScene; sceneIndex: number }) => {
  const visualEntrance = useEntrance(8);
  return <SceneShell video={video} sceneIndex={sceneIndex}>
    <div style={{ position: "absolute", top: CONTENT_TOP, bottom: CONTENT_BOTTOM, left: SIDE, right: SIDE, display: "grid", gridTemplateColumns: scene.visual ? ".82fr 1.18fr" : "1fr", alignItems: "center", gap: 68 }}>
      <TextBlock scene={scene} video={video} />
      {scene.visual && <div style={{ ...visualEntrance, height: "100%", minWidth: 0, display: "grid", placeItems: "center" }}><ConceptVisual visual={scene.visual} accent={video.accent} /></div>}
    </div>
  </SceneShell>;
};

const DiagramScene = ({ video, scene, sceneIndex }: { video: ConceptVideo; scene: ConceptScene; sceneIndex: number }) => (
  <SceneShell video={video} sceneIndex={sceneIndex}>
    <div style={{ position: "absolute", top: CONTENT_TOP, bottom: CONTENT_BOTTOM, left: SIDE, right: SIDE, display: "grid", gridTemplateRows: "auto 1fr", gap: 24 }}>
      <div style={{ ...useEntrance(), display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "end" }}>
        <div><Eyebrow text={scene.display.eyebrow} accent={video.accent} /><h1 style={{ fontSize: titleSize(scene.display.title), lineHeight: .98, letterSpacing: "-.05em", margin: 0, fontWeight: 820 }}>{scene.display.title}</h1></div>
        {scene.display.body && <p style={{ margin: 0, color: palette.muted, fontSize: 30, lineHeight: 1.34 }}>{scene.display.body}</p>}
      </div>
      <div style={{ ...useEntrance(8), minHeight: 0, display: "grid", placeItems: "center" }}><ConceptVisual visual={scene.visual} accent={video.accent} /></div>
    </div>
  </SceneShell>
);

const EvidenceScene = ({ video, scene, sceneIndex }: { video: ConceptVideo; scene: ConceptScene; sceneIndex: number }) => (
  <SceneShell video={video} sceneIndex={sceneIndex}>
    <div style={{ position: "absolute", top: CONTENT_TOP, bottom: CONTENT_BOTTOM, left: SIDE, right: SIDE, display: "grid", gridTemplateColumns: ".62fr 1.38fr", alignItems: "stretch", gap: 54 }}>
      <div style={{ alignSelf: "center" }}><TextBlock scene={scene} video={video} /></div>
      <div style={{ ...useEntrance(7), minWidth: 0, minHeight: 0 }}><ConceptVisual visual={scene.visual} accent={video.accent} /></div>
    </div>
  </SceneShell>
);

const DashboardScene = ({ video, scene, sceneIndex }: { video: ConceptVideo; scene: ConceptScene; sceneIndex: number }) => (
  <SceneShell video={video} sceneIndex={sceneIndex}>
    <div style={{ position: "absolute", top: CONTENT_TOP, bottom: CONTENT_BOTTOM, left: SIDE, right: SIDE, display: "grid", gridTemplateRows: "auto 1fr", gap: 32 }}>
      <div style={{ display: "grid", gridTemplateColumns: ".8fr 1.2fr", gap: 60, alignItems: "end", ...useEntrance() }}>
        <div><Eyebrow text={scene.display.eyebrow} accent={palette.coral} /><h1 style={{ fontSize: titleSize(scene.display.title), lineHeight: .98, letterSpacing: "-.05em", margin: 0, fontWeight: 820 }}>{scene.display.title}</h1></div>
        {scene.display.body && <p style={{ margin: 0, color: palette.muted, fontSize: 30, lineHeight: 1.34 }}>{scene.display.body}</p>}
      </div>
      <div style={{ ...useEntrance(8), display: "grid", placeItems: "center", minHeight: 0 }}><ConceptVisual visual={scene.visual} accent={video.accent} /></div>
    </div>
  </SceneShell>
);

const SummaryScene = ({ video, scene, sceneIndex }: { video: ConceptVideo; scene: ConceptScene; sceneIndex: number }) => {
  const visualEntrance = useEntrance(8);
  return <SceneShell video={video} sceneIndex={sceneIndex} dark>
    <div style={{ position: "absolute", top: CONTENT_TOP + 32, bottom: CONTENT_BOTTOM, left: SIDE, right: SIDE, display: "grid", gridTemplateColumns: scene.visual ? ".9fr 1.1fr" : "1fr", alignItems: "center", gap: 78 }}>
      <TextBlock scene={scene} video={video} dark />
      {scene.visual && <div style={{ ...visualEntrance, color: palette.ink, display: "grid", placeItems: "center", background: palette.paper, padding: "30px 34px", boxShadow: "0 30px 90px rgba(0,0,0,.18)" }}><ConceptVisual visual={scene.visual} accent={video.accent} /></div>}
    </div>
  </SceneShell>;
};

const SceneRenderer = ({ video, scene, sceneIndex }: { video: ConceptVideo; scene: ConceptScene; sceneIndex: number }) => {
  switch (scene.layout) {
    case "opening": return <OpeningScene video={video} scene={scene} sceneIndex={sceneIndex} />;
    case "diagram": return <DiagramScene video={video} scene={scene} sceneIndex={sceneIndex} />;
    case "evidence": return <EvidenceScene video={video} scene={scene} sceneIndex={sceneIndex} />;
    case "dashboard": return <DashboardScene video={video} scene={scene} sceneIndex={sceneIndex} />;
    case "summary": return <SummaryScene video={video} scene={scene} sceneIndex={sceneIndex} />;
    default: return <EditorialScene video={video} scene={scene} sceneIndex={sceneIndex} />;
  }
};

const Captions = ({ cues }: { cues: ConceptTiming["cues"] }) => {
  const frame = useCurrentFrame();
  const cue = cues?.find((item) => frame >= item.startFrame && frame < item.endFrame);
  if (!cue) return null;
  return (
    <div style={{ position: "absolute", zIndex: 30, left: 110, right: 110, bottom: 24, minHeight: 94, display: "grid", placeItems: "center", color: palette.white, fontFamily: sans, fontSize: 36, lineHeight: 1.24, fontWeight: 700, textAlign: "center", whiteSpace: "pre-line" }}>
      <span style={{ background: "rgba(5,11,9,.91)", padding: "13px 22px 15px", boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone", boxShadow: "10px 0 rgba(5,11,9,.91), -10px 0 rgba(5,11,9,.91)" }}>{cue.text}</span>
    </div>
  );
};

export const ConceptLesson = ({
  video,
  timing,
  voiceId,
}: {
  video: ConceptVideo;
  timing: ConceptTiming;
  voiceId?: string;
}) => {
  const selectedVoiceId = voiceId ?? timing.defaultVoiceId ?? video.defaultVoiceId;
  const voiceTrack = timing.voiceTracks?.find((track) => track.voiceId === selectedVoiceId)
    ?? timing.voiceTracks?.find((track) => track.voiceId === timing.defaultVoiceId)
    ?? timing.voiceTracks?.[0];
  const audioScenes = voiceTrack?.scenes ?? timing.scenes;
  const cues = voiceTrack?.cues ?? timing.cues;

  return (
    <AbsoluteFill style={{ background: palette.paper }}>
      {timing.scenes.map((sceneTiming, index) => {
        const scene = video.scenes[index];
        const audioScene = audioScenes[index];
        if (!scene || !audioScene?.audioPath) return null;
        return (
          <Sequence key={scene.id} from={sceneTiming.startFrame} durationInFrames={sceneTiming.durationInFrames} premountFor={30}>
            <SceneRenderer video={video} scene={scene} sceneIndex={index} />
            <Audio src={staticFile(audioScene.audioPath)} />
          </Sequence>
        );
      })}
      <Captions cues={cues} />
    </AbsoluteFill>
  );
};
