# Video production execution

This runbook is the durable execution plan for completing, reviewing, and
publishing the Voxelwise Lab video library. Production status remains
authoritative in `production/metadata/`; this document defines sequencing,
owners, gates, and completion evidence.

## Release target

- 19 concept and quality-control videos: rendered and master-validated
- 13 live Neurodesk/FEAT walkthroughs: one pilot in review, twelve planned
- 32 published lesson videos at release
- 33 outline-course concepts deferred until lesson expansion and scientific
  review are complete

## Roles

| Role | Responsibility |
| --- | --- |
| Course lead | Pilot decision, editorial acceptance, release approval |
| Producer | Authenticated capture, capture-state reset, raw-source archive |
| Video engineer | Narration preparation, Remotion renders, technical validation |
| Scientific reviewer | Workflow, terminology, model, contrast, and QC accuracy |
| Web/release engineer | Streaming upload, lesson mapping, player QA, deployment |

One person may hold more than one role, but pilot approval and scientific review
must be explicit decisions rather than inferred from a successful render.

## Gate sequence

1. Approve or revise `Opening FEAT` using
   `production/reviews/opening-feat.md`.
2. Lock the approved cursor pace, caption placement, narration, and finishing
   style.
3. Record walkthroughs 2–6 from the reusable sequence-pilot configuration
   states.
4. Record walkthroughs 7–12 from the validated completed output and safe fault
   copies.
5. Record walkthrough 13 from the validated ds000157 capstone state.
6. Complete technical and scientific review in batches; apply at most one
   consolidated revision round per batch.
7. Upload approved masters and captions to the streaming provider, update
   lesson publication data, and run release QA.

The Opening FEAT approval gate blocks authentic capture of walkthroughs 2–13.
Pipeline engineering, source validation, and capture-layout preparation may
continue while that review is pending.

## Authenticated environment snapshot — 2026-08-11

The Neurodesk production workspace at
`/home/jovyan/Voxelwise-Walkthroughs` was checked read-only before batch
recording:

- FSL `6.0.7.22` loads successfully; both `Feat` and `feat` resolve.
- The workspace contains 572 ds005085 files, 23 prepared design artifacts, and
  three first-level `.feat` directories, including the validated sequence-pilot
  result.
- `recordings/` and `timing/` contain no files or subdirectories. No raw capture
  for walkthroughs 2–13 has been made yet.

The scientific source state is available for capture, but the signed pilot
decision remains the next gate.

The machine-readable release ledger is
`production/metadata/video-release.json`. Its normal validation reports the
current state without treating a rendered master as approved or published:

```sh
npm run video:validate:release
```

Approval flags are accepted only with reviewer, date, and evidence. Record each
decision explicitly; a requested-change decision remains a closed gate:

```sh
npm run video:record-review -- \
  --video=walkthrough:opening-feat \
  --kind=editorial \
  --decision=approved \
  --reviewer="Reviewer name" \
  --date=YYYY-MM-DD \
  --evidence=production/reviews/opening-feat.md
```

Repeat for the scientific decision with `--kind=scientific`. Capture packages
remain blocked until both recorded decisions are approved.

## Live walkthrough register

| Order | Slug | Target | Current state | Next evidence |
| ---: | --- | ---: | --- | --- |
| 1 | `opening-feat` | 8 min | Review | Signed pilot decision |
| 2 | `configuring-data-tab` | 8 min | Planned | Raw capture and generated manifest |
| 3 | `configuring-preprocessing` | 8 min | Planned | Raw capture and generated manifest |
| 4 | `creating-evs` | 8 min | Planned | Raw capture and generated manifest |
| 5 | `creating-contrasts` | 8 min | Planned | Raw capture and generated manifest |
| 6 | `inspecting-design-matrix` | 8 min | Planned | Raw capture and generated manifest |
| 7 | `running-feat` | 8 min | Planned | Raw capture and generated manifest |
| 8 | `feat-directory` | 8 min | Planned | Raw capture and generated manifest |
| 9 | `cope-versus-z-statistic` | 8 min | Planned | Raw capture and generated manifest |
| 10 | `inspecting-registration` | 8 min | Planned | Raw capture and generated manifest |
| 11 | `interpreting-feat-report` | 8 min | Planned | Raw capture and generated manifest |
| 12 | `common-level-one-failures` | 8 min | Planned | Raw capture and generated manifest |
| 13 | `complete-guided-analysis` | 16 min | Planned | Raw capture and generated manifest |

