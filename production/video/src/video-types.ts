export type SceneKind =
  | "opening"
  | "explanation"
  | "practice"
  | "evidence"
  | "quality-control"
  | "summary";

export type SceneLayout =
  | "opening"
  | "editorial"
  | "diagram"
  | "evidence"
  | "dashboard"
  | "summary";

export type VisualType =
  | "tool-map"
  | "learning-loop"
  | "route-map"
  | "terminal-anatomy"
  | "filesystem-tree"
  | "nifti-stack"
  | "bids-tree"
  | "image-evidence"
  | "metadata-stats"
  | "mask-measure"
  | "analysis-levels"
  | "glm"
  | "timing-strip"
  | "ev-columns"
  | "hrf-convolution"
  | "confound-separation"
  | "feat-chain"
  | "contrast-weights"
  | "comparison"
  | "checklist"
  | "code";

export interface VisualItem {
  label: string;
  detail?: string;
  value?: string;
  tone?: "accent" | "coral" | "blue" | "muted";
}

export interface VisualSpec {
  type: VisualType;
  asset?: string;
  assetSecondary?: string;
  caption?: string;
  code?: string;
  output?: string;
  items?: VisualItem[];
  highlight?: number;
}

export interface InternalSourceRef {
  type: "lecture" | "course-lab" | "repository-asset" | "official-docs";
  deck?: string;
  slides?: number[];
  file?: string;
  section?: string;
  asset?: string;
  note?: string;
  visibility: "internal";
}

export interface DisplayCopy {
  eyebrow: string;
  title: string;
  body?: string;
  bullets?: string[];
}

export interface ConceptScene {
  id: string;
  kind: SceneKind;
  layout: SceneLayout;
  display: DisplayCopy;
  visual?: VisualSpec;
  narrationText: string;
  sourceRefs: InternalSourceRef[];
}

export interface ConceptVideo {
  slug: string;
  compositionId: string;
  courseSlug: string;
  courseTitle: string;
  courseLabel: string;
  catalogNumber: string;
  moduleTitle: string;
  lessonNumber: string;
  title: string;
  description: string;
  videoType: string;
  accent: string;
  defaultVoiceId: string;
  voiceIds: string[];
  fps: number;
  source: {
    repository: string;
    file: string;
    section: string;
    license: string;
    visibility: "internal";
  };
  scenes: ConceptScene[];
}

export interface CaptionCue {
  text: string;
  startFrame: number;
  endFrame: number;
  startSeconds?: number;
  endSeconds?: number;
}

export interface ConceptTiming {
  slug: string;
  totalFrames: number;
  totalSeconds: number;
  scenes: Array<{
    id: string;
    durationInFrames: number;
    startFrame: number;
    audioPath?: string;
  }>;
  cues?: CaptionCue[];
  defaultVoiceId?: string;
  voiceTracks?: Array<{
    voiceId: string;
    displayName: string;
    scenes: Array<{
      id: string;
      audioPath: string;
      durationInFrames: number;
      startFrame: number;
    }>;
    cues: CaptionCue[];
  }>;
}
