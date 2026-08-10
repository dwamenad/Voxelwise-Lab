# Implementation prompt: Smith-grounded Voxelwise Lab video library v2

You are working in:

`/Users/kwakufinest/Documents/New project/Voxelwise-Lab`

Rebuild the 19 completed, non-live-walkthrough lesson videos as a legible, learner-facing v2 library. Preserve the existing v1 masters and the selected Daniel voice. Ground the scientific teaching in David V. Smith's fMRI methods lecture decks, the existing course/lab sources, and authentic FSL/FEAT/FSLEyes evidence already present in the repository.

Do not merely reskin the existing videos. Rewrite the display copy, narration, caption pipeline, and visual storytelling so each frame teaches one clear idea. Remove production language, source-repository language, repeated boilerplate, and anything an enrolled learner should not see.

## Outcome

Deliver 19 polished 1920×1080, 30 fps v2 masters with:

- readable text and captions at normal laptop viewing size;
- concise, lesson-specific on-screen writing;
- explanations that begin at roughly a 10th-grade level, then introduce accurate graduate-level terminology and consequences;
- native diagrams for abstract ideas and authentic interface evidence for procedural or quality-control ideas;
- Daniel, UK English, deliberate cadence, 148 words per minute;
- normal scientific spelling in display text, transcripts, and captions;
- source traceability in internal production metadata with no visible source credit or acknowledgement yet;
- no fabricated Neurodesk, FEAT, terminal, or FSLEyes screenshots;
- v2 renders in a new output location so v1 is never overwritten.

The 19 videos are the 18 entries in `production/video/content/concept-library.json` plus `understanding-contrasts`.

## Source hierarchy

Use sources in this order:

1. David V. Smith lecture decks listed below for scientific framing, terminology, pedagogical sequence, and visual reference.
2. Existing source labs and lesson catalog for the exact FSL workflow and course-specific commands.
3. Authentic repository screenshots under `public/curriculum/` for interface evidence.
4. Official FSL/Neurodesk documentation only when a current interface or command detail needs verification.

The lecture decks are in the user's Google Drive folder:

`https://drive.google.com/drive/folders/1K_hAvsLpGn89KStjzu1NOFFhG_XltdHi`

Local originals are available at:

- `/Users/kwakufinest/Downloads/L01_IntroMRIsafety.pptx` — 67 slides
- `/Users/kwakufinest/Downloads/L02_PhysicsPhysiology.pptx` — 43 slides
- `/Users/kwakufinest/Downloads/L08_SignalNoisePreprocessing.pptx` — 69 slides
- `/Users/kwakufinest/Downloads/L09_ExperimentalDesign.pptx` — 46 slides
- `/Users/kwakufinest/Downloads/L10_Stats-Basic.pptx` — 47 slides
- `/Users/kwakufinest/Downloads/L11_Stats-Advanced.pptx` — 38 slides
- `/Users/kwakufinest/Downloads/L12_EthicalIssues.pptx` — 28 slides

All 338 slides have been reviewed. Do not use the duplicate preprocessing deck or student/project decks as source authority.

### What to carry forward from the decks

- `L01`: fMRI is a measurement technique, not mind-reading or a direct window into thought; contrast, spatial/temporal/functional resolution; voxels; scanner components; common statistical errors. High-value slides: 8, 12–17, 29–37, 41–46, 50–51, 56–65, 67.
- `L02`: a clean mechanism-first progression from MR signal to image formation, BOLD contrast, neurovascular coupling, and the hemodynamic response. High-value slides: 2–3, 18–21, 24–25, 29–43.
- `L08`: signal versus non-task variability, small fMRI signal changes, noise sources, motion, preprocessing, registration/normalization, smoothing, and filtering. High-value slides: 2–7, 15–26, 36–49, 54–69.
- `L09`: hypotheses before settings; control conditions; blocked, event-related, and mixed designs; timing efficiency; jitter; detection versus estimation. High-value slides: 2–11, 13–26, 28–46.
- `L10`: analysis hierarchy, GLM, regressors, contrasts, fixed/random effects, multiple comparisons, ROI reasoning, visualization, and reverse inference. High-value slides: 3–20, 22–24, 26–47.
- `L11`: the model follows the hypothesis, not merely the stimuli; regressors versus contrasts; confirmatory versus exploratory models; interpretation limits. High-value slides: 4–6, 10–28, 30–38.
- `L12`: responsible communication, anonymization, reverse inference, circular analysis, analytic flexibility, and limits on real-world claims. High-value slides: 3–4, 6–15, 19, 21–27.

