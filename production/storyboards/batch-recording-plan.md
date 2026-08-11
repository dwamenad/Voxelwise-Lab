# FEAT live walkthroughs 2–13 — batch storyboard

## Shared production rules

- Capture only authenticated Neurodesktop, FSL terminals, FEAT, FSLEyes, and FEAT reports required by the lesson.
- Record 1920×1080 at 30 fps. Keep GUI text readable at normal playback size.
- Use FSL 6.0.7.22. Launch the GUI with `Feat &`; use lower-case `feat saved-design.fsf` only for a saved command-line run.
- Begin from a named reusable state and return to it after each recording.
- Show the exact input or output path before interpreting it; hide account details and unrelated files.
- Maintain deliberate pointer movement and a two-second hold after every important selection.
- Do not record videos 2–13 until the Opening FEAT pilot has passed the approval gate.

## 2. Configuring the Data tab

Reusable start: fresh first-level Full-analysis FEAT window.

| Time | Authentic action | Evidence/QC |
| --- | --- | --- |
| 0:00–1:20 | In the FSL terminal run `fslval` for dimensions, `dim4`, and `pixdim4` | Show 86×86×51, 260 volumes, and TR 1.7 s |
| 1:20–2:20 | Identify the BIDS entities in the ds005085 BOLD filename | Confirm sub-10015, sharedreward, mb3me1 |
| 2:20–4:10 | Select one input and choose the verified 4D BOLD file | Do not select JSON or a 3D reference |
| 4:10–5:30 | Enter TR 1.7, 260 volumes, and zero deleted volumes | Explain 442-second implied duration |
| 5:30–7:10 | Set the new descriptive output path | Confirm it does not exist and FEAT appends `.feat` |
| 7:10–8:00 | Read back all Data-tab values and save a checkpoint | Final frame shows complete Data tab |

## 3. Configuring preprocessing options

Reusable start: sequence-pilot design with Data tab complete.

| Time | Authentic action | Evidence/QC |
| --- | --- | --- |
| 0:00–1:10 | State and show that the input is the raw course BOLD run | Contrast with already-preprocessed provenance |
| 1:10–2:20 | Configure MCFLIRT motion correction and functional BET | Completion will not replace later QC |
| 2:20–3:30 | Set smoothing to 5 mm FWHM | Hold the numeric control legibly |
| 3:30–4:40 | Select Regular down slice timing | State that this is protocol- and acquisition-specific |
| 4:40–5:50 | Keep intensity normalization off; high-pass on at 60 seconds; low-pass off | Match the course Data-tab screenshot |
| 5:50–7:20 | Review every control against provenance and save | Final frame shows the full Pre-stats tab |

## 4. Creating EVs

Reusable start: sequence-pilot design with Data, Pre-stats, and Registration complete.

| Time | Authentic action | Evidence/QC |
| --- | --- | --- |
| 0:00–1:20 | Preview both timing files in the terminal | Show 28 Left and 25 Right events |
| 1:20–2:10 | Open Full model setup and set two original EVs | Write down order Left, Right |
| 2:10–4:10 | Configure Left from its custom three-column file | Double-Gamma, derivative off, filtering on |
| 4:10–6:10 | Configure Right identically with its own file | Confirm paths are not swapped |
| 6:10–7:30 | Inspect both EV plots and save | Stop on empty, duplicated, or out-of-run timing |

## 5. Creating contrasts

Reusable start: sequence-pilot design with Left and Right EVs complete.

| Time | Authentic action | Evidence/QC |
| --- | --- | --- |
| 0:00–1:00 | Open contrast manager with EV names visible | Fix order as Left, Right |
| 1:00–2:10 | Add Left `[1,0]` and Right `[0,1]` | Explain implicit-baseline interpretation |
| 2:10–4:00 | Add Left > Right `[1,-1]` and inverse `[-1,1]` | Read subtraction direction aloud |
| 4:00–5:10 | Add Left + Right `[1,1]` | Do not call it an average |
| 5:10–7:30 | Review all names and rows in the preview, then save | No unplanned F-test |

## 6. Inspecting the design matrix

Reusable start: complete sequence-pilot model before execution.

| Time | Authentic action | Evidence/QC |
| --- | --- | --- |
| 0:00–1:10 | Open View design and orient rows versus columns | Treat preview as the fitted model |
| 1:10–3:20 | Match Left and Right columns to timing files | Neither column empty, constant, or duplicated |
| 3:20–4:50 | Review correlation information | Explain separability rather than chasing a magic cutoff |
| 4:50–6:30 | Trace all five contrasts across the EV columns | Emphasize directional pair |
| 6:30–7:40 | Record pass, concern, or fail | Do not run unless the model matches the protocol |

## 7. Running FEAT

Reusable start: approved and saved sequence-pilot `.fsf` with unused output path.

| Time | Authentic action | Evidence/QC |
| --- | --- | --- |
| 0:00–1:20 | Perform the visible preflight and save `.fsf` | Input, TR, npts, preprocessing, registration, EVs, contrasts |
| 1:20–2:00 | Confirm output path is new, then select Go once | Never create a second run because the GUI is quiet |
| 2:00–4:30 | Show `.feat` directory creation and progress report | Capture real stage changes and timestamps |
| 4:30–6:20 | Open report log and identify the current command | Explain first-explicit-error triage |
| 6:20–7:40 | Show completed directory structure and record paths | Computation complete is not scientific QC complete |

## 8. Understanding the `.feat` directory

Reusable start: completed sequence-pilot output.

