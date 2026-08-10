import type { CSSProperties } from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import type { VisualItem, VisualSpec } from "../video-types";

export const palette = {
  ink: "#10221d",
  muted: "#64736d",
  paper: "#f5f6ef",
  paperDeep: "#e9ede4",
  white: "#ffffff",
  line: "#cfd7ce",
  blue: "#5578f7",
  coral: "#f06f58",
  amber: "#ffbf69",
};

export const sans = "Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
export const mono = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";

const tone = (item: VisualItem, accent: string) => {
  if (item.tone === "coral") return palette.coral;
  if (item.tone === "blue") return palette.blue;
  if (item.tone === "muted") return palette.muted;
  return accent;
};

const revealStyle = (frame: number, index: number): CSSProperties => {
  const progress = interpolate(frame, [10 + index * 8, 24 + index * 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return { opacity: progress, transform: `translateY(${(1 - progress) * 18}px)` };
};

const Arrow = ({ color = palette.muted }: { color?: string }) => (
  <div style={{ color, fontSize: 36, lineHeight: 1, fontWeight: 760 }}>→</div>
);

const Label = ({ children, color = palette.muted }: { children: string; color?: string }) => (
  <div style={{ color, fontSize: 24, lineHeight: 1.25, fontWeight: 720 }}>{children}</div>
);

const StepRow = ({ items, accent }: { items: VisualItem[]; accent: string }) => {
  const frame = useCurrentFrame();
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, width: "100%" }}>
    {items.map((item, index) => (
      <div key={`${item.label}-${index}`} style={{ display: "contents" }}>
        <div style={{ ...revealStyle(frame, index), minWidth: 150, textAlign: "center" }}>
          <div style={{ width: 58, height: 8, borderRadius: 9, background: tone(item, accent), margin: "0 auto 18px" }} />
          <div style={{ fontSize: 30, fontWeight: 790, lineHeight: 1.05 }}>{item.label}</div>
          {item.detail && <div style={{ color: palette.muted, fontSize: 20, lineHeight: 1.3, marginTop: 10 }}>{item.detail}</div>}
        </div>
        {index < items.length - 1 && <Arrow color="#9aa8a1" />}
      </div>
    ))}
  </div>;
};

const ToolMap = ({ items, accent }: { items: VisualItem[]; accent: string }) => {
  const frame = useCurrentFrame();
  return <div style={{ position: "relative", width: 850, height: 600 }}>
    <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
      <div style={{ width: 230, height: 230, borderRadius: "50%", background: palette.ink, color: palette.white, display: "grid", placeItems: "center", fontSize: 58, fontWeight: 830, boxShadow: `0 0 0 18px ${accent}33` }}>FSL</div>
    </div>
    {items.slice(0, 5).map((item, index) => {
      const positions = [
        { left: 30, top: 40 },
        { right: 25, top: 40 },
        { right: 0, bottom: 40 },
        { left: 0, bottom: 40 },
        { left: 320, bottom: 0 },
      ];
      return (
        <div key={item.label} style={{ position: "absolute", ...positions[index], width: 210, ...revealStyle(frame, index) }}>
          <div style={{ borderTop: `7px solid ${tone(item, accent)}`, paddingTop: 14 }}>
            <div style={{ fontSize: 29, fontWeight: 800 }}>{item.label}</div>
            <div style={{ color: palette.muted, fontSize: 20, lineHeight: 1.25, marginTop: 6 }}>{item.detail}</div>
          </div>
        </div>
      );
    })}
  </div>;
};

const RouteMap = ({ items, accent }: { items: VisualItem[]; accent: string }) => {
  const frame = useCurrentFrame();
  return <div style={{ width: 820, display: "grid", gap: 28 }}>
    {items.map((item, index) => (
      <div key={item.label} style={{ ...revealStyle(frame, index), display: "grid", gridTemplateColumns: "66px 1fr", gap: 22, alignItems: "center", borderBottom: index === items.length - 1 ? "none" : `1px solid ${palette.line}`, paddingBottom: 24 }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: index === 0 ? accent : palette.paperDeep, display: "grid", placeItems: "center", fontSize: 25, fontWeight: 840 }}>{index + 1}</div>
        <div>
          <div style={{ fontSize: 32, fontWeight: 800 }}>{item.label}</div>
          {item.detail && <div style={{ color: palette.muted, fontSize: 23, marginTop: 5 }}>{item.detail}</div>}
        </div>
      </div>
    ))}
  </div>;
};

