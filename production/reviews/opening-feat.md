# Opening FEAT pilot review

Review video: https://drive.google.com/file/d/1cA99ksQP2__akAlp3_Wwt_54Fx5Vi1zk/view?usp=drivesdk

Sidecar captions: https://drive.google.com/file/d/1BQ2p5H6OGI7FH0Ygy9MDRqq7Ywb3gNFJ/view?usp=drivesdk

Transcript: https://drive.google.com/file/d/14khL9P3r2XVJG-52WTc6BHIy6KJWNThg/view?usp=drivesdk

## Approval gate

- [x] Neurodesktop, terminal, and FEAT controls are legible at normal playback size.
- [x] Cursor movement and screen-action pacing feel deliberate.
- [x] Daniel narration is clear, natural, and appropriately paced.
- [x] Burned-in captions are readable and do not obscure the named controls.
- [x] The scientific explanation and workflow order are accurate.
- [x] The distinction between `Feat &` and lower-case `feat saved-design.fsf` is clear.
- [x] No authentication details, unrelated browser content, or personal files appear.
- [x] Overall style is approved for walkthroughs 2–13.

## Decision

Status: approved

- Reviewer: Derrick Dwamena
- Roles: editorial reviewer and scientific reviewer
- Decision date: 2026-08-11
- Decision: approved for walkthroughs 2–13

## Codex visual audit — 2026-08-11

Sampled the authenticated Drive review at the opening and at approximately
`01:30`, `02:42`, `03:53`, and `04:36`–`04:56`.

- The Neurodesktop and FEAT interface are legible at normal viewer size.
- Cursor placement and screen-action pacing are deliberate in the sampled scenes.
- Burned-in captions stay within two lines and do not cover the named controls.
- No authentication details, unrelated browser content, or personal files appear in
  the sampled scenes.
- Audio quality, narration naturalness, and scientific accuracy still require a
  human reviewer with audio playback and subject-matter expertise.

This audit does not change the approval status. The full eight-item gate above must
be approved before recording walkthroughs 2–13.

## Objective audio audit — 2026-08-11

The authenticated Drive review master was downloaded to the ignored production
output and checked with `npm run video:validate:pilot-audio`.

- AAC stereo, 48 kHz; 302.549 seconds.
- Sample peak: -3.39 dBFS; program RMS: -22.50 dBFS; no sample or 4×
  inter-sample clipping.
- DC offset: -0.000015; longest silence: 0.9 seconds; leading/trailing silence:
  0.1/0.7 seconds.
- 636 narration words; 126.1 overall words per minute and 136.7 active words per
  minute.
- 73 caption cues; maximum two lines and 42 characters per line; final cue ends
  1.013 seconds before the media ends.

The signal, silence, pace, and caption-tail checks pass. A human listener must
still judge pronunciation, intelligibility, naturalness, and whether emphasis
supports the scientific explanation.

Approval authorizes recording walkthroughs 2–13 from the validated Neurodesk states. Requested changes should be applied to the pilot first and then propagated to the batch storyboard, narration, capture, caption, and finishing templates.
