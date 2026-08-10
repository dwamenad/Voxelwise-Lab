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
import content from "../content/understanding-contrasts.json";
import timing from "../generated/understanding-contrasts.json";

const palette = {
  ink: "#10221d",
  muted: "#60716b",
  paper: "#f5f6ef",
  acid: "#dfff3f",
  white: "#ffffff",
  blue: "#5b7cfa",
  coral: "#ff7a62",
  line: "#d9ded5",
};

const sans = "Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const useEntrance = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame, fps, config: { damping: 18, stiffness: 110, mass: 0.8 } });
  return {
    opacity: interpolate(progress, [0, 1], [0, 1]),
    transform: `translateY(${interpolate(progress, [0, 1], [34, 0])}px)`,
  } satisfies CSSProperties;
};

const Grid = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        opacity: 0.45,
        backgroundImage: "linear-gradient(rgba(16,34,29,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(16,34,29,.055) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
        backgroundPosition: `${frame * 0.08}px ${frame * 0.04}px`,
      }}
    />
  );
};

const Brand = ({ dark = false }: { dark?: boolean }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, color: dark ? palette.white : palette.ink }}>
    <div style={{ width: 38, height: 38, borderRadius: 11, background: palette.acid, display: "grid", placeItems: "center", color: palette.ink, fontWeight: 900, fontSize: 15 }}>FA</div>
    <div style={{ fontSize: 18, fontWeight: 760, letterSpacing: "-.02em" }}>FSL Academy</div>
  </div>
);

const Progress = ({ sceneIndex }: { sceneIndex: number }) => (
  <div style={{ display: "flex", gap: 7 }}>
    {content.scenes.map((scene, index) => (
      <div key={scene.id} style={{ width: index === sceneIndex ? 48 : 13, height: 5, borderRadius: 9, background: index === sceneIndex ? palette.ink : "#cfd6cc" }} />
    ))}
  </div>
);

const SceneShell = ({ sceneIndex, children, dark = false }: { sceneIndex: number; children: ReactNode; dark?: boolean }) => (
  <AbsoluteFill style={{ background: dark ? palette.ink : palette.paper, color: dark ? palette.white : palette.ink, fontFamily: sans, overflow: "hidden" }}>
    {!dark && <Grid />}
    <div style={{ position: "absolute", top: 52, left: 72, right: 72, display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 5 }}>
      <Brand dark={dark} />
      <Progress sceneIndex={sceneIndex} />
    </div>
    {children}
    <div style={{ position: "absolute", left: 72, right: 72, bottom: 42, display: "flex", justifyContent: "space-between", color: dark ? "#a9bbb3" : palette.muted, fontSize: 15, letterSpacing: ".01em" }}>
      <span>First-level fMRI analysis with FEAT</span>
      <span>tubric/2026s-fmri-class · MIT</span>
    </div>
  </AbsoluteFill>
);

