import type { CSSProperties, ReactNode } from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export interface ConceptScene {
  id: string;
  kind: "opening" | "explanation" | "practice" | "evidence" | "quality-control" | "summary";
  display: {
    eyebrow: string;
    title: string;
    body?: string;
    bullets?: string[];
    code?: string;
    output?: string;
    image?: string;
    imageCaption?: string;
  };
  narration: string;
}

export interface ConceptVideo {
  slug: string;
  compositionId: string;
  courseTitle: string;
  courseLabel: string;
  catalogNumber: string;
  moduleTitle: string;
  lessonNumber: string;
  title: string;
  description: string;
  videoType: string;
  accent: string;
  source: { repository: string; file: string; section: string; license: string };
  scenes: ConceptScene[];
}

export interface ConceptTiming {
  slug: string;
  totalFrames: number;
  totalSeconds: number;
  scenes: Array<{
    id: string;
    audioPath: string;
    durationInFrames: number;
    startFrame: number;
  }>;
  cues: Array<{ text: string; startFrame: number; endFrame: number }>;
}

const palette = {
  ink: "#10221d",
  muted: "#62736d",
  paper: "#f5f6ef",
  white: "#ffffff",
  line: "#d9ded5",
  blue: "#5b7cfa",
  coral: "#ff7a62",
};

const sans = "Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const mono = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";

const useEntrance = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 20, stiffness: 105, mass: 0.85 } });
  return {
    opacity: interpolate(progress, [0, 1], [0, 1]),
    transform: `translateY(${interpolate(progress, [0, 1], [32, 0])}px)`,
  } satisfies CSSProperties;
};

const Grid = ({ dark = false }: { dark?: boolean }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        opacity: dark ? 0.14 : 0.42,
        backgroundImage: `linear-gradient(${dark ? "rgba(255,255,255,.08)" : "rgba(16,34,29,.055)"} 1px, transparent 1px), linear-gradient(90deg, ${dark ? "rgba(255,255,255,.08)" : "rgba(16,34,29,.055)"} 1px, transparent 1px)`,
        backgroundSize: "80px 80px",
        backgroundPosition: `${frame * 0.06}px ${frame * 0.035}px`,
      }}
    />
  );
};

const Brand = ({ dark, accent }: { dark: boolean; accent: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, color: dark ? palette.white : palette.ink }}>
    <div style={{ width: 38, height: 38, borderRadius: 11, background: accent, display: "grid", placeItems: "center", color: palette.ink, fontWeight: 900, fontSize: 15 }}>FA</div>
    <div style={{ fontSize: 18, fontWeight: 760, letterSpacing: "-.02em" }}>FSL Academy</div>
  </div>
);

const Progress = ({ count, active, dark, accent }: { count: number; active: number; dark: boolean; accent: string }) => (
  <div style={{ display: "flex", gap: 7 }}>
    {Array.from({ length: count }, (_, index) => (
      <div
        key={index}
        style={{
          width: index === active ? 46 : 12,
          height: 5,
          borderRadius: 8,
          background: index === active ? accent : dark ? "rgba(255,255,255,.28)" : "#cfd6cc",
        }}
      />
    ))}
  </div>
);

const SceneShell = ({ video, sceneIndex, dark = false, children }: { video: ConceptVideo; sceneIndex: number; dark?: boolean; children: ReactNode }) => (
  <AbsoluteFill style={{ background: dark ? palette.ink : palette.paper, color: dark ? palette.white : palette.ink, fontFamily: sans, overflow: "hidden" }}>
    <Grid dark={dark} />
    <div style={{ position: "absolute", top: 52, left: 72, right: 72, display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 5 }}>
      <Brand dark={dark} accent={video.accent} />
      <Progress count={video.scenes.length} active={sceneIndex} dark={dark} accent={video.accent} />
    </div>
    {children}
    <div style={{ position: "absolute", left: 72, right: 72, bottom: 42, display: "flex", justifyContent: "space-between", color: dark ? "#a9bbb3" : palette.muted, fontSize: 15 }}>
      <span>{video.courseLabel} · {video.lessonNumber}</span>
      <span>{video.source.repository} · {video.source.license}</span>
    </div>
  </AbsoluteFill>
);

const Eyebrow = ({ children, accent }: { children: ReactNode; accent: string }) => (
  <div style={{ color: accent, fontWeight: 820, fontSize: 18, letterSpacing: ".115em", textTransform: "uppercase", marginBottom: 22 }}>{children}</div>
);

const titleSize = (title: string, opening = false) => {
  if (opening) return title.length > 44 ? 76 : title.length > 30 ? 88 : 100;
  return title.length > 56 ? 54 : title.length > 38 ? 62 : 72;
};

