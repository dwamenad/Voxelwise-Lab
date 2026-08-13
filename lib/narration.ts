import voiceRegistryJson from "@/production/video/config/voices.json";
import type { ProductionStatus, VideoProvider } from "@/lib/types";

export type NarrationVoiceId = "daniel" | "samantha" | "tessa" | "karen" | "rishi";

export interface NarrationVoice {
  id: NarrationVoiceId;
  engineVoice: string;
  displayName: string;
  accent: string;
  locale: string;
  speechRate: number;
  description: string;
}

export interface MediaPreferences {
  version: 1;
  voiceId: NarrationVoiceId;
  playbackRate: number;
  captionsEnabled: boolean;
}

export const MEDIA_PREFERENCES_KEY = "voxelwise-media-preferences-v1";
export const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 1.75, 2] as const;
export const NARRATION_VOICES = voiceRegistryJson.voices as NarrationVoice[];
export const DEFAULT_VOICE_ID = voiceRegistryJson.defaultVoiceId as NarrationVoiceId;
export const DEFAULT_MEDIA_PREFERENCES: MediaPreferences = {
  version: 1,
  voiceId: DEFAULT_VOICE_ID,
  playbackRate: 1,
  captionsEnabled: true,
};

const voiceIds = new Set(NARRATION_VOICES.map((voice) => voice.id));

export const isNarrationVoiceId = (value: unknown): value is NarrationVoiceId =>
  typeof value === "string" && voiceIds.has(value as NarrationVoiceId);

export const getNarrationVoice = (voiceId: NarrationVoiceId) =>
  NARRATION_VOICES.find((voice) => voice.id === voiceId) ?? NARRATION_VOICES[0];

export const getVoicePreviewUrl = (voiceId: NarrationVoiceId) => {
  const voice = getNarrationVoice(voiceId);
  return `/voice-previews/${voice.id}-balanced-${voice.speechRate}wpm.m4a`;
};

export const parseMediaPreferences = (value: string | null): MediaPreferences => {
  if (!value) return DEFAULT_MEDIA_PREFERENCES;
  try {
    const parsed = JSON.parse(value) as Partial<MediaPreferences>;
    return {
      version: 1,
      voiceId: isNarrationVoiceId(parsed.voiceId) ? parsed.voiceId : DEFAULT_VOICE_ID,
      playbackRate: PLAYBACK_RATES.includes(parsed.playbackRate as (typeof PLAYBACK_RATES)[number])
        ? (parsed.playbackRate as number)
        : 1,
      captionsEnabled: typeof parsed.captionsEnabled === "boolean" ? parsed.captionsEnabled : true,
    };
  } catch {
    return DEFAULT_MEDIA_PREFERENCES;
  }
};

export const createPlannedVoiceVariants = (slug: string) =>
  NARRATION_VOICES.map((voice) => ({
    voiceId: voice.id,
    status: "planned" as ProductionStatus,
    provider: "local" as VideoProvider,
    videoId: null,
    captionsPath: `/production/captions/${slug}/${voice.id}.vtt`,
  }));
