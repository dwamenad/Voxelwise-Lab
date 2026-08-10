# Lesson video production

This directory contains the reproducible source for Voxelwise Lab lesson videos.
Rendered video masters and generated narration audio are intentionally excluded
from Git; final masters belong in Google Drive during review and in the streaming
provider after publication.

## Understanding contrasts

The pilot is a 1920x1080, 30 fps concept video for the lesson
`first-level-fmri-analysis-feat/understanding-contrasts`. Its scientific content
is grounded in `tubric/2026s-fmri-class`, especially `Lab-3_FSL_Level1.md` and
`Lab-X_Contrast.md`.

Generate narration, timing data, captions, and a local render:

```sh
npm run video:render:contrasts
```

Open the Remotion composition for visual iteration:

```sh
npm run video:studio
```

The render command uses the macOS `say` and `afconvert` utilities for the pilot
voice track. The generated timing manifest is committed so the composition is
inspectable without guessing scene boundaries. The final transcript and SRT are
kept under `production/video/output`; MP4 and preview PNG files are ignored.

Before publication, complete an external scientific review, replace or approve
the pilot narration, upload the approved master to the streaming provider, and
set the lesson's video ID.

## Concept video library

The shared concept-video system produces the lessons that do not depend on a
live Neurodesk walkthrough. It currently covers the eleven production-ready
Foundations lessons, six First-Level FEAT concept lessons, and the completed
FEAT-report quality-control lesson. Every video uses the selected Daniel voice
at 148 words per minute and ships with a transcript and SRT captions.

Prepare or refresh the library content, narration, timings, captions, and
transcripts:

```sh
npm run video:prepare:concepts
```

Render every prepared 1920x1080 master:

```sh
npm run video:render:concepts:prepared
```

Render one or more named lessons without regenerating narration:

```sh
npm run video:render:concepts:prepared -- what-is-fsl what-is-a-glm
```

The source catalog is `production/video/content/concept-library.json`, and the
generated timing manifest is `production/video/generated/concept-library.json`.
Per-lesson transcripts and captions are committed under
`production/video/output/concepts/<slug>/`; rendered masters remain ignored and
are delivered through Google Drive for review.

Live FEAT walkthroughs remain separate from this library because their visual
evidence must be recorded in an approved Neurodesk session. Outline-only
lessons are also held back until their scientific teaching content is expanded
and reviewed; the renderer is ready for them once that source material exists.
