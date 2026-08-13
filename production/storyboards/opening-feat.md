# Opening FEAT — live walkthrough storyboard

## Production target

- Target length: 6–8 minutes
- Source: authenticated Neurodesk Play session, FSL 6.0.7.22
- Frame: 1920×1080, 30 fps, H.264/AAC
- Narration: synchronized Daniel, Samantha, Tessa, Karen, and Rishi tracks; Daniel is the default
- Evidence rule: show only authentic Neurodesk, terminal, and FEAT states
- Safety rule: this lesson identifies the interface; it does not configure or run an analysis

## Scene plan

| Time | Authentic screen action | Teaching purpose | QC note |
| --- | --- | --- | --- |
| 0:00–0:25 | Show the clean Neurodesktop workspace and move to the Applications menu | Establish the approved environment and lesson objective | No account details, tokens, unrelated tabs, or personal files visible |
| 0:25–1:10 | Navigate Applications → Neurodesk → Functional Imaging → FSL → 6.0.7.22 | Demonstrate versioned software launch rather than assuming a host FSL installation | Keep the version menu readable for at least two seconds |
| 1:10–1:45 | In the FSL terminal, enter `Feat &` and wait for the GUI | Show the reproducible launch command and explain the background operator | Preserve the capital F; lower-case `feat` is the command-line runner |
| 1:45–2:30 | Show the FEAT landing state. Point to the analysis-level control and select First-level analysis | Define the modeled unit: one run from one participant | Do not imply this is a group model |
| 2:30–3:10 | Point to the analysis-type control and select Full analysis | Distinguish configuration scope from scientific correctness | State that preprocessed inputs may require a different choice |
| 3:10–3:50 | Open Data, then return to the main FEAT view | Identify input image, TR, volume count, and output identity | Do not populate paths in this lesson |
| 3:50–4:30 | Open Pre-stats | Identify motion correction, brain extraction, smoothing, and temporal filtering | Emphasize avoiding duplicated preprocessing |
| 4:30–5:05 | Open Registration | Identify functional, structural, and standard-space alignment | Completion is not proof of anatomical quality |
| 5:05–5:50 | Open Stats and expose the EV/contrast controls without editing them | Connect EVs, convolution, contrasts, and the design preview | No default setting is presented as universally safe |
| 5:50–6:20 | Open Post-stats | Identify thresholding and report-generation controls | Results come after input, preprocessing, registration, and design QC |
| 6:20–6:50 | Open Misc, then return to Data | Identify auxiliary settings and reinforce the tab sequence | Avoid lingering over rarely used controls |
| 6:50–7:20 | Reframe the full FEAT window and summarize the workflow | End with a stable mental map of the interface | Hold final frame for at least three seconds |

## Capture checklist

- [x] Neurodesktop and FEAT text remain legible at normal playback size.
- [x] Pointer moves deliberately and never hides the named control.
- [x] No values are changed except the analysis level and analysis type required for the demonstration.
- [x] The recording shows First-level analysis and Full analysis as explicit selections.
- [x] Each tab appears on screen while its purpose is narrated.
- [x] Captions avoid covering terminal commands, tab labels, or FEAT controls.
- [x] The review master contains no authentication details or unrelated browser content.