Use those slides as conceptual and visual grounding. Do not place an entire lecture slide on screen. Many embedded deck figures come from textbooks or papers, so do not publish a crop unless its reuse rights and attribution are clear. Prefer an original React/SVG redraw in the Voxelwise style. Interface screenshots must be authentic and should come from the repository or a separately approved capture session.

The deck sources are for internal grounding only at this stage. Do not display David V. Smith's name, the deck titles, a source acknowledgement, or a lecture credit in any learner-facing frame, caption, transcript, thumbnail, or public lesson metadata. Preserve the detailed deck and slide references internally so an acknowledgement slide can be added later after the user approves its wording.

## Teaching model for every video

Use this three-layer sequence whenever it improves understanding:

1. **Plain claim:** one concrete sentence a strong 10th-grade student can understand.
2. **Scientific mechanism:** introduce the correct graduate-level term, notation, or limitation.
3. **Why it matters:** connect the mechanism to a decision, interpretation, or quality-control check.

Example for NIfTI:

- Plain: “A voxel is one tiny 3-D box.”
- Scientific: “Voxel dimensions describe spatial sampling, not anatomical precision.”
- Why it matters: “Smaller voxels can reduce signal-to-noise and do not guarantee better functional localization.”

Example for contrasts:

- Plain: “A contrast is a weighted question.”
- Scientific: “It evaluates `cᵀβ` without refitting the GLM.”
- Why it matters: “The weights follow EV column order, so a mislabeled vector can test the opposite hypothesis.”

Do not talk down to the learner. Define a technical term once in plain language, then use it normally.

## Audience-copy rules

Write for the learner, not the production team.

Remove or replace recurring internal/generic phrases such as:

- “Concept video”
- “Connect concept to evidence”
- “Observable check”
- “Educational scope”
- “Carry the reasoning into the next step”
- “The command shown on screen is an example”
- “Adapt its path to your own working directory”
- “source lab,” “renderer,” “composition,” “production,” or repository paths
- the ordinary-frame footer `tubric/2026s-fmri-class · MIT`

Use content-specific labels instead: “The core idea,” “Read the output,” “Check alignment,” “Why motion matters,” or “Before you interpret the map.”

On-screen limits:

- one teachable idea per frame;
- title: preferably 3–8 words, never more than 12;
- body: no more than 28 words;
- no more than 3 bullets, preferably 3–8 words each;
- never display a paragraph as a visual asset;
- code may use multiple lines, but emphasize only the token currently being explained;
- scholarly source details belong in internal production metadata for now, not in learner-facing copy or an end card.

The narration can carry nuance that does not need to be printed. Do not read every label verbatim.

## Caption and pronunciation architecture

Refactor the content schema so pronunciation does not contaminate writing.

Keep separate fields or derived values for:

- `narrationText`: normal prose with `FSL`, `fMRI`, `GLM`, `HRF`, `BOLD`, `NIfTI`, `EV`, `.feat`, and mathematical notation written correctly;
- `ttsText`: pronunciation-adjusted text sent to macOS `say`;
- `captionText`: generated from `narrationText`, not `ttsText`;
- `display`: the compact text visible in the scene.

The current spaced-out forms such as “F S L,” “M R I,” and “G L M” are acceptable only in `ttsText`. They must never appear in captions or transcripts.

Caption requirements:

- sentence case, normal acronyms, and correct punctuation;
- no more than 2 lines at once;
- target about 42 characters per line;
- 34–38 px at 1080p, semibold, with a stable near-black background strip;
- keep captions inside a dedicated bottom safe zone and never overlap footers, diagrams, or controls;
- use timing based on real audio duration; avoid a whole long sentence appearing at once when it can be split naturally.

## Visual system

Use a restrained hybrid of four reusable scene formats:

1. **Editorial Split — default teaching frame**
   - concise claim and mechanism on one side;
   - diagram, evidence, or a single comparison on the other;
   - strong hierarchy and generous empty space.

2. **Evidence First — interfaces, terminal, and quality control**
   - authentic screenshot or output occupies most of the frame;
   - crop tightly enough that labels are readable;
   - use one or two numbered callouts, zoom panels, or highlight boxes;
   - never place a full desktop screenshot at unreadable scale.