const Heading = ({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) => {
  const style = useEntrance();
  return (
    <div style={{ ...style, maxWidth: 890 }}>
      <div style={{ color: palette.blue, fontWeight: 800, fontSize: 18, letterSpacing: ".11em", textTransform: "uppercase", marginBottom: 22 }}>{eyebrow}</div>
      <h1 style={{ fontSize: 72, lineHeight: 0.98, letterSpacing: "-.055em", margin: 0, fontWeight: 780 }}>{title}</h1>
      {body && <p style={{ margin: "26px 0 0", color: palette.muted, fontSize: 25, lineHeight: 1.45, maxWidth: 760 }}>{body}</p>}
    </div>
  );
};

const Weight = ({ value, label, color }: { value: string; label: string; color: string }) => (
  <div style={{ width: 212, padding: "26px 28px", borderRadius: 24, background: palette.white, border: `1px solid ${palette.line}`, boxShadow: "0 20px 70px rgba(16,34,29,.08)" }}>
    <div style={{ fontSize: 62, fontWeight: 780, color, letterSpacing: "-.04em" }}>{value}</div>
    <div style={{ marginTop: 8, color: palette.muted, fontSize: 19 }}>{label}</div>
  </div>
);

const Matrix = ({ rows, highlighted = 0 }: { rows: Array<{ label: string; weights: string[] }>; highlighted?: number }) => (
  <div style={{ background: palette.white, borderRadius: 28, border: `1px solid ${palette.line}`, padding: 30, boxShadow: "0 26px 80px rgba(16,34,29,.09)", width: 600 }}>
    <div style={{ display: "grid", gridTemplateColumns: "1.45fr .55fr .55fr", gap: 12, color: palette.muted, fontSize: 16, fontWeight: 760, padding: "0 14px 12px" }}>
      <span>Hypothesis</span><span>Left</span><span>Right</span>
    </div>
    {rows.map((row, index) => (
      <div key={row.label} style={{ display: "grid", gridTemplateColumns: "1.45fr .55fr .55fr", gap: 12, alignItems: "center", padding: "15px 14px", borderRadius: 16, background: index === highlighted ? "#eef5d1" : "transparent", fontSize: 20 }}>
        <strong>{row.label}</strong>
        {row.weights.map((weight, weightIndex) => <span key={`${row.label}-${weightIndex}`} style={{ fontSize: 30, fontWeight: 760, color: weight.startsWith("−") || weight.startsWith("-") ? palette.coral : palette.blue }}>{weight}</span>)}
      </div>
    ))}
  </div>
);

const OpeningScene = () => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(frame / 15) * 0.025;
  return (
    <SceneShell sceneIndex={0} dark>
      <div style={{ position: "absolute", inset: "176px 72px 90px", display: "grid", gridTemplateColumns: "1.05fr .95fr", alignItems: "center", gap: 90 }}>
        <div style={useEntrance()}>
          <div style={{ color: palette.acid, fontSize: 18, fontWeight: 800, letterSpacing: ".13em", textTransform: "uppercase", marginBottom: 28 }}>FSL Academy · Concept video</div>
          <h1 style={{ fontSize: 102, lineHeight: 0.9, letterSpacing: "-.07em", margin: 0, maxWidth: 850 }}>A contrast is a question.</h1>
          <p style={{ color: "#b9c8c2", fontSize: 28, lineHeight: 1.4, maxWidth: 750, marginTop: 34 }}>Turn model estimates into a precise, reviewable hypothesis test.</p>
        </div>
        <div style={{ transform: `scale(${pulse})`, position: "relative", height: 620, display: "grid", placeItems: "center" }}>
          <div style={{ width: 480, height: 480, borderRadius: "50%", border: "1px solid rgba(223,255,63,.4)", display: "grid", placeItems: "center", boxShadow: "0 0 120px rgba(223,255,63,.12)" }}>
            <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 82, fontWeight: 700 }}>cᵀβ</div>
          </div>
          <div style={{ position: "absolute", top: 50, right: 20, padding: "17px 22px", border: "1px solid rgba(255,255,255,.18)", borderRadius: 16, background: "rgba(255,255,255,.06)", fontSize: 22 }}>[ 1, −1 ]</div>
          <div style={{ position: "absolute", bottom: 70, left: 0, padding: "17px 22px", border: "1px solid rgba(255,255,255,.18)", borderRadius: 16, background: "rgba(255,255,255,.06)", fontSize: 22 }}>Left &gt; Right</div>
        </div>
      </div>
    </SceneShell>
  );
};

const ModelScene = () => (
  <SceneShell sceneIndex={1}>
    <div style={{ position: "absolute", inset: "180px 72px 100px", display: "grid", gridTemplateColumns: ".9fr 1.1fr", alignItems: "center", gap: 90 }}>
      <Heading eyebrow="From model to hypothesis" title="FEAT estimates the model first" body="A contrast combines fitted coefficients. It does not refit the GLM." />
      <div style={{ display: "grid", gap: 24, justifyItems: "center", ...useEntrance() }}>
        <div style={{ display: "flex", gap: 20 }}><Weight value="β₁" label="Left EV estimate" color={palette.blue} /><Weight value="β₂" label="Right EV estimate" color={palette.coral} /></div>
        <div style={{ fontSize: 30, color: palette.muted }}>weighted by</div>
        <div style={{ display: "flex", gap: 18, alignItems: "center", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 54, fontWeight: 760 }}><span>[ 1, −1 ]</span><span style={{ color: palette.muted }}>×</span><span>[ β₁, β₂ ]</span></div>
        <div style={{ width: "100%", padding: "25px 34px", background: palette.ink, color: palette.white, borderRadius: 22, textAlign: "center", fontSize: 34, fontWeight: 720 }}>cope = β₁ − β₂</div>
      </div>
    </div>
  </SceneShell>
);

const BaselineScene = () => (
  <SceneShell sceneIndex={2}>
    <div style={{ position: "absolute", inset: "180px 72px 100px", display: "grid", gridTemplateColumns: ".92fr 1.08fr", alignItems: "center", gap: 84 }}>
      <Heading eyebrow="Two-condition example" title="Single-condition contrasts" body="Selecting one coefficient is different from comparing two coefficients." />
      <Matrix highlighted={0} rows={[
        { label: "Left vs baseline", weights: ["1", "0"] },
        { label: "Right vs baseline", weights: ["0", "1"] },
        { label: "Combined positive", weights: ["1", "1"] },
        { label: "Numerical average", weights: ["0.5", "0.5"] },
      ]} />
    </div>
  </SceneShell>
);

