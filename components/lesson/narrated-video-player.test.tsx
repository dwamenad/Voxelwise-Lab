import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { NarratedVideoPlayer } from "@/components/lesson/narrated-video-player";
import { createPlannedVoiceVariants, MEDIA_PREFERENCES_KEY } from "@/lib/narration";
import type { LessonBlock } from "@/lib/types";

const block: Extract<LessonBlock, { type: "video" }> = {
  type: "video",
  videoType: "concept",
  title: "Understanding a NIfTI image",
  provider: "local",
  videoId: null,
  durationMinutes: 6,
  status: "planned",
  defaultVoiceId: "daniel",
  voiceVariants: createPlannedVoiceVariants("understanding-a-nifti-image"),
  transcript: "The written transcript remains available while this video is in production.",
};

describe("NarratedVideoPlayer", () => {
  beforeEach(() => window.localStorage.clear());

  it("offers five narrators and remembers a learner's selection", async () => {
    render(<NarratedVideoPlayer block={block} />);
    const narrator = screen.getAllByRole("combobox")[0];
    expect(narrator).toHaveValue("daniel");
    expect(screen.getAllByRole("option")).toHaveLength(11);
    await waitFor(() => expect(narrator).toBeEnabled());

    fireEvent.change(narrator, { target: { value: "tessa" } });
    expect(narrator).toHaveValue("tessa");
    expect(screen.getAllByText(/South African English/).length).toBeGreaterThan(0);
    await waitFor(() => {
      expect(JSON.parse(window.localStorage.getItem(MEDIA_PREFERENCES_KEY) ?? "{}").voiceId).toBe("tessa");
    });
  });

  it("restores saved speed, captions, and narrator preferences", async () => {
    window.localStorage.setItem(
      MEDIA_PREFERENCES_KEY,
      JSON.stringify({ version: 1, voiceId: "karen", playbackRate: 1.5, captionsEnabled: false }),
    );
    render(<NarratedVideoPlayer block={block} />);
    await waitFor(() => expect(screen.getAllByRole("combobox")[0]).toHaveValue("karen"));
    expect(screen.getAllByRole("combobox")[1]).toHaveValue("1.5");
    expect(screen.getByRole("button", { name: /Captions off/ })).toHaveAttribute("aria-pressed", "false");
  });
});