3. **Diagram First — GLM, HRF, NIfTI, BIDS, timing, EVs, and contrasts**
   - create diagrams as React/SVG so labels remain sharp;
   - reveal the mechanism in steps synchronized to narration;
   - use color plus labels/shapes, not color alone.

4. **Research Dashboard — advanced QC summary only**
   - use for FEAT-report review, motion/registration/design dependencies, or an end-of-video audit;
   - limit to 3–4 evidence panels with a clear reading order;
   - do not use it as decorative density.

Maintain the existing Voxelwise palette direction, but remove decorative elements that compete with content. The dark opening/summary and light teaching frames may remain. The orbit graphic, generic “Concept → evidence” badges, and repetitive progress chrome should be simplified or removed unless they convey real information.

Minimum sizes at 1920×1080:

- main title: 64–96 px;
- teaching body: 30–36 px;
- bullets: 30–34 px;
- diagram labels and callouts: at least 24 px, preferably 28 px;
- terminal/code: 28–34 px;
- any small learner-facing labels that remain: at least 20 px.

Keep critical content at least 80 px from the left/right edges and above the caption safe zone. Use short fades, wipes, or progressive reveals; do not add motion merely to keep the screen busy.

## Video-by-video grounding and visual plan

Use this matrix as the editorial specification.