const TerminalAnatomy = ({ visual, accent }: { visual: VisualSpec; accent: string }) => {
  const frame = useCurrentFrame();
  const items = visual.items ?? [];
  return (
    <div style={{ width: 900, borderRadius: 24, overflow: "hidden", background: "#0f1b18", color: palette.white, boxShadow: "0 28px 80px rgba(16,34,29,.18)" }}>
      <div style={{ height: 54, borderBottom: "1px solid rgba(255,255,255,.1)", display: "flex", alignItems: "center", padding: "0 24px", gap: 10 }}>
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: palette.coral }} />
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: palette.amber }} />
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: accent }} />
        <span style={{ color: "#9fb0aa", marginLeft: 12, fontSize: 18 }}>FSL terminal</span>
      </div>
      <div style={{ padding: "42px 48px 36px", fontFamily: mono }}>
        <div style={{ fontSize: 42, lineHeight: 1.5 }}>
          <span style={{ color: accent }}>$ </span>
          {items.map((item, index) => (
            <span key={item.label} style={{ color: tone(item, accent), fontWeight: 760, ...revealStyle(frame, index) }}>{item.value ?? item.label}{index < items.length - 1 ? " " : ""}</span>
          ))}
        </div>
        <div style={{ marginTop: 32, display: "flex", gap: 42 }}>
          {items.map((item, index) => (
            <div key={item.label} style={{ ...revealStyle(frame, index), flex: 1 }}>
              <div style={{ height: 5, background: tone(item, accent), marginBottom: 12 }} />
              <div style={{ color: "#e8f0ec", fontFamily: sans, fontSize: 23, fontWeight: 760 }}>{item.label}</div>
              {item.detail && <div style={{ color: "#9fb0aa", fontFamily: sans, fontSize: 19, marginTop: 7 }}>{item.detail}</div>}
            </div>
          ))}
        </div>
        {visual.output && <pre style={{ margin: "34px 0 0", color: "#b6c5bf", fontSize: 22, lineHeight: 1.45, whiteSpace: "pre-wrap" }}>{visual.output}</pre>}
      </div>
    </div>
  );
};

const FilesystemTree = ({ items, accent }: { items: VisualItem[]; accent: string }) => {
  const frame = useCurrentFrame();
  return <div style={{ width: 840, fontFamily: mono, fontSize: 29, lineHeight: 1.65 }}>
    {items.map((item, index) => (
      <div key={item.label} style={{ ...revealStyle(frame, index), paddingLeft: index * 56, color: index === items.length - 1 ? palette.ink : palette.muted }}>
        <span style={{ color: index === items.length - 1 ? accent : "#9aa8a1" }}>{index === items.length - 1 ? "●" : "└─"}</span> {item.label}
        {item.detail && <span style={{ fontFamily: sans, fontSize: 21, marginLeft: 18, color: palette.muted }}>← {item.detail}</span>}
      </div>
    ))}
  </div>;
};

