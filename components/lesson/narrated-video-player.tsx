"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  Captions,
  ChevronDown,
  FileText,
  Play,
  Search,
  Volume2,
} from "lucide-react";
import {
  DEFAULT_MEDIA_PREFERENCES,
  DEFAULT_VOICE_ID,
  getNarrationVoice,
  getVoicePreviewUrl,
  MEDIA_PREFERENCES_KEY,
  NARRATION_VOICES,
  parseMediaPreferences,
  PLAYBACK_RATES,
  type MediaPreferences,
  type NarrationVoiceId,
} from "@/lib/narration";
import type { LessonBlock, VideoVoiceVariant } from "@/lib/types";

const videoLabels: Record<string, string> = {
  concept: "Concept",
  walkthrough: "Walkthrough",
  "quality-control": "Quality control",
  troubleshooting: "Troubleshooting",
  summary: "Summary",
};

const isDirectMedia = (url: string, provider: string) =>
  provider === "local" || /\.(?:mp4|webm|m3u8)(?:$|\?)/i.test(url);

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
};

type VideoBlock = Extract<LessonBlock, { type: "video" }>;

const normalizedVariants = (block: VideoBlock): VideoVoiceVariant[] => {
  if (block.voiceVariants?.length) {
    return block.voiceVariants.map((variant) =>
      variant.voiceId === (block.defaultVoiceId ?? DEFAULT_VOICE_ID)
        ? {
            provider: block.provider,
            videoId: block.videoId,
            url: block.url,
            captionsPath: block.captionsPath,
            ...variant,
          }
        : variant,
    );
  }
  return [
    {
      voiceId: block.defaultVoiceId ?? DEFAULT_VOICE_ID,
      status: block.status,
      provider: block.provider,
      videoId: block.videoId,
      url: block.url,
      captionsPath: block.captionsPath,
    },
  ];
};