const BulletList = ({ bullets, accent, dark = false }: { bullets: string[]; accent: string; dark?: boolean }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "grid", gap: 14 }}>
      {bullets.slice(0, 5).map((item, index) => {
        const reveal = interpolate(frame, [16 + index * 10, 28 + index * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={`${item}-${index}`} style={{ opacity: reveal, transform: `translateX(${(1 - reveal) * 24}px)`, display: "flex", alignItems: "flex-start", gap: 16, fontSize: 22, lineHeight: 1.35, color: dark ? "#eef4f1" : palette.ink }}>
            <span style={{ flex: "0 0 auto", marginTop: 2, width: 30, height: 30, borderRadius: "50%", background: accent, color: palette.ink, display: "grid", placeItems: "center", fontWeight: 900, fontSize: 14 }}>{index + 1}</span>
            <span>{item}</span>
          </div>
        );
      })}
    </div>
  );
};

const OpeningScene = ({ video, scene, sceneIndex }: { video: ConceptVideo; scene: ConceptScene; sceneIndex: number }) => {
  const frame = useCurrentFrame();
  const orbit = frame * 0.22;
  return (
    <SceneShell video={video} sceneIndex={sceneIndex} dark>
      <div style={{ position: "absolute", inset: "164px 72px 96px", display: "grid", gridTemplateColumns: "1.08fr .92fr", alignItems: "center", gap: 84 }}>
        <div style={useEntrance()}>
          <Eyebrow accent={video.accent}>{scene.display.eyebrow}</Eyebrow>
          <h1 style={{ fontSize: titleSize(scene.display.title, true), lineHeight: 0.92, letterSpacing: "-.067em", margin: 0, maxWidth: 980 }}>{scene.display.title}</h1>
          {scene.display.body && <p style={{ color: "#b9c8c2", fontSize: 27, lineHeight: 1.42, maxWidth: 800, margin: "30px 0 0" }}>{scene.display.body}</p>}
        </div>
        <div style={{ position: "relative", height: 620, ...useEntrance(8) }}>
          <div style={{ position: "absolute", width: 440, height: 440, borderRadius: "50%", left: "50%", top: "50%", transform: `translate(-50%, -50%) rotate(${orbit}deg)`, border: `1px solid ${video.accent}66`, boxShadow: `0 0 130px ${video.accent}22` }} />
          <div style={{ position: "absolute", inset: 92, borderRadius: "50%", border: "1px solid rgba(255,255,255,.14)", display: "grid", placeItems: "center", textAlign: "center", padding: 78 }}>
            <div>
              <div style={{ color: video.accent, fontSize: 18, fontWeight: 800, marginBottom: 14 }}>{video.moduleTitle}</div>
              <div style={{ fontSize: 42, lineHeight: 1.05, fontWeight: 760 }}>{video.catalogNumber}</div>
            </div>
          </div>
          <div style={{ position: "absolute", top: 36, right: 12, padding: "16px 20px", border: "1px solid rgba(255,255,255,.16)", background: "rgba(255,255,255,.06)", borderRadius: 15, fontSize: 18 }}>Concept → evidence</div>
          <div style={{ position: "absolute", bottom: 46, left: 10, padding: "16px 20px", border: "1px solid rgba(255,255,255,.16)", background: "rgba(255,255,255,.06)", borderRadius: 15, fontSize: 18 }}>Explain → check → document</div>
        </div>
      </div>
    </SceneShell>
  );
};