| Video slug | Primary format and teaching target | Deck grounding and required visual direction |
|---|---|---|
| `what-is-fsl` | Editorial Split → Evidence First. Explain that FSL is a suite with different tools for viewing, measuring, transforming, modeling, and reporting. | Ground the limits of measurement in L01 slides 15–17 and the FSL lab goals in slide 67. Draw a tool-suite map; use authentic FEAT/FSLEyes/terminal evidence, not deck screenshots. |
| `how-this-course-works` | Editorial Split. Teach the learner loop: understand → predict → run → inspect → explain. | The decks repeatedly use key questions, outlines, mechanism, and summary. Convert that pattern into a learner workflow; do not reuse the instructor-facing “not a coding class” material from L01 slide 4. |
| `getting-started-with-neurodesk` | Evidence First. Distinguish access route, persistent storage, base terminal, and FSL-enabled terminal. | Use `public/curriculum/neurodesk-launch.png` only if its interface remains accurate. Do not fabricate an approved session or imply access the user does not have. |
| `the-terminal` | Evidence First. Explain program, option, argument, current directory, and observable output. | Use a large authentic terminal crop and progressively highlight tokens. Keep commands course-safe and avoid internal absolute paths. |
| `linux-navigation` | Diagram First → Evidence First. Show location as context for relative paths. | Create a simple filesystem tree plus `pwd`, `ls`, and `cd` output. Make “many missing-file errors are location errors” the learner-facing consequence. |
| `what-is-a-nifti-image` | Diagram First. Build voxel → slice → volume → 4-D time series. | L01 slides 33–35 define voxel and resolution; L10 slide 4 shows voxel/volume/run hierarchy. Emphasize that sampling resolution is not the same as functional or anatomical certainty. |
| `understanding-bids` | Diagram First. Decode a filename and then place it in a folder tree. | Add a privacy-aware note grounded in L12 slides 12–13: do not place direct identifiers in research filenames; de-identification is part of responsible sharing. Do not turn this into a HIPAA lecture. |
| `introduction-to-fsleyes` | Evidence First. Teach three planes, overlay order, intensity/contrast, orientation, and coverage. | L01 slides 29–37 ground contrast/resolution. L08 slides 42 and 54–60 ground visual QA and coordinate space. Use repository screenshots and crop tightly. |
| `overlays-atlases-and-time-series` | Evidence First + small diagram. Explain “one coordinate, several sources of evidence.” | L08 slides 54–61 ground registration and standardized space; L10 slides 38–44 ground ROI and visualization. Show multiple slices and treat atlas labels as probabilistic references. |
| `fslinfo-and-fslstats` | Evidence First. Separate metadata from value summaries and make the mask/voxel set explicit. | L08 slides 5–6 show that fMRI changes are small and noisy; L10 slides 5–7 explain why statistics are used. Pair terminal output with a compact “what contributed to this number?” graphic. |
| `fslmaths-and-fslmeants` | Evidence First + pipeline diagram. Show input → transform/mask → measurement. | L10 slides 38–39 ground ROI reasoning; L08 slides 62–66 provide smoothing cautions. Visually check mask alignment before showing a mean time series. |
| `what-first-level-means` | Diagram First. Show one participant + one run + every voxel, then contrast this with within-subject and group levels. | Use L10 slide 4 for the analysis hierarchy and L09 slides 2–3/L10 slide 15 for the model relationship. Avoid implying first-level results generalize to a population. |
| `what-is-a-glm` | Diagram First. Build `Y = Xβ + ε` from observed BOLD, predictor columns, estimates, and residuals. | Use L08 slide 3, L09 slides 2–3, L10 slides 14–20, and L11 slides 4 and 21. State plainly that the GLM is fitted at each voxel and that residuals are unexplained structure, not automatically harmless noise. |
| `experimental-timing-files` | Diagram First. Translate an event table into FSL onset/duration/amplitude rows and then into a timeline. | L09 slides 13–18 and 28–45 ground block/event/mixed designs, jitter, efficiency, and detection versus estimation. Do not imply that one timing pattern is universally optimal. |
| `what-is-an-ev` | Diagram First. Show an EV as one hypothesized pattern/column, then distinguish task, parametric, and nuisance columns. | L10 slides 15–20 and L11 slides 4–6. State that the model follows the hypothesis about underlying processes, not simply every stimulus label. |
| `hrf-and-convolution` | Diagram First. Animate neural-event impulses + HRF → delayed predictor. | L02 slide 43, L09 slides 17, 24, and 28–36, plus L08 slides 23–24. Use accurate rise, peak, and undershoot language; note that HRF shape varies by region and person. |
| `confound-regressors` | Diagram First → Evidence First. Separate task regressors from nuisance regressors and inspect motion/drift evidence. | L08 slides 15, 19, 39–49, and 67–68; L10 slides 18 and 20. Make clear that motion correction/confounds reduce some structured bias but cannot recover missing coverage or repair every artifact. |
| `reviewing-complete-feat-report` | Evidence First → Research Dashboard. Review dependencies in order: inputs/pre-stats → registration → design/contrasts → inference. | L08 slides 40–69 ground the preprocessing chain; L10 slides 26–40 and 42–46 ground multiple comparisons, ROI, visualization, and interpretation. Use `feat-report.png`, `feat-prestats.png`, `feat-registration.png`, `feat-design-matrix.png`, `feat-stats.png`, and `feat-poststats.png`. Results always come last. |
| `understanding-contrasts` | Diagram First → Evidence First. Define contrast as a weighted hypothesis, then verify it in FEAT. | L10 slide 17 and L11 slide 4 distinguish regressors from contrasts; L01 slides 56–65 supply error guardrails. Retain `cᵀβ`, EV-order checks, `[1, −1]`, and the warning that a negative weight means subtraction, not deactivation. Use `feat-contrasts.png`. |

## Cross-cutting scientific guardrails

Apply these when relevant; do not force all of them into every video.

- fMRI measures blood-oxygenation-related signal, a metabolic correlate of neural activity. It is not direct mind-reading and not a literal window into thought (L01 12–17).
- Contrast means both the measured quantity and how effectively conditions can be distinguished relative to variability (L01 29–32).
- Spatial, temporal, and functional resolution are different; smaller voxels alone do not guarantee a better functional claim (L01 33–37).
- BOLD is delayed and pooled; the HRF is a useful model with regional and individual variability (L02 35–43; L08 23–24).
- Preprocessing addresses non-task variability but does not guarantee valid data or a valid model (L08 39–49).
- Registration must be inspected across boundaries and slices; normalization and smoothing alter what can be localized and interpreted (L08 54–66).
- The GLM separates modeled predictors, estimates, and residuals; contrasts ask focused questions of fitted estimates (L10 14–20).
- Fixed-effects and random-effects analyses support different scopes of inference (L10 22–24).
- Multiple comparisons, circular analysis, flexible analysis, and reverse inference can make a technically complete analysis scientifically misleading (L01 56–65; L10 26–47; L12 21–23).
- Responsible data handling includes anonymization/defacing and removing direct identifiers before sharing (L12 12–13).

## Required implementation changes