export function NarratedVideoPlayer({ block }: { block: VideoBlock }) {
  const titleId = useId();
  const voiceLabelId = useId();
  const speedLabelId = useId();
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLAudioElement | null>(null);
  const pendingStateRef = useRef<{ time: number; paused: boolean } | null>(null);
  const [preferences, setPreferences] = useState<MediaPreferences>(DEFAULT_MEDIA_PREFERENCES);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [transcriptQuery, setTranscriptQuery] = useState("");
  const [previewStatus, setPreviewStatus] = useState("");
  const variants = normalizedVariants(block);
  const requestedVoiceId = preferences.voiceId;
  const requestedVariant = variants.find((variant) => variant.voiceId === requestedVoiceId);
  const defaultVoiceId = block.defaultVoiceId ?? DEFAULT_VOICE_ID;
  const defaultVariant = variants.find((variant) => variant.voiceId === defaultVoiceId);
  const playableVariant = requestedVariant?.status === "published" && requestedVariant.url
    ? requestedVariant
    : defaultVariant?.status === "published" && defaultVariant.url
      ? defaultVariant
      : undefined;
  const playableUrl = playableVariant?.url;
  const playableProvider = playableVariant?.provider ?? block.provider;
  const selectedVoice = getNarrationVoice(requestedVoiceId);
  const selectedStatus = requestedVariant?.status ?? "planned";
  const hasVoiceFallback = Boolean(playableVariant && playableVariant.voiceId !== requestedVoiceId);
  const visibleCues = (block.transcriptCues ?? []).filter((cue) =>
    cue.text.toLocaleLowerCase().includes(transcriptQuery.trim().toLocaleLowerCase()),
  );
  const activeCueIndex = (block.transcriptCues ?? []).findIndex(
    (cue) => currentTime >= cue.startSeconds && currentTime < cue.endSeconds,
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPreferences(parseMediaPreferences(window.localStorage.getItem(MEDIA_PREFERENCES_KEY)));
      setPreferencesLoaded(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!preferencesLoaded) return;
    window.localStorage.setItem(MEDIA_PREFERENCES_KEY, JSON.stringify(preferences));
    if (videoRef.current) {
      videoRef.current.playbackRate = preferences.playbackRate;
      const captionTrack = videoRef.current.textTracks[0];
      if (captionTrack) captionTrack.mode = preferences.captionsEnabled ? "showing" : "hidden";
    }
  }, [preferences, preferencesLoaded]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, select, textarea, button, summary, [contenteditable='true']")) return;
      const media = videoRef.current;
      if (!media || !playableUrl) return;
      if (event.key.toLocaleLowerCase() === "k") {
        event.preventDefault();
        if (media.paused) void media.play();
        else media.pause();
      }
      if (event.key.toLocaleLowerCase() === "c") {
        event.preventDefault();
        setPreferences((current) => ({ ...current, captionsEnabled: !current.captionsEnabled }));
      }
      if (event.key.toLocaleLowerCase() === "j") {
        event.preventDefault();
        media.currentTime = Math.max(0, media.currentTime - 10);
      }
      if (event.key.toLocaleLowerCase() === "l") {
        event.preventDefault();
        media.currentTime = Math.min(media.duration || Infinity, media.currentTime + 10);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [playableUrl]);

  useEffect(() => () => previewRef.current?.pause(), []);

  const updatePreferences = (next: Partial<MediaPreferences>) =>
    setPreferences((current) => ({ ...current, ...next }));

  const selectVoice = (voiceId: NarrationVoiceId) => {
    if (videoRef.current) {
      pendingStateRef.current = {
        time: videoRef.current.currentTime,
        paused: videoRef.current.paused,
      };
    }
    updatePreferences({ voiceId });
    setPreviewStatus("");
  };

  const restoreMediaState = () => {
    const media = videoRef.current;
    if (!media) return;
    media.playbackRate = preferences.playbackRate;
    const saved = pendingStateRef.current;
    if (saved) {
      media.currentTime = Math.min(saved.time, media.duration || saved.time);
      if (!saved.paused) void media.play();
      pendingStateRef.current = null;
    }
    const captionTrack = media.textTracks[0];
    if (captionTrack) captionTrack.mode = preferences.captionsEnabled ? "showing" : "hidden";
  };

  const previewVoice = async () => {
    previewRef.current?.pause();
    const audio = new Audio(getVoicePreviewUrl(requestedVoiceId));
    previewRef.current = audio;
    audio.onended = () => setPreviewStatus(`${selectedVoice.displayName} preview finished.`);
    audio.onerror = () => setPreviewStatus("The preview is not available yet. Run the voice-audition build first.");
    setPreviewStatus(`Playing ${selectedVoice.displayName} preview.`);
    try {
      await audio.play();
    } catch {
      setPreviewStatus("Your browser blocked the preview. Select Preview voice again.");
    }
  };

  const seekToCue = (startSeconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = startSeconds;
    setCurrentTime(startSeconds);
    videoRef.current.focus();
  };

  return (
    <section className="lesson-video" aria-labelledby={titleId}>
      <h2 className="sr-only" id={titleId}>{block.title}</h2>
      <div className="lesson-video__meta">
        <span>{videoLabels[block.videoType]}</span>
        <span>{block.durationMinutes} min</span>
      </div>

      <div className="narration-toolbar" aria-label="Narration and playback settings">
        <label className="media-field" id={voiceLabelId}>
          <span>Narrator</span>
          <select
            aria-labelledby={voiceLabelId}
            value={requestedVoiceId}
            disabled={!preferencesLoaded}
            onChange={(event) => selectVoice(event.target.value as NarrationVoiceId)}
          >
            {NARRATION_VOICES.map((voice) => {
              const variant = variants.find((item) => item.voiceId === voice.id);
              const availability = variant?.status === "published" ? "" : " · preview";
              return <option key={voice.id} value={voice.id}>{voice.displayName} · {voice.accent}{availability}</option>;
            })}
          </select>
        </label>
        <button type="button" className="media-action" disabled={!preferencesLoaded} onClick={() => void previewVoice()}>
          <Volume2 size={16} /> Preview voice
        </button>
        <label className="media-field media-field--speed" id={speedLabelId}>
          <span>Speed</span>
          <select
            aria-labelledby={speedLabelId}
            value={preferences.playbackRate}
            disabled={!preferencesLoaded}
            onChange={(event) => updatePreferences({ playbackRate: Number(event.target.value) })}
          >
            {PLAYBACK_RATES.map((rate) => <option key={rate} value={rate}>{rate}×</option>)}
          </select>
        </label>
        <button
          type="button"
          className={`media-action${preferences.captionsEnabled ? " is-active" : ""}`}
          aria-pressed={preferences.captionsEnabled}
          disabled={!preferencesLoaded}
          onClick={() => updatePreferences({ captionsEnabled: !preferences.captionsEnabled })}
        >
          <Captions size={17} /> Captions {preferences.captionsEnabled ? "on" : "off"}
        </button>
      </div>

      <p className="narration-status" aria-live="polite">
        <strong>{selectedVoice.displayName}</strong> · {selectedVoice.accent} · {selectedVoice.description}
        {hasVoiceFallback ? ` ${selectedVoice.displayName} is not published for this lesson yet, so Daniel will play.` : ""}
        {previewStatus ? ` ${previewStatus}` : ""}
      </p>

      <div className="lesson-video__frame">
        {playableUrl && isDirectMedia(playableUrl, playableProvider ?? "local") ? (
          <video
            key={`${playableVariant?.voiceId}-${playableUrl}`}
            ref={videoRef}
            src={playableUrl}
            controls
            preload="metadata"
            playsInline
            aria-label={`${block.title}, narrated by ${getNarrationVoice(playableVariant?.voiceId ?? defaultVoiceId).displayName}`}
            onLoadedMetadata={restoreMediaState}
            onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          >
            {playableVariant?.captionsPath && (
              <track
                kind="captions"
                src={playableVariant.captionsPath}
                srcLang={getNarrationVoice(playableVariant.voiceId).locale}
                label={`${getNarrationVoice(playableVariant.voiceId).displayName} captions`}
                default={preferences.captionsEnabled}
              />
            )}
          </video>
        ) : playableUrl ? (
          <iframe
            src={playableUrl}
            title={block.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="video-placeholder">
            <div className="video-placeholder__grid" aria-hidden="true" />
            <span className="video-play"><Play size={24} fill="currentColor" /></span>
            <div>
              <span>{videoLabels[block.videoType]}</span>
              <h2>{block.title}</h2>
              <p>Video in production · audition all five narrators above · written lesson available below</p>
            </div>
            <span className="video-status">{selectedStatus}</span>
          </div>
        )}
      </div>

      <details className="transcript">
        <summary><FileText size={17} />Interactive transcript <ChevronDown size={16} /></summary>
        {block.transcriptCues?.length ? (
          <div className="transcript__body">
            <label className="transcript-search">
              <Search size={15} />
              <span className="sr-only">Search transcript</span>
              <input
                type="search"
                value={transcriptQuery}
                onChange={(event) => setTranscriptQuery(event.target.value)}
                placeholder="Search transcript"
              />
            </label>
            <ol className="transcript-cues" aria-label="Transcript cues">
              {visibleCues.map((cue) => {
                const index = block.transcriptCues?.indexOf(cue) ?? -1;
                return (
                  <li key={`${cue.startSeconds}-${cue.text}`} className={index === activeCueIndex ? "is-active" : ""}>
                    <button type="button" onClick={() => seekToCue(cue.startSeconds)} disabled={!playableUrl || !isDirectMedia(playableUrl, playableProvider ?? "local")}>
                      <time>{formatTime(cue.startSeconds)}</time>
                      <span>{cue.text}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
            {visibleCues.length === 0 && <p className="transcript-empty">No transcript matches “{transcriptQuery}”.</p>}
          </div>
        ) : (
          <p>{block.transcript}</p>
        )}
      </details>
      <p className="media-shortcuts">Keyboard: K play/pause · J/L seek 10 seconds · C captions</p>
    </section>
  );
}
