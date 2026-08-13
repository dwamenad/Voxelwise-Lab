# Lesson video production

This directory contains the reproducible v3 production system for the 19
Voxelwise Lab concept and quality-control videos. Rendered masters and generated
narration audio are intentionally excluded from Git. Approved masters are
delivered from the `voxelwise-lab-media` Cloudflare R2 bucket;
`config/published-media.json` is the app's source of truth for the currently
published Daniel masters.

## Editorial and attribution policy

Learner-facing frames use concise teaching copy, native scientific diagrams,
and authentic interface evidence. Detailed lecture, slide, course-lab, and
asset references remain in each scene's `sourceRefs` as internal production
metadata. They are not rendered into frames, captions, or transcripts.

Learner credits and the acknowledgement slide are disabled. A future
acknowledgement can be designed and enabled after the credit language is
approved.

## Production format

- 1920×1080 at 30 fps
- H.264 video with AAC audio
- Daniel as the default voice, with Samantha, Tessa, Karen, and Rishi variants
- synchronized scene boundaries across every voice so learners can switch at the same timestamp
- 48 kHz audio with DC removal, a 70 Hz high-pass filter, silence trimming,
  short fades, −16 LUFS normalization, and per-scene clipping/loudness QC
- readable sentence captions, limited to two 42-character lines per cue
- normal acronyms in captions and transcripts; pronunciation expansion only in
  the hidden TTS input

The original v1 and v2 concept masters remain untouched. V3 voice variants are
written to `production/video/output/concepts/masters-v3/<lesson>/<voice>.mp4`,
with contrasts variants under
`production/video/output/understanding-contrasts-v3/<voice>.mp4`.

## Prepare and validate

Generate the 18-video concept library, all narration clips, timing manifests,
captions, and transcripts, then prepare the contrasts lesson:

```sh
npm run video:prepare:v3
```

The committed browser previews are regenerated with `npm run video:voices` and
written to `public/voice-previews/`. Full lesson narration remains excluded
from Git because it is a reproducible build artifact.

Validate source copy and internal-reference policy:

```sh
npm run video:validate
```

Validate all generated narration, captions, and transcripts:

```sh
npm run video:validate:generated
```

## Visual review

Create one representative frame per scene plus a contact sheet for every video:

```sh
npm run video:review:v2
```

Create contact sheets for the four visual pilots only:

```sh
npm run video:review:pilots
```

Review artifacts are generated under `production/video/output/review-v2/` and
are ignored by Git.

## Render

Render every v3 voice variant and run the encoded-media validation:

```sh
npm run video:render:v3
```

Render one or more prepared concept lessons without regenerating narration:

```sh
npm run video:render:concepts:prepared -- what-is-fsl what-is-a-glm
```

Limit a prepared concept render to selected voices when reviewing a pilot:

```sh
npm run video:render:concepts:prepared -- --voices=daniel,tessa what-is-fsl
```

Render only the contrasts lesson:

```sh
npm run video:render:contrasts
```

The master validator checks all 19 files for dimensions, frame rate, codecs,
browser playback, seeking support, and duration agreement with the generated
timelines:

```sh
npm run video:validate:masters
```

## Source locations

- durable editorial source: `production/video/content/editorial-v2.mjs`
- generated concept catalog: `production/video/content/concept-library.json`
- contrasts source: `production/video/content/understanding-contrasts.json`
- shared renderer: `production/video/src/concept-lesson.tsx`
- scientific visuals: `production/video/src/components/visuals.tsx`
- voice registry: `production/video/config/voices.json`
- audio cleanup and QC: `production/video/scripts/audio-pipeline.mjs`
- synchronized narration builder: `production/video/scripts/build-multivoice-narration.mjs`
- narration utilities: `production/video/scripts/narration-utils.mjs`
- implementation prompt: `production/video/prompts/implement-smith-grounded-video-v2.md`

Live Neurodesk and FEAT walkthroughs remain separate because their visual
evidence must be recorded in an approved environment. The concept set contains only
the videos that can be produced without that live approval.

## Production delivery

The published set contains 20 MP4 masters, 20 WebVTT caption files, 20 source
SRT files, and 20 reviewed Markdown transcripts. The app reads the public media
prefix from `NEXT_PUBLIC_MEDIA_BASE_URL`, falling back to the verified R2
managed domain in `config/published-media.json`. Byte-range playback and public
GET/HEAD CORS are enabled for the bucket. Samantha, Tessa, Karen, and Rishi
remain preview-only until their lesson masters are rendered and approved.

## Live FEAT pilot

The `Opening FEAT` pilot uses authentic Neurodesk capture frames, five
synchronized narration variants, voice-specific captions, and a shared transcript. Prepare
its capture assets and narration with:

```sh
npm run video:prepare:opening-feat -- /absolute/path/to/opening-feat-capture
```

The capture path can also be provided as `LIVE_CAPTURE_ROOT`. Render the review
cut and the caption-free raw source with:

```sh
npm run video:render:opening-feat
npm run video:render:opening-feat:raw
```

Generated media is written under
`production/video/output/walkthroughs/opening-feat/`; authenticated source
frames and generated narration audio remain excluded from Git.

## Live FEAT batch preparation

Walkthroughs 2–13 are prepared behind the Opening FEAT approval gate. Their
durable production sources are:

- `production/metadata/live-walkthroughs.yaml`: batch order, review state, and delivery folders
- `production/metadata/feat-run-specs.yaml`: verified data, preprocessing, registration, EV, contrast, and validation values
- `production/narration/`: one narration draft per walkthrough
- `production/storyboards/batch-recording-plan.md`: timed authentic-screen actions and reusable start states
- `production/designs/sequence-pilot.fsf`: ds005085 model for walkthroughs 2–12
- `production/designs/guided-capstone.fsf`: ds000157 model for walkthrough 13

The `.fsf` files must pass `feat_model`, visual design-matrix review, a GUI tab
review, and timing-bound checks inside FSL 6.0.7.22 before capture. The source
course uses a 60-second high-pass cutoff; this value is recorded explicitly in
the run specification and both validated designs.