const DifferenceScene = () => (
  <SceneShell sceneIndex={3}>
    <div style={{ position: "absolute", inset: "180px 72px 100px", display: "grid", gridTemplateColumns: ".9fr 1.1fr", alignItems: "center", gap: 90 }}>
      <Heading eyebrow="Directional comparisons" title="Difference contrasts" body="The sign specifies which estimated effect is subtracted." />
      <div style={{ display: "grid", gap: 26, ...useEntrance() }}>
        <div style={{ borderRadius: 26, background: palette.white, border: `1px solid ${palette.line}`, padding: "30px 34px" }}>
          <div style={{ color: palette.muted, fontSize: 18, marginBottom: 18 }}>LEFT GREATER THAN RIGHT</div>
          <div style={{ display: "flex", alignItems: "center", gap: 28, fontSize: 42, fontWeight: 760 }}><span style={{ color: palette.blue }}>[ 1, −1 ]</span><span>→</span><span>βLeft − βRight</span></div>
        </div>
        <div style={{ borderRadius: 26, background: palette.white, border: `1px solid ${palette.line}`, padding: "30px 34px" }}>
          <div style={{ color: palette.muted, fontSize: 18, marginBottom: 18 }}>RIGHT GREATER THAN LEFT</div>
          <div style={{ display: "flex", alignItems: "center", gap: 28, fontSize: 42, fontWeight: 760 }}><span style={{ color: palette.coral }}>[ −1, 1 ]</span><span>→</span><span>βRight − βLeft</span></div>
        </div>
        <div style={{ borderLeft: `7px solid ${palette.acid}`, background: "#eef5d1", padding: "20px 26px", borderRadius: 10, fontSize: 23, lineHeight: 1.4 }}><strong>Negative weight ≠ deactivation.</strong> It means subtraction within this hypothesis.</div>
      </div>
    </div>
  </SceneShell>
);

const OrderScene = () => {
  const frame = useCurrentFrame();
  const wrongOpacity = interpolate(frame, [20, 44, 140, 162], [0, 1, 1, 0.28], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <SceneShell sceneIndex={4}>
      <div style={{ position: "absolute", inset: "180px 72px 100px", display: "grid", gridTemplateColumns: ".92fr 1.08fr", alignItems: "center", gap: 80 }}>
        <Heading eyebrow="The most common preventable error" title="Weights follow EV order" body="Labels do not rescue weights entered under the wrong columns." />
        <div style={{ display: "grid", gap: 20, ...useEntrance() }}>
          <div style={{ fontSize: 20, fontWeight: 760, color: palette.muted }}>ACTUAL COLUMN ORDER</div>
          <div style={{ display: "flex", gap: 18 }}><Weight value="EV1" label="Right" color={palette.coral} /><Weight value="EV2" label="Left" color={palette.blue} /></div>
          <div style={{ opacity: wrongOpacity, border: `2px solid ${palette.coral}`, background: "#fff4f0", padding: "24px 28px", borderRadius: 20, fontSize: 28, lineHeight: 1.35 }}>
            Named “Left &gt; Right” <strong style={{ color: palette.coral }}>[ 1, −1 ]</strong><br />actually tests <strong>Right &gt; Left</strong>.
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "center", color: palette.ink, fontSize: 23, fontWeight: 680 }}><span style={{ width: 30, height: 30, borderRadius: "50%", background: palette.acid, display: "grid", placeItems: "center" }}>✓</span>Point from each weight to its displayed EV name.</div>
        </div>
      </div>
    </SceneShell>
  );
};

const FeatScene = () => (
  <SceneShell sceneIndex={5}>
    <div style={{ position: "absolute", inset: "154px 72px 94px", display: "grid", gridTemplateColumns: ".72fr 1.28fr", alignItems: "center", gap: 58 }}>
      <Heading eyebrow="Inside FEAT" title="Name, enter, and verify" body="Use scientific labels, enter weights in displayed order, then inspect the design preview." />
      <div style={{ ...useEntrance(), background: palette.white, borderRadius: 28, padding: 18, border: `1px solid ${palette.line}`, boxShadow: "0 28px 90px rgba(16,34,29,.12)" }}>
        <Img src={staticFile("curriculum/feat-contrasts.png")} style={{ width: "100%", height: 670, objectFit: "contain", borderRadius: 18, background: "#e9ece7" }} />
        <div style={{ padding: "14px 8px 2px", color: palette.muted, fontSize: 16 }}>Real FEAT contrast configuration from the adapted source lab.</div>
      </div>
    </div>
  </SceneShell>
);

