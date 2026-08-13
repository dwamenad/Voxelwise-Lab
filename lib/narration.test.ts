import { describe, expect, it } from "vitest";
import {
  createVideoVoiceVariants,
  DEFAULT_VOICE_ID,
  getPublishedMedia,
  NARRATION_VOICES,
  parseMediaPreferences,
} from "@/lib/narration";

describe("narration registry", () => {
  it("keeps Daniel as the default and exposes four additional English voices", () => {
    expect(DEFAULT_VOICE_ID).toBe("daniel");
    expect(NARRATION_VOICES.map((voice) => voice.id)).toEqual([
      "daniel",
      "samantha",
      "tessa",
      "karen",
      "rishi",
    ]);
    expect(new Set(NARRATION_VOICES.map((voice) => voice.locale)).size).toBe(5);
  });

  it("repairs stale or invalid stored media preferences", () => {
    expect(parseMediaPreferences('{"version":0,"voiceId":"missing","playbackRate":9,"captionsEnabled":"yes"}')).toEqual({
      version: 1,
      voiceId: "daniel",
      playbackRate: 1,
      captionsEnabled: true,
    });
    expect(parseMediaPreferences('{"voiceId":"tessa","playbackRate":1.5,"captionsEnabled":false}')).toEqual({
      version: 1,
      voiceId: "tessa",
      playbackRate: 1.5,
      captionsEnabled: false,
    });
  });

  it("publishes the approved Daniel master while keeping alternate voices in preview", () => {
    expect(getPublishedMedia("what-is-fsl")).toMatchObject({
      provider: "external",
      url: expect.stringMatching(/\/media\/what-is-fsl\.mp4$/),
      captionsPath: expect.stringMatching(/\/media\/what-is-fsl\.vtt$/),
    });

    const variants = createVideoVoiceVariants("what-is-fsl");
    expect(variants[0]).toMatchObject({ voiceId: "daniel", status: "published", provider: "external" });
    expect(variants.slice(1).every((variant) => variant.status === "planned")).toBe(true);
  });
});
