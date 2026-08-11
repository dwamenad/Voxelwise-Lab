# Interpreting the FEAT report — narration

## 1. Read in causal order

Open `report.html`, but do not begin with Post-stats. The report is a linked quality-control narrative. Start with the input and Pre-stats evidence, continue to Registration and the design, and only then interpret thresholded results.

In Pre-stats, review the mean functional image, motion plots, and available diagnostics. Look for spikes, sustained displacement, abrupt changes, missing coverage, or artifacts that could explain apparent task effects. Motion correction running is not the same as motion being acceptable.

## 2. Review space and model

Open Registration and inspect functional-to-structural and structural-to-standard boundary images across the brain. Record a separate registration verdict rather than folding it into an overall impression.

Open the Stats section. Match the design matrix columns to Left and Right, confirm that the timing pattern is plausible, and read all five contrast rows. Note any strong correlations or unexpected columns. The report should agree with the `.fsf`, timing files, and experimental protocol.

## 3. Interpret Post-stats last

Now open one contrast page, beginning with its name and weights. Distinguish the cope, which estimates the contrast effect, from the z-statistic, which expresses standardized evidence. Describe thresholding as the procedure shown in the report rather than as a guarantee that every colored voxel is scientifically important.

Inspect cluster tables and renderings in the context of coverage and registration. A bright cluster outside credible brain coverage or attached to a failed alignment is not rescued by its color or statistic.

## 4. Produce a compact QC note

End with four statements: input and motion quality, registration quality, model validity, and result interpretation. Each statement should cite a visible piece of evidence and use pass, concern, or fail where appropriate.

The report is complete only when these sections form a coherent chain. If an earlier link fails, later inference must be qualified or withheld. This order prevents a compelling thresholded image from becoming the first and only quality check.