const ImageCard = ({ scene }: { scene: ConceptScene }) => {
  if (!scene.display.image) return null;
  return (
    <div style={{ background: palette.white, border: `1px solid ${palette.line}`, borderRadius: 26, padding: 16, boxShadow: "0 28px 85px rgba(16,34,29,.12)" }}>
      <Img src={staticFile(scene.display.image.replace(/^\//, ""))} style={{ width: "100%", height: 465, objectFit: "contain", borderRadius: 16, background: "#e8ece7" }} />
      {scene.display.imageCaption && <div style={{ color: palette.muted, fontSize: 15, lineHeight: 1.35, padding: "13px 7px 2px" }}>{scene.display.imageCaption}</div>}
    </div>
  );
};

const CodeCard = ({ code, output, accent }: { code?: string; output?: string; accent: string }) => {
  if (!code && !output) return null;
  return (
    <div style={{ background: "#101b18", color: "#eaf0ed", borderRadius: 24, overflow: "hidden", boxShadow: "0 26px 80px rgba(16,34,29,.18)" }}>
      <div style={{ height: 46, display: "flex", alignItems: "center", gap: 8, padding: "0 18px", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
        {[palette.coral, "#ffd166", accent].map((color) => <span key={color} style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />)}
        <span style={{ marginLeft: 10, color: "#9db0a8", fontSize: 14 }}>FSL-enabled terminal</span>
      </div>
      {code && <pre style={{ margin: 0, padding: "25px 28px", whiteSpace: "pre-wrap", fontFamily: mono, fontSize: 21, lineHeight: 1.5, color: "#eef5f1" }}><span style={{ color: accent }}>$ </span>{code}</pre>}
      {output && <pre style={{ margin: 0, padding: "20px 28px 25px", whiteSpace: "pre-wrap", fontFamily: mono, fontSize: 19, lineHeight: 1.45, color: "#b7c8c1", borderTop: "1px solid rgba(255,255,255,.08)" }}>{output}</pre>}
    </div>
  );
};

const StandardScene = ({ video, scene, sceneIndex }: { video: ConceptVideo; scene: ConceptScene; sceneIndex: number }) => {
  const isSummary = scene.kind === "summary";
  const isQuality = scene.kind === "quality-control";
  const hasVisual = Boolean(scene.display.image || scene.display.code || scene.display.output || scene.display.bullets?.length);
  const titleEntrance = useEntrance();
  const visualEntrance = useEntrance(8);
  return (
    <SceneShell video={video} sceneIndex={sceneIndex} dark={isSummary}>
      <div style={{ position: "absolute", inset: "158px 72px 96px", display: "grid", gridTemplateColumns: hasVisual ? ".86fr 1.14fr" : "1fr", alignItems: "center", gap: 70 }}>
        <div style={{ ...titleEntrance, maxWidth: hasVisual ? 760 : 1120 }}>
          <Eyebrow accent={isQuality ? palette.coral : video.accent}>{scene.display.eyebrow}</Eyebrow>
          <h1 style={{ fontSize: titleSize(scene.display.title), lineHeight: 0.98, letterSpacing: "-.055em", margin: 0, color: isSummary ? palette.white : palette.ink }}>{scene.display.title}</h1>
          {scene.display.body && <p style={{ margin: "27px 0 0", color: isSummary ? "#b9c8c2" : palette.muted, fontSize: 24, lineHeight: 1.45 }}>{scene.display.body}</p>}
          {isQuality && <div style={{ width: 104, height: 7, borderRadius: 7, background: palette.coral, marginTop: 30 }} />}
        </div>
        {hasVisual && (
          <div style={{ display: "grid", gap: 22, ...visualEntrance }}>
            {scene.display.image && <ImageCard scene={scene} />}
            {!scene.display.image && (scene.display.code || scene.display.output) && <CodeCard code={scene.display.code} output={scene.display.output} accent={video.accent} />}
            {!scene.display.image && !scene.display.code && !scene.display.output && scene.display.bullets && (
              <div style={{ background: isSummary ? "rgba(255,255,255,.07)" : palette.white, border: `1px solid ${isSummary ? "rgba(255,255,255,.12)" : palette.line}`, borderRadius: 26, padding: "30px 32px", boxShadow: isSummary ? "none" : "0 24px 75px rgba(16,34,29,.09)" }}>
                <BulletList bullets={scene.display.bullets} accent={video.accent} dark={isSummary} />
              </div>
            )}
            {(scene.display.image || scene.display.code || scene.display.output) && scene.display.bullets && <BulletList bullets={scene.display.bullets} accent={video.accent} dark={isSummary} />}
          </div>
        )}
      </div>
    </SceneShell>
  );
};

const Captions = ({ timing }: { timing: ConceptTiming }) => {
  const frame = useCurrentFrame();
  const cue = timing.cues.find((item) => frame >= item.startFrame && frame < item.endFrame);
  if (!cue) return null;
  return (
    <div style={{ position: "absolute", zIndex: 30, left: "50%", bottom: 91, transform: "translateX(-50%)", width: 1340, textAlign: "center", color: palette.white, fontFamily: sans, fontSize: 29, lineHeight: 1.32, fontWeight: 640, textShadow: "0 2px 12px rgba(0,0,0,.9)" }}>
      <span style={{ background: "rgba(5,11,9,.84)", padding: "8px 15px 10px", borderRadius: 8, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>{cue.text}</span>
    </div>
  );
};

export const ConceptLesson = ({ video, timing }: { video: ConceptVideo; timing: ConceptTiming }) => (
  <AbsoluteFill style={{ background: palette.paper }}>
    {timing.scenes.map((sceneTiming, index) => {
      const scene = video.scenes[index];
      if (!scene) return null;
      return (
        <Sequence key={scene.id} from={sceneTiming.startFrame} durationInFrames={sceneTiming.durationInFrames} premountFor={30}>
          {scene.kind === "opening" ? <OpeningScene video={video} scene={scene} sceneIndex={index} /> : <StandardScene video={video} scene={scene} sceneIndex={index} />}
          <Audio src={staticFile(sceneTiming.audioPath)} />
        </Sequence>
      );
    })}
    <Captions timing={timing} />
  </AbsoluteFill>
);