## Capture contract

- Record authenticated Neurodesktop, FSL terminal, FEAT, FSLEyes, and FEAT
  report evidence only.
- Record 1920×1080 at 30 fps; the preparation pipeline consumes PNG sequences
  sampled at 5 fps.
- Keep account details, personal files, unrelated tabs, notifications, and
  credentials outside the capture.
- Begin from the named state in
  `production/storyboards/batch-recording-plan.md` and restore it after each
  recording.
- Hold important selections for two seconds and keep pointer movement
  deliberate.
- Store the capture for each narration section in the exact directory printed
  by the layout command.

Example:

```sh
npm run video:layout:walkthrough -- configuring-data-tab
```

Create all twelve post-pilot capture packages, including the exact start/end
state, narration-section directories, authentic-action storyboard, and
post-capture commands:

```sh
npm run video:package:walkthroughs
npm run video:validate:walkthrough-packages
```

By default these packages live in `../walkthrough-captures/`, outside the Git
repository and generated public assets. Set `CAPTURE_PACKAGE_ROOT` or pass
`--root=/absolute/path` to use private capture storage elsewhere. Package
creation is allowed while the pilot is pending; each plan retains a stop notice
until editorial and scientific pilot approval are recorded.

## Prepare, render, and validate

Prepare one authenticated capture:

```sh
npm run video:prepare:walkthrough -- \
  configuring-data-tab \
  /absolute/path/to/configuring-data-tab-capture
```

Render its captioned review cut and caption-free raw source:

```sh
npm run video:render:walkthrough -- configuring-data-tab
```

Render every prepared walkthrough:

```sh
npm run video:render:walkthroughs
```

Validation levels:

```sh
# All 13 durable definitions, narration, order, and composition IDs
npm run video:validate:walkthroughs

# Require generated timing, SRT, transcript, narration audio, and capture frames
npm run video:validate:walkthroughs:generated -- configuring-data-tab

# Also require validated raw and review MP4 masters
npm run video:validate:walkthroughs:masters -- configuring-data-tab
```

Each completed walkthrough must contain:

- authenticated source capture in private raw storage;
- generated timing manifest;
- Daniel narration at 148 words per minute;
- captioned review/final MP4;
- caption-free raw MP4;
- burned-in captions and sidecar SRT;
- Markdown transcript;
- passing encoded-media validation;
- recorded editorial and scientific decisions.

## Batch review

Review batch A after walkthrough 6, batch B after walkthrough 12, and the
capstone separately. Each review covers:

- interface legibility and cursor pace;
- caption synchronization and the two-line/42-character limit;
- transcript agreement;
- privacy and capture-scope compliance;
- correct FSL version, inputs, paths, EV order, contrasts, and output identity;
- separation of effect estimates, uncertainty, standardized evidence, and
  quality-control conclusions;
- consistency with the approved pilot.

Move status from `planned` to `review` only after all expected artifacts exist.
Move it to `approved` only after technical and scientific decisions are
recorded.

## Publication gate

Before changing a lesson to `published`:

1. Upload the approved master to the selected streaming provider.
2. Attach the sidecar captions and retain the transcript.
3. Record the provider asset ID, playback URL, and archive links.
4. Replace `videoId: null`, placeholder transcript text, and `planned` status in
   the lesson content.
5. Verify playback, seeking, fullscreen, captions, transcript disclosure, and
   responsive layout in Chrome, Safari, Firefox, and a mobile viewport.
6. Confirm no learner-facing URL points to private raw or review storage.

Use the strict release validators at the two publication gates:

```sh
# All 32 videos have approved masters, captions, transcripts, and reviews
npm run video:validate:release:publishable

# All 32 also have provider, asset, and playback identifiers
npm run video:validate:release:published
```

## Definition of done

The release is complete only when all 32 lesson videos have approved masters,
technical and scientific review evidence, provider IDs, working captions and
transcripts, and successful deployed playback. A completed render or private
Drive upload alone is not publication.
