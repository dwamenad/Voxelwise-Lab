# Complete guided analysis — narration

## 1. Validate the capstone inputs

This capstone builds a complete first-level model for OpenNeuro ds000157, participant sub-01, task passive image viewing. The BOLD image contains 375 volumes at a 1.6-second TR, giving a 600-second run. The functional dimensions are 64 by 64 by 30. The skull-stripped T1-weighted image has already been generated and must be inspected before use.

Open the BIDS events file. It contains one Break block, eight Food blocks, and eight Nonfood blocks. The three-column timing files `sub-01_break.txt`, `sub-01_food.txt`, and `sub-01_nonfood.txt` were generated from the onset, duration, and trial-type fields. Preview each file and verify that all rows lie inside the run.

## 2. Configure FEAT from evidence

Select First-level and Full analysis. Set one input, TR 1.6 seconds, 375 volumes, and the verified BOLD path. Use the new output `/home/jovyan/Voxelwise-Walkthroughs/outputs/sub-01_passiveimageviewing_L1` and confirm it does not already exist.

For this raw course example, configure MCFLIRT motion correction, functional BET, five-millimeter smoothing, Regular down slice timing, 60-second high-pass filtering on, low-pass filtering off, and intensity normalization off.

In Registration, select the skull-stripped T1 as the main structural image. Use normal search with BBR for functional-to-structural alignment. Use the MNI152 two-millimeter brain, normal search, and 12 degrees of freedom for structural-to-standard alignment.

## 3. Build the model

Create three original EVs in this order: Break, Food, Nonfood. Load `sub-01_break.txt`, `sub-01_food.txt`, and `sub-01_nonfood.txt` as custom three-column timing files. Use Double-Gamma convolution, leave temporal derivatives off, and keep temporal filtering on.

Create `Food greater than Nonfood` with weights zero, one, minus one. Create `Nonfood greater than Food` with weights zero, minus one, one. Read each row against the displayed EV names.

Open View design. Confirm all three predictors contain the expected blocks, correlations are understood, and both contrasts select the intended columns. Record a pre-run QC verdict.

## 4. Run and inspect in order

Save the `.fsf`, select Go once, and monitor the report log and output timestamps. When FEAT completes, inspect Pre-stats and motion evidence first. Then inspect functional-to-structural and structural-to-standard registration. Reopen the design matrix and contrast definitions before viewing Post-stats.

For Food greater than Nonfood, open the cope, varcope, and z-statistic. Explain the cope as the estimated contrast effect and the z-statistic as standardized evidence, not effect size.

## 5. Close with an auditable QC summary

Write four short findings: input and motion quality, registration quality, design validity, and result interpretation. Include pass, concern, or fail with the observed evidence. The capstone is complete only when the saved design, `.feat` output, named contrasts, and QC note tell the same scientific story.
