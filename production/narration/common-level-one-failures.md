# Common Level 1 failures — narration

## 1. Use a fixed triage order

When a first-level analysis fails, begin with environment, location, existence, format, and logs. Record the current directory and verify the active FSL installation. In Neurodesk the graphical launcher is `Feat`, while lower-case `feat` expects a saved design file. Confusing those commands can look like a software failure when it is a launch mismatch.

Check the exact BOLD, structural, timing, and output paths. A copied path can point to the wrong participant or a Git-annex placeholder that has not been retrieved. Use `ls`, `fslval`, and short timing-file previews to establish that inputs exist and are readable.

## 2. Diagnose timing and model failures

For every three-column file, check three numeric columns, event counts, non-negative onsets, and events within the run duration. Confirm that the number and order of EVs match the contrast columns. An empty condition or a swapped contrast can yield a wrong model even if FEAT accepts the file.

If Post-stats controls are missing or the design preview is unavailable, verify that Stats is enabled, original EVs are defined, and contrasts are complete. Change one cause at a time so the successful correction remains identifiable.

## 3. Diagnose output and execution failures

Confirm that the chosen `.feat` output does not conflict with an earlier run. Open `report_log.html` and find the earliest explicit error rather than relying on the final summary line. If computation appears silent, inspect processes and recent file timestamps before launching another copy.

## 4. Diagnose image-quality failures

If the structural image looks unstripped, open both the original and BET output. If registration looks wrong, inspect the selected structural and standard images, brain coverage, boundary images, and transformation settings. Do not adjust multiple degrees of freedom or registration options without first identifying the visible failure.

Finish with a reproducible incident note: observed symptom, evidence checked, earliest cause, one correction, and new output path. A troubleshooting success is not merely a run that finishes; it is a run whose corrected inputs and QC evidence can be explained.
