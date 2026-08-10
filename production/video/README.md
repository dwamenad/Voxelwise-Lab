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