1. Refactor `production/video/src/concept-lesson.tsx` into reusable visual primitives and the four scene formats above. A suggested structure is `production/video/src/components/` for layout, caption, evidence, diagram, and QC primitives.
2. Add native diagram components for at least: FSL tool map, filesystem context, voxel-to-4D stack, BIDS tree, GLM equation/matrix, event timing strip, HRF convolution, task-versus-confound regressors, FEAT dependency chain, and contrast weights.
3. Extend the scene schema with an explicit layout/visual specification and `sourceRefs`. Do not encode scientific meaning solely in arbitrary JSX branches.
4. Separate normal narration/caption copy from TTS pronunciation as described above.
5. Remove ordinary-frame source footers and do not add a visible acknowledgement or source-credit slide yet. Preserve detailed file/slide references in internal metadata. The scene system may support a future optional acknowledgement scene, but it must be disabled by default and must render nothing until the user supplies and approves the wording.
6. Make the editorial source durable. `npm run video:prepare:concepts` currently regenerates `concept-library.json`; do not make manual changes that are erased by that command. Either update the generator and canonical catalog inputs or add a versioned editorial-override layer merged by slug.
7. Keep `understanding-contrasts` scientifically consistent with the shared v2 system. It may retain a specialized composition, but captions, source-visibility behavior, typography, safe areas, and evidence styling must match.
8. Preserve all current v1 MP4s. Render v2 to `production/video/output/concepts/masters-v2/` and `production/video/output/understanding-contrasts-v2.mp4` or an equivalently explicit versioned path.
9. Keep MP4s and generated voice audio out of Git as the existing production policy requires. Commit reproducible source, metadata, transcripts, captions, and selected preview/contact-sheet images only when appropriate.
10. Do not record or fabricate any live Neurodesk walkthrough. If a necessary authentic screen is unavailable, use a diagram placeholder labeled for production review and report the missing capture instead of faking it.

## Validation and review

Add or update validation so the build fails on obvious audience-copy and legibility regressions.

At minimum, check:

- no normal caption/transcript contains spaced pronunciation forms such as `F S L`, `M R I`, `G L M`, or `H R F`;
- no teaching frame contains repository paths, license shorthand, “source lab,” “renderer,” “composition,” or other internal terms;
- titles, bodies, and bullets stay within the stated limits unless a documented exception is present;
- all image assets exist and all screenshots have a learner-facing caption;
- source references exist for scientific claims and interface evidence;
- every composition renders at 1920×1080 and 30 fps;
- text remains inside safe areas and captions do not overlap critical content;
- all 19 videos use Daniel at 148 wpm;
- all videos have regenerated transcripts and `.srt` captions derived from normal narration text.

Render a review set before the full batch:

- an opening frame;
- the densest teaching frame;
- one diagram frame;
- one evidence/QC frame;
- the summary frame;

Create labeled contact sheets covering all 19 videos. Inspect them at reduced laptop scale, not only full-resolution. Then render at least these four pilot v2 masters first:

1. `what-is-a-nifti-image` — tests Diagram First and plain-to-technical teaching;
2. `what-is-a-glm` — tests mathematical typography and progressive explanation;
3. `introduction-to-fsleyes` — tests Evidence First readability;
4. `reviewing-complete-feat-report` — tests the Research Dashboard and QC hierarchy.

After those pass visual and scientific review, render the remaining 15.

Run the relevant project checks, including TypeScript/build validation and the video preparation/render commands. Report the exact commands run, changed files, rendered outputs, unresolved evidence gaps, and any scientific decisions that need human review.

## Definition of done

The work is complete only when:

- all 19 v2 masters exist separately from v1;
- every frame is legible at normal laptop scale;
- on-screen copy is concise and entirely learner-facing;
- narration uses the plain → scientific → consequence teaching pattern where appropriate;
- captions/transcripts show normal acronyms and notation;
- no screenshot or result has been fabricated;
- all scientific claims are traceable to the decks or existing course sources;
- the FEAT/FSLEyes/terminal videos use authentic, readable evidence;
- every video keeps detailed source references internally without displaying a source footer, acknowledgement slide, or visible David V. Smith credit;
- the review contact sheets and validation report are available;
- v1 masters and existing delivery folders remain untouched until the user explicitly approves replacement.

Do not upload or replace the delivered Drive masters until the v2 contact sheets and pilot renders have been reviewed and approved.
