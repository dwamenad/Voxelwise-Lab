import { describe, expect, it } from "vitest";
import {
  DEFAULT_VOICE_ID,
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
});
