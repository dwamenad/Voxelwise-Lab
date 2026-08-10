# Reviewing a complete FEAT report

## Reviewing a complete FEAT report

A completed FEAT report is not automatically a valid analysis. It is a structured record that lets you review preprocessing, registration, model design, and statistical output in an evidence-based order. This video shows how to read that record before interpreting bright clusters or reporting a result.

## Inputs before inference

Review the report in dependency order. Begin with Pre-stats and ask whether motion, masking, and preprocessing outputs are plausible. Continue to Registration and inspect alignment across the brain. Then examine the design matrix, explanatory variables, and contrasts under Stats. Only after those checks should you interpret thresholded results under Post-stats. A failure early in this chain limits what later pages can support.

## What did you actually check?

Write one defensible statement for each major dependency. For motion, describe the plot and any abrupt displacement rather than saying it looks fine. For registration, name anatomical boundaries and multiple slices that support a pass or concern. For the design, match columns to timing files and contrast arrows to the planned hypothesis. Specific observations are auditable; vague reassurance is not.

## A z-statistic is not an effect size

When you reach the results, keep the output types separate. A cope is the estimated contrast effect. A varcope describes uncertainty in that estimate. A t-statistic or z-statistic standardizes evidence relative to uncertainty. A thresholded map displays locations surviving the chosen inferential procedure. Do not describe a z-statistic map as an effect-size map, and do not let an attractive cluster override failed motion, registration, or design checks.

## Pass, concern, or fail—with evidence

Finish with an explicit quality-control decision: pass, concern, or fail, followed by the evidence that supports it. Record any limitation and explain how it affects interpretation. Preserve the report, design files, and notes together. The purpose of review is not to prove that FEAT completed. It is to decide whether this run can support the scientific claim you intend to make.

---

Source: tubric/2026s-fmri-class, Lab-3_FSL_Level1.md, Viewing and QC'ing FEAT output; MIT License.