const OutputCard = ({ label, description, color }: { label: string; description: string; color: string }) => (
  <div style={{ flex: 1, minHeight: 180, background: palette.white, border: `1px solid ${palette.line}`, borderTop: `7px solid ${color}`, borderRadius: 22, padding: "25px 26px", boxShadow: "0 18px 60px rgba(16,34,29,.07)" }}>
    <div style={{ fontSize: 35, fontWeight: 780, marginBottom: 13 }}>{label}</div>
    <div style={{ color: palette.muted, fontSize: 19, lineHeight: 1.4 }}>{description}</div>
  </div>
);

const OutputsScene = () => (
  <SceneShell sceneIndex={6}>
    <div style={{ position: "absolute", inset: "170px 72px 100px", display: "grid", alignContent: "center", gap: 48 }}>
      <Heading eyebrow="What FEAT writes" title="Effect, uncertainty, and evidence" body="Related maps answer different questions. Do not report a z-statistic as effect size." />
      <div style={{ display: "flex", alignItems: "stretch", gap: 18, ...useEntrance() }}>
        <OutputCard label="cope" description="Weighted effect estimate: cᵀβ" color={palette.blue} />
        <div style={{ alignSelf: "center", fontSize: 36, color: palette.muted }}>+</div>
        <OutputCard label="varcope" description="Uncertainty in the contrast estimate" color={palette.coral} />
        <div style={{ alignSelf: "center", fontSize: 36, color: palette.muted }}>→</div>
        <OutputCard label="t / z" description="Standardized evidence for inference" color={palette.acid} />
        <div style={{ alignSelf: "center", fontSize: 36, color: palette.muted }}>→</div>
        <OutputCard label="thresholded" description="Display after the chosen correction" color={palette.ink} />
      </div>
    </div>
  </SceneShell>
);

const ChecklistScene = () => {
  const items = ["List EVs in matrix order", "State the scientific question", "Translate sentence ↔ weights", "Inspect design and contrast arrows", "Separate effect, uncertainty, and evidence"];
  const frame = useCurrentFrame();
  return (
    <SceneShell sceneIndex={7} dark>
      <div style={{ position: "absolute", inset: "170px 72px 100px", display: "grid", gridTemplateColumns: ".9fr 1.1fr", alignItems: "center", gap: 90 }}>
        <div style={useEntrance()}>
          <div style={{ color: palette.acid, fontSize: 18, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 24 }}>Pre-run quality control</div>
          <h1 style={{ fontSize: 80, lineHeight: 0.96, letterSpacing: "-.06em", margin: 0 }}>Make the model tell the same story.</h1>
          <p style={{ color: "#b7c7c0", fontSize: 25, lineHeight: 1.45, marginTop: 28 }}>If design, weights, and language agree, the contrast is ready to run.</p>
        </div>
        <div style={{ display: "grid", gap: 15 }}>
          {items.map((item, index) => {
            const reveal = interpolate(frame, [18 + index * 14, 32 + index * 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return <div key={item} style={{ opacity: reveal, transform: `translateX(${(1 - reveal) * 32}px)`, display: "flex", gap: 20, alignItems: "center", padding: "20px 24px", borderRadius: 17, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.11)", fontSize: 24 }}><span style={{ flex: "0 0 auto", width: 37, height: 37, borderRadius: "50%", background: palette.acid, color: palette.ink, display: "grid", placeItems: "center", fontSize: 18, fontWeight: 900 }}>{index + 1}</span>{item}</div>;
          })}
        </div>
      </div>
    </SceneShell>
  );
};

const sceneComponents = [OpeningScene, ModelScene, BaselineScene, DifferenceScene, OrderScene, FeatScene, OutputsScene, ChecklistScene];

const Captions = () => {
  const frame = useCurrentFrame();
  const cue = timing.cues.find((item) => frame >= item.startFrame && frame < item.endFrame);
  if (!cue) return null;
  return (
    <div style={{ position: "absolute", zIndex: 30, left: "50%", bottom: 92, transform: "translateX(-50%)", width: 1300, textAlign: "center", color: palette.white, fontFamily: sans, fontSize: 30, lineHeight: 1.32, fontWeight: 640, textShadow: "0 2px 12px rgba(0,0,0,.9)" }}>
      <span style={{ background: "rgba(5,11,9,.82)", padding: "8px 15px 10px", borderRadius: 8, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>{cue.text}</span>
    </div>
  );
};

export const UnderstandingContrasts = () => (
  <AbsoluteFill style={{ background: palette.paper }}>
    {timing.scenes.map((scene, index) => {
      const Scene = sceneComponents[index];
      if (!Scene) return null;
      return (
        <Sequence key={scene.id} from={scene.startFrame} durationInFrames={scene.durationInFrames} premountFor={30}>
          <Scene />
          <Audio src={staticFile(scene.audioPath)} />
        </Sequence>
      );
    })}
    <Captions />
  </AbsoluteFill>
);