const NiftiStack = ({ accent }: { accent: string }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ width: 880, height: 560, position: "relative" }}>
      {Array.from({ length: 5 }, (_, index) => {
        const reveal = interpolate(frame, [8 + index * 7, 21 + index * 7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return <div key={index} style={{ position: "absolute", width: 350, height: 350, left: 70 + index * 72, top: 95 - index * 12, border: `3px solid ${index === 0 ? accent : palette.ink}`, background: `rgba(85,120,247,${0.035 + index * 0.018})`, transform: `translateX(${(1 - reveal) * 35}px)`, opacity: reveal }} />;
      })}
      <div style={{ position: "absolute", left: 108, top: 137, display: "grid", gridTemplateColumns: "repeat(5, 40px)", gridTemplateRows: "repeat(5, 40px)", gap: 2 }}>
        {Array.from({ length: 25 }, (_, index) => <span key={index} style={{ border: "1px solid rgba(16,34,29,.23)", background: index === 12 ? accent : "transparent" }} />)}
      </div>
      <div style={{ position: "absolute", bottom: 22, left: 74, right: 35, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Label color={palette.ink}>voxel → slice → volume → time</Label>
        <div style={{ color: palette.muted, fontSize: 22 }}>4-D NIfTI</div>
      </div>
    </div>
  );
};

const BidsTree = ({ items, accent }: { items: VisualItem[]; accent: string }) => {
  const frame = useCurrentFrame();
  return <div style={{ width: 900, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 44 }}>
    <div style={{ fontFamily: mono, fontSize: 26, lineHeight: 1.6 }}>
      <div style={{ fontWeight: 800, color: palette.ink }}>study/</div>
      <div style={{ paddingLeft: 34 }}>sub-01/</div>
      <div style={{ paddingLeft: 70 }}>anat/</div>
      <div style={{ paddingLeft: 104, color: palette.muted }}>sub-01_T1w.nii.gz</div>
      <div style={{ paddingLeft: 70 }}>func/</div>
      <div style={{ paddingLeft: 104, color: accent, fontWeight: 760 }}>sub-01_task-memory_run-01_bold.nii.gz</div>
      <div style={{ paddingLeft: 104, color: palette.muted }}>sub-01_task-memory_run-01_events.tsv</div>
    </div>
    <div style={{ display: "grid", gap: 17 }}>
      {items.map((item, index) => (
        <div key={item.label} style={{ ...revealStyle(frame, index), display: "grid", gridTemplateColumns: "120px 1fr", gap: 16, alignItems: "center" }}>
          <span style={{ background: index === 0 ? accent : palette.paperDeep, padding: "10px 12px", borderRadius: 8, fontFamily: mono, fontSize: 22, fontWeight: 780 }}>{item.value ?? item.label}</span>
          <span style={{ fontSize: 22, color: palette.muted }}>{item.detail}</span>
        </div>
      ))}
    </div>
  </div>;
};

const ImageEvidence = ({ visual, accent }: { visual: VisualSpec; accent: string }) => (
  <div style={{ width: "100%", height: "100%", display: "grid", gridTemplateRows: "1fr auto", gap: 16 }}>
    <div style={{ minHeight: 0, borderTop: `8px solid ${accent}`, background: "#e8ece7", overflow: "hidden", display: "grid", placeItems: "center" }}>
      {visual.asset && <Img src={staticFile(visual.asset.replace(/^\//, ""))} style={{ width: "100%", height: "100%", objectFit: "contain" }} />}
    </div>
    {visual.caption && <div style={{ color: palette.muted, fontSize: 22, lineHeight: 1.3 }}>{visual.caption}</div>}
  </div>
);

const MetadataStats = ({ items, accent }: { items: VisualItem[]; accent: string }) => {
  const frame = useCurrentFrame();
  return <div style={{ width: 900, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56 }}>
    {["Metadata", "Values"].map((heading, column) => (
      <div key={heading}>
        <div style={{ fontSize: 24, color: column === 0 ? palette.blue : accent, fontWeight: 820, textTransform: "uppercase", letterSpacing: ".09em", marginBottom: 24 }}>{heading}</div>
        {(column === 0 ? items.slice(0, 3) : items.slice(3)).map((item, index) => (
          <div key={item.label} style={{ ...revealStyle(frame, index + column * 3), borderBottom: `1px solid ${palette.line}`, padding: "15px 0", display: "flex", justifyContent: "space-between", gap: 30 }}>
            <span style={{ fontFamily: mono, fontSize: 24, fontWeight: 730 }}>{item.label}</span>
            <span style={{ color: palette.muted, fontSize: 23 }}>{item.value ?? item.detail}</span>
          </div>
        ))}
      </div>
    ))}
  </div>;
};

const MaskMeasure = ({ accent }: { accent: string }) => (
  <div style={{ width: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 42 }}>
    <div style={{ width: 220, height: 220, borderRadius: "48% 52% 44% 56%", border: `4px solid ${palette.ink}`, background: "radial-gradient(circle at 55% 50%, rgba(85,120,247,.18), transparent 55%)", display: "grid", placeItems: "center", fontSize: 28, fontWeight: 760 }}>4-D data</div>
    <Arrow />
    <div style={{ width: 220, height: 220, borderRadius: "50%", border: `4px dashed ${accent}`, background: `${accent}26`, display: "grid", placeItems: "center", fontSize: 28, fontWeight: 760 }}>mask</div>
    <Arrow />
    <svg width="250" height="220" viewBox="0 0 250 220">
      <polyline fill="none" stroke={palette.ink} strokeWidth="5" points="0,150 20,145 40,152 60,110 80,130 100,70 120,84 140,45 160,72 180,100 200,90 220,132 250,115" />
      <line x1="0" x2="250" y1="180" y2="180" stroke={palette.line} strokeWidth="2" />
    </svg>
  </div>
);

const AnalysisLevels = ({ items, accent }: { items: VisualItem[]; accent: string }) => {
  const frame = useCurrentFrame();
  return <div style={{ width: 900, display: "grid", gap: 22 }}>
    {items.map((item, index) => (
      <div key={item.label} style={{ ...revealStyle(frame, index), width: `${62 + index * 18}%`, margin: "0 auto", background: index === 0 ? accent : index === 1 ? "#dfe5fb" : palette.paperDeep, padding: "24px 30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 31, fontWeight: 820 }}>{item.label}</div>
        <div style={{ color: palette.muted, fontSize: 22 }}>{item.detail}</div>
      </div>
    ))}
  </div>;
};

const Glm = ({ accent }: { accent: string }) => {
  const frame = useCurrentFrame();
  return <div style={{ width: 920 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 34, fontFamily: "Georgia, serif", fontSize: 82, fontWeight: 700 }}>
      <span style={{ color: palette.blue }}>Y</span><span>=</span><span style={{ color: accent }}>X</span><span style={{ color: palette.coral }}>β</span><span>+</span><span style={{ color: palette.muted }}>ε</span>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginTop: 42 }}>
      {[
        ["Observed BOLD", "measured time series", palette.blue],
        ["Design matrix", "expected patterns", accent],
        ["Estimates", "fitted contributions", palette.coral],
        ["Residuals", "unexplained structure", palette.muted],
      ].map(([label, detail, color], index) => (
        <div key={label} style={{ ...revealStyle(frame, index), borderTop: `7px solid ${color}`, paddingTop: 16 }}>
          <div style={{ fontSize: 27, fontWeight: 800 }}>{label}</div>
          <div style={{ color: palette.muted, fontSize: 20, marginTop: 7 }}>{detail}</div>
        </div>
      ))}
    </div>
  </div>;
};

const TimingStrip = ({ items, accent }: { items: VisualItem[]; accent: string }) => {
  const frame = useCurrentFrame();
  return <div style={{ width: 920 }}>
    <div style={{ height: 8, background: palette.line, marginBottom: 34 }} />
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(1, items.length)}, 1fr)`, gap: 15 }}>
      {items.map((item, index) => (
        <div key={item.label} style={{ ...revealStyle(frame, index) }}>
          <div style={{ height: item.value === "event" ? 74 : 132, background: tone(item, accent), marginBottom: 16 }} />
          <div style={{ fontSize: 25, fontWeight: 790 }}>{item.label}</div>
          {item.detail && <div style={{ color: palette.muted, fontSize: 20, marginTop: 5 }}>{item.detail}</div>}
        </div>
      ))}
    </div>
  </div>;
};

const EvColumns = ({ items, accent }: { items: VisualItem[]; accent: string }) => {
  const frame = useCurrentFrame();
  return <div style={{ width: 900, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 48 }}>
    {items.map((item, index) => (
      <div key={item.label} style={{ ...revealStyle(frame, index), width: 200 }}>
        <div style={{ height: 350, display: "flex", alignItems: "flex-end", gap: 7 }}>
          {Array.from({ length: 12 }, (_, row) => <span key={row} style={{ flex: 1, height: `${30 + ((row * 37 + index * 53) % 270)}px`, background: tone(item, accent), opacity: .3 + ((row + index) % 4) * .18 }} />)}
        </div>
        <div style={{ borderTop: `6px solid ${tone(item, accent)}`, paddingTop: 13, marginTop: 15, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, fontSize: 27, fontWeight: 800 }}>
          <span>{item.label}</span>
          {item.value && <span style={{ background: tone(item, accent), color: palette.ink, minWidth: 46, padding: "3px 10px", textAlign: "center", fontFamily: mono }}>{item.value}</span>}
        </div>
        {item.detail && <div style={{ color: palette.muted, fontSize: 20, marginTop: 7 }}>{item.detail}</div>}
      </div>
    ))}
  </div>;
};

const HrfConvolution = ({ accent }: { accent: string }) => (
  <div style={{ width: 940, display: "grid", gridTemplateColumns: "1fr 80px 1fr 80px 1.15fr", alignItems: "center", gap: 16 }}>
    <svg width="220" height="240" viewBox="0 0 220 240">
      {[32, 84, 146, 190].map((x, index) => <line key={x} x1={x} x2={x} y1={210} y2={index === 1 ? 55 : 115} stroke={accent} strokeWidth="9" />)}
      <line x1="0" x2="220" y1="210" y2="210" stroke={palette.line} strokeWidth="3" />
    </svg>
    <div style={{ fontSize: 52, textAlign: "center" }}>*</div>
    <svg width="220" height="240" viewBox="0 0 220 240">
      <path d="M0 205 C30 205 38 85 92 55 C145 25 150 160 185 176 C201 184 210 170 220 165" fill="none" stroke={palette.blue} strokeWidth="8" />
      <line x1="0" x2="220" y1="205" y2="205" stroke={palette.line} strokeWidth="3" />
    </svg>
    <div style={{ fontSize: 52, textAlign: "center" }}>=</div>
    <svg width="260" height="240" viewBox="0 0 260 240">
      <path d="M0 205 C20 205 25 130 58 95 C84 66 102 126 125 102 C145 82 158 35 186 55 C214 76 220 151 260 168" fill="none" stroke={palette.ink} strokeWidth="8" />
      <line x1="0" x2="260" y1="205" y2="205" stroke={palette.line} strokeWidth="3" />
    </svg>
    <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "220px 80px 220px 80px 260px", gap: 16, color: palette.muted, fontSize: 22, textAlign: "center", marginTop: -12 }}>
      <span>event timing</span><span /><span>HRF</span><span /><span>model predictor</span>
    </div>
  </div>
);

const ConfoundSeparation = ({ items, accent }: { items: VisualItem[]; accent: string }) => {
  const frame = useCurrentFrame();
  return <div style={{ width: 900, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 70 }}>
    {[items.slice(0, 2), items.slice(2)].map((group, column) => (
      <div key={column}>
        <div style={{ fontSize: 25, textTransform: "uppercase", letterSpacing: ".09em", fontWeight: 820, color: column === 0 ? accent : palette.coral, marginBottom: 24 }}>{column === 0 ? "Effect of interest" : "Nuisance variation"}</div>
        {group.map((item, index) => (
          <div key={item.label} style={{ ...revealStyle(frame, index + column * 2), display: "flex", alignItems: "center", gap: 18, padding: "18px 0", borderBottom: `1px solid ${palette.line}` }}>
            <span style={{ width: 18, height: 74, background: column === 0 ? accent : palette.coral }} />
            <div><div style={{ fontSize: 28, fontWeight: 790 }}>{item.label}</div><div style={{ color: palette.muted, fontSize: 20, marginTop: 4 }}>{item.detail}</div></div>
          </div>
        ))}
      </div>
    ))}
  </div>;
};

const FeatChain = ({ items, accent }: { items: VisualItem[]; accent: string }) => {
  const frame = useCurrentFrame();
  return <div style={{ width: 930, display: "grid", gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: 8, alignItems: "stretch" }}>
    {items.map((item, index) => (
      <div key={item.label} style={{ ...revealStyle(frame, index), position: "relative", padding: "28px 18px", background: index === items.length - 1 ? palette.ink : index === 0 ? `${accent}55` : palette.paperDeep, color: index === items.length - 1 ? palette.white : palette.ink }}>
        <div style={{ color: index === items.length - 1 ? accent : palette.muted, fontSize: 18, fontWeight: 820, marginBottom: 16 }}>0{index + 1}</div>
        <div style={{ fontSize: 28, fontWeight: 810, lineHeight: 1.05 }}>{item.label}</div>
        {item.detail && <div style={{ color: index === items.length - 1 ? "#bac8c2" : palette.muted, fontSize: 19, lineHeight: 1.3, marginTop: 12 }}>{item.detail}</div>}
        {index < items.length - 1 && <div style={{ position: "absolute", right: -18, top: "50%", zIndex: 2, color: palette.muted, fontSize: 30 }}>→</div>}
      </div>
    ))}
  </div>;
};

const ContrastWeights = ({ items, accent }: { items: VisualItem[]; accent: string }) => {
  const frame = useCurrentFrame();
  const directional = items.some((item) => item.value?.startsWith("["));
  if (directional) {
    return <div style={{ width: 900, display: "grid", gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: 34 }}>
      {items.map((item, index) => (
        <div key={item.label} style={{ ...revealStyle(frame, index), borderTop: `8px solid ${tone(item, accent)}`, padding: "26px 22px 22px", background: palette.white }}>
          <div style={{ color: tone(item, accent), fontFamily: mono, fontSize: 62, fontWeight: 850, letterSpacing: "-.04em", whiteSpace: "nowrap" }}>{item.value}</div>
          <div style={{ fontSize: 30, fontWeight: 820, marginTop: 20 }}>{item.label}</div>
          {item.detail && <div style={{ color: palette.muted, fontSize: 21, lineHeight: 1.3, marginTop: 8 }}>{item.detail}</div>}
        </div>
      ))}
    </div>;
  }
  return <div style={{ width: 900 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, fontFamily: mono, fontSize: 60, fontWeight: 820, whiteSpace: "nowrap" }}>
      <span style={{ color: accent }}>[ 1, −1 ]</span><span style={{ color: palette.muted }}>×</span><span>[ β₁, β₂ ]</span><span style={{ color: palette.muted }}>=</span><span style={{ color: palette.coral }}>β₁ − β₂</span>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(1, items.length)}, 1fr)`, gap: 28, marginTop: 58 }}>
      {items.map((item, index) => (
        <div key={item.label} style={{ ...revealStyle(frame, index), borderTop: `7px solid ${tone(item, accent)}`, paddingTop: 16 }}>
          <div style={{ fontSize: 27, fontWeight: 810 }}>{item.label}</div>
          {item.detail && <div style={{ color: palette.muted, fontSize: 21, lineHeight: 1.3, marginTop: 8 }}>{item.detail}</div>}
        </div>
      ))}
    </div>
  </div>;
};

const Comparison = ({ items, accent }: { items: VisualItem[]; accent: string }) => {
  const frame = useCurrentFrame();
  return <div style={{ width: 900, display: "grid", gridTemplateColumns: `repeat(${Math.max(1, Math.min(3, items.length))}, 1fr)`, gap: 34 }}>
    {items.map((item, index) => (
      <div key={item.label} style={{ ...revealStyle(frame, index), borderTop: `8px solid ${tone(item, accent)}`, paddingTop: 20 }}>
        {item.value && <div style={{ color: tone(item, accent), fontSize: 48, fontWeight: 830, marginBottom: 12 }}>{item.value}</div>}
        <div style={{ fontSize: 31, fontWeight: 810 }}>{item.label}</div>
        {item.detail && <div style={{ color: palette.muted, fontSize: 22, lineHeight: 1.35, marginTop: 10 }}>{item.detail}</div>}
      </div>
    ))}
  </div>;
};

const Checklist = ({ items, accent }: { items: VisualItem[]; accent: string }) => {
  const frame = useCurrentFrame();
  return <div style={{ width: 850, display: "grid", gap: 24 }}>
    {items.map((item, index) => (
      <div key={item.label} style={{ ...revealStyle(frame, index), display: "grid", gridTemplateColumns: "54px 1fr", alignItems: "start", gap: 20 }}>
        <span style={{ width: 46, height: 46, borderRadius: "50%", background: index === 0 ? accent : palette.paperDeep, display: "grid", placeItems: "center", fontSize: 22, fontWeight: 900 }}>✓</span>
        <div><div style={{ fontSize: 31, lineHeight: 1.12, fontWeight: 800 }}>{item.label}</div>{item.detail && <div style={{ color: palette.muted, fontSize: 22, lineHeight: 1.35, marginTop: 7 }}>{item.detail}</div>}</div>
      </div>
    ))}
  </div>;
};

const Code = ({ visual, accent }: { visual: VisualSpec; accent: string }) => (
  <div style={{ width: 900, background: "#0f1b18", color: palette.white, padding: "38px 44px", fontFamily: mono, boxShadow: "0 28px 80px rgba(16,34,29,.18)" }}>
    <pre style={{ margin: 0, fontSize: 31, lineHeight: 1.55, whiteSpace: "pre-wrap" }}><span style={{ color: accent }}>$ </span>{visual.code}</pre>
    {visual.output && <pre style={{ margin: "28px 0 0", paddingTop: 24, borderTop: "1px solid rgba(255,255,255,.1)", color: "#b6c5bf", fontSize: 24, lineHeight: 1.45, whiteSpace: "pre-wrap" }}>{visual.output}</pre>}
  </div>
);

export const ConceptVisual = ({ visual, accent }: { visual?: VisualSpec; accent: string }) => {
  if (!visual) return null;
  const items = visual.items ?? [];
  switch (visual.type) {
    case "tool-map": return <ToolMap items={items} accent={accent} />;
    case "learning-loop": return <StepRow items={items} accent={accent} />;
    case "route-map": return <RouteMap items={items} accent={accent} />;
    case "terminal-anatomy": return <TerminalAnatomy visual={visual} accent={accent} />;
    case "filesystem-tree": return <FilesystemTree items={items} accent={accent} />;
    case "nifti-stack": return <NiftiStack accent={accent} />;
    case "bids-tree": return <BidsTree items={items} accent={accent} />;
    case "image-evidence": return <ImageEvidence visual={visual} accent={accent} />;
    case "metadata-stats": return <MetadataStats items={items} accent={accent} />;
    case "mask-measure": return <MaskMeasure accent={accent} />;
    case "analysis-levels": return <AnalysisLevels items={items} accent={accent} />;
    case "glm": return <Glm accent={accent} />;
    case "timing-strip": return <TimingStrip items={items} accent={accent} />;
    case "ev-columns": return <EvColumns items={items} accent={accent} />;
    case "hrf-convolution": return <HrfConvolution accent={accent} />;
    case "confound-separation": return <ConfoundSeparation items={items} accent={accent} />;
    case "feat-chain": return <FeatChain items={items} accent={accent} />;
    case "contrast-weights": return <ContrastWeights items={items} accent={accent} />;
    case "comparison": return <Comparison items={items} accent={accent} />;
    case "checklist": return <Checklist items={items} accent={accent} />;
    case "code": return <Code visual={visual} accent={accent} />;
    default: return null;
  }
};
