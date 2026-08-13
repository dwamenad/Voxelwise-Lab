export type VideoProvider = "youtube" | "vimeo" | "mux" | "local" | "external";

export type VideoType =
  | "concept"
  | "walkthrough"
  | "quality-control"
  | "troubleshooting"
  | "summary";

export type ProductionStatus = "planned" | "recorded" | "published";

export type NarrationVoiceId = "daniel" | "samantha" | "tessa" | "karen" | "rishi";

export interface TranscriptCue {
  startSeconds: number;
  endSeconds: number;
  text: string;
}

export interface VideoVoiceVariant {
  voiceId: NarrationVoiceId;
  status: ProductionStatus;
  provider?: VideoProvider;
  videoId?: string | null;
  url?: string;
  captionsPath?: string;
  durationSeconds?: number;
}

export type LessonBlock =
  | { type: "text"; body: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | {
      type: "video";
      videoType: VideoType;
      title: string;
      provider: VideoProvider;
      videoId: string | null;
      url?: string;
      durationMinutes: number;
      status: ProductionStatus;
      captionsPath?: string;
      transcript: string;
      defaultVoiceId?: NarrationVoiceId;
      voiceVariants?: VideoVoiceVariant[];
      transcriptCues?: TranscriptCue[];
    }
  | { type: "image"; src: string; alt: string; caption?: string }
  | {
      type: "command";
      command: string;
      language?: "bash" | "text";
      filename?: string;
      explanation: string;
      breakdown?: { token: string; meaning: string }[];
    }
  | {
      type: "callout";
      variant: "note" | "warning" | "quality-control" | "desktop";
      title: string;
      body: string;
    }
  | { type: "concept"; title: string; body: string; terms?: string[] }
  | { type: "neurodesk-task"; title: string; steps: string[]; command?: string }
  | { type: "expected-output"; title: string; output: string; explanation: string }
  | { type: "troubleshooting"; title: string; body: string; command?: string }
  | {
      type: "download";
      title: string;
      format: string;
      size?: string;
      href: string;
      available: boolean;
    }
  | { type: "self-check"; question: string; answer: string }
  | { type: "summary"; points: string[] };

export interface LessonProductionMetadata {
  narrationScriptPath?: string;
  videoStoryboardPath?: string;
  sourceLab?: string;
  sourceSection?: string;
  scientificReviewStatus?: "pending" | "approved";
  videoStatus?: ProductionStatus;
}

export interface Lesson {
  id: string;
  slug: string;
  number: string;
  title: string;
  description: string;
  durationMinutes: number;
  objectives: string[];
  blocks: LessonBlock[];
  production?: LessonProductionMetadata;
}

export interface CourseModule {
  id: string;
  number: number;
  title: string;
  description?: string;
  lessons: Lesson[];
}

export interface CourseResource {
  id: string;
  title: string;
  description: string;
  format: string;
  size?: string;
  href: string;
  available: boolean;
}

export interface Course {
  id: string;
  slug: string;
  catalogNumber: string;
  title: string;
  shortTitle: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  status: "available" | "outline";
  duration: string;
  prerequisites: string[];
  objectives: string[];
  requirements: string[];
  neurodeskRequired: boolean;
  accent: string;
  sourceLabs: string[];
  modules: CourseModule[];
  resources: CourseResource[];
}

export interface GlossaryTerm {
  term: string;
  slug: string;
  definition: string;
  relatedCourseSlugs: string[];
}

export interface TroubleshootingArticle {
  id: string;
  category: "Neurodesk" | "Linux" | "DataLad" | "FEAT" | "FSLEyes" | "fMRIPrep";
  title: string;
  symptom: string;
  resolution: string;
  commands?: string[];
  tags: string[];
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  lastAccessedAt: string;
}

export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  completed: boolean;
  completedAt: string | null;
  lastViewedAt: string;
}
