# Lesson video production

This directory contains the reproducible v2 production system for the 19
Voxelwise Lab concept and quality-control videos. Rendered masters and generated
narration audio are intentionally excluded from Git; approved masters belong in
review storage and, later, the streaming provider.

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
- Daniel voice at 148 words per minute
- readable sentence captions, limited to two 42-character lines per cue
- normal acronyms in captions and transcripts; pronunciation expansion only in
  the hidden TTS input

The original v1 concept masters remain under
`production/video/output/concepts/masters/`. V2 renders are written separately
to `production/video/output/concepts/masters-v2/`, with the contrasts master at
`production/video/output/understanding-contrasts-v2.mp4`.

## Prepare and validate

Generate the 18-video concept library, all narration clips, timing manifests,
captions, and transcripts, then prepare the contrasts lesson:

```sh
npm run video:prepare:v2
```

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

Render every v2 master and run the encoded-media validation:

```sh
npm run video:render:v2
```

Render one or more prepared concept lessons without regenerating narration:

```sh
npm run video:render:concepts:prepared -- what-is-fsl what-is-a-glm
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
- narration utilities: `production/video/scripts/narration-utils.mjs`
- implementation prompt: `production/video/prompts/implement-smith-grounded-video-v2.md`

Live Neurodesk and FEAT walkthroughs remain separate because their visual
evidence must be recorded in an approved environment. This v2 set contains only
the videos that can be produced without that live approval.

## Live FEAT pilot

The `Opening FEAT` pilot uses authentic Neurodesk capture frames, Daniel
narration, burned-in captions, and matching SRT and transcript files. Prepare
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

After materializing the review master locally, validate its audio signal,
silence, narration pace, caption limits, and caption tail with:

```sh
npm run video:validate:pilot-audio
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

## Live walkthrough batch pipeline

All 13 live walkthroughs are registered in
`production/video/content/live-walkthroughs.mjs`. The Opening FEAT pilot keeps
its original multi-directory capture layout. Walkthroughs 2–13 use one ordered
capture directory per narration section. Print the exact expected layout before
recording:

```sh
npm run video:layout:walkthrough -- configuring-data-tab
```

Generate the twelve private capture packages from the canonical narration and
batch storyboard, then verify that their start/end states and directory layouts
are current:

```sh
npm run video:package:walkthroughs
npm run video:validate:walkthrough-packages
```

Prepare one walkthrough from authenticated PNG capture frames sampled at 5 fps:

```sh
npm run video:prepare:walkthrough -- \
  configuring-data-tab \
  /absolute/path/to/configuring-data-tab-capture
```

The prepare step normalizes frame names, generates Daniel narration, writes the
timing manifest, SRT, and transcript, and registers the prepared composition.
Render both review and raw outputs with:

```sh
npm run video:render:walkthrough -- configuring-data-tab
```

With no slugs, the batch renderer processes every prepared walkthrough:

```sh
npm run video:render:walkthroughs
```

Validate durable source definitions at any time, then require generated assets
or masters as production advances:

```sh
npm run video:validate:walkthroughs
npm run video:validate:walkthroughs:generated -- configuring-data-tab
npm run video:validate:walkthroughs:masters -- configuring-data-tab
```

The 32-video release ledger is validated separately so editorial approval,
scientific approval, provider selection, and publication cannot be inferred
from successful renders:

```sh
npm run video:validate:release
npm run video:validate:release:publishable
npm run video:validate:release:published
```

Record an editorial or scientific decision with reviewer, date, and evidence:

```sh
npm run video:record-review -- \
  --video=walkthrough:opening-feat \
  --kind=editorial \
  --decision=approved \
  --reviewer="Reviewer name" \
  --date=YYYY-MM-DD \
  --evidence=production/reviews/opening-feat.md
```

The complete sequencing, ownership, review gates, publication requirements,
and definition of done are in `docs/VIDEO_PRODUCTION_EXECUTION.md`.