| Time | Authentic action | Evidence/QC |
| --- | --- | --- |
| 0:00–1:30 | List top-level files and open `design.fsf` | Establish configuration record |
| 1:30–2:40 | Show `design.mat`, `design.con`, and `design.png` | Link model and contrast numbering |
| 2:40–3:50 | Identify processed functional and motion diagnostics | Presence is not a QC pass |
| 3:50–5:10 | Inspect `reg/` contents | Separate transforms from anatomical verdict |
| 5:10–6:40 | Inspect `stats/` and name PE/cope/varcope/t/z families | Do not call every NIfTI a final result |
| 6:40–7:40 | Open `report.html` as an index | Summarize five audit questions |

## 9. PE, cope, varcope, t-statistic, and z-statistic

Reusable start: completed sequence-pilot output with contrast table accessible.

| Time | Authentic action | Evidence/QC |
| --- | --- | --- |
| 0:00–1:20 | Map contrast 3 to Left > Right | File number alone is insufficient |
| 1:20–2:40 | Show relevant PE images and define fitted column effects | Do not label PE as a contrast |
| 2:40–4:10 | Show cope3 and varcope3 ranges with `fslstats` | Effect estimate versus uncertainty |
| 4:10–5:20 | Show tstat3 and zstat3 | Standardized evidence is not effect size |
| 5:20–7:30 | Compare cope3, varcope3, and zstat3 in FSLEyes | Keep common slice and orientation |

## 10. Inspecting registration

Reusable start: completed sequence-pilot report and registration outputs.

| Time | Authentic action | Evidence/QC |
| --- | --- | --- |
| 0:00–1:00 | State BBR functional-to-structural and 12-DOF structural-to-MNI plan | Settings are attempts, not verdicts |
| 1:00–3:10 | Inspect functional-to-structural boundary montage | Cortex, ventricles, cerebellum, coverage |
| 3:10–5:10 | Inspect structural-to-standard montage | Check midline, posterior fossa, scaling, flips |
| 5:10–6:40 | Use FSLEyes edge/opacity overlay on ambiguous slices | Judge anatomical correspondence only |
| 6:40–7:40 | Record pass, concern, or fail with reason | Hold evidence frame for three seconds |

## 11. Interpreting the FEAT report

Reusable start: completed sequence-pilot report home page.

| Time | Authentic action | Evidence/QC |
| --- | --- | --- |
| 0:00–2:00 | Review Pre-stats and motion before results | Look for spikes, displacement, artifacts, coverage |
| 2:00–3:30 | Review Registration and state separate verdict | Multiple planes and landmarks |
| 3:30–5:00 | Review design matrix and all contrasts | Match report to `.fsf` and timing files |
| 5:00–6:40 | Open one Post-stats page and separate cope from z-stat | Thresholded color is not automatic importance |
| 6:40–7:50 | Write four-part QC summary | Input, registration, model, results |

## 12. Common Level 1 failures

Reusable start: safe copies of known-good design plus prepared non-destructive fault examples.

| Time | Authentic action | Evidence/QC |
| --- | --- | --- |
| 0:00–1:20 | Verify environment, `pwd`, `which Feat`, and `which feat` | Explain GUI versus saved-design runner |
| 1:20–2:50 | Demonstrate missing/wrong input path diagnosis | Do not alter source data |
| 2:50–4:20 | Demonstrate malformed or out-of-run timing diagnosis on a copy | Show first invalid row and restore good file |
| 4:20–5:30 | Demonstrate EV/contrast order check | A valid run can still encode the wrong hypothesis |
| 5:30–6:40 | Demonstrate output conflict and report-log triage | Read earliest explicit error |
| 6:40–7:50 | Write incident note and return to good state | One correction, new output path |

## 13. Complete guided analysis

Reusable start: fresh FEAT window plus staged ds000157 inputs and timing files.

| Time | Authentic action | Evidence/QC |
| --- | --- | --- |
| 0:00–2:00 | Verify 375 volumes, TR 1.6 s, 600-second duration, and events TSV | Show one Break, eight Food, eight Nonfood blocks |
| 2:00–4:20 | Configure Data and Pre-stats | New output; raw-input sequence; 60-second high-pass cutoff |
| 4:20–6:20 | Configure BBR structural registration and MNI 12-DOF mapping | Show exact skull-stripped T1 |
| 6:20–9:10 | Create Break, Food, Nonfood EVs | Custom three-column, Double-Gamma, no derivatives |
| 9:10–10:40 | Add Food > Nonfood and inverse contrasts | Weights `[0,1,-1]` and `[0,-1,1]` |
| 10:40–11:50 | Inspect design and record pre-run verdict | Stop on any mismatch |
| 11:50–13:00 | Save and launch once; transition over authentic elapsed compute | Preserve real logs and stages |
| 13:00–15:20 | Review motion, registration, design, and Food > Nonfood outputs | Cope effect versus z-stat evidence |
| 15:20–16:00 | Display four-part QC summary and exact output paths | Final state is auditable, not merely finished |

## Capture-state inventory

- `sequence-pilot-empty`: fresh FEAT first-level Full analysis.
- `sequence-pilot-data`: verified Data tab saved.
- `sequence-pilot-prestats`: Data and Pre-stats saved.
- `sequence-pilot-registration`: Data, Pre-stats, and Registration saved; Stats not yet configured.
- `sequence-pilot-evs`: registration plus Left/Right EVs saved.
- `sequence-pilot-model`: five contrasts and design-QC pass saved.
- `sequence-pilot-complete`: authentic completed `.feat` directory and report.
- `sequence-pilot-fault-copies`: missing path, malformed timing, swapped contrast, and output-conflict examples, never source data.
- `capstone-empty`: fresh FEAT plus ds000157 verified inputs.
- `capstone-complete`: authentic completed Food-versus-Nonfood `.feat` output and four-part QC note.
