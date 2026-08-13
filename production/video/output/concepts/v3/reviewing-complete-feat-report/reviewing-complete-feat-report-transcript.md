# Reviewing a complete FEAT report

## Results depend on every earlier step

A completed FEAT report is not automatically a valid analysis. It is a chain of evidence. Review motion and preprocessing first, registration second, the design and contrasts third, and statistical inference last. A failure early in the chain limits every later conclusion.

## The report is a dependency map

Begin with pre-stats and ask whether motion, masking, and preprocessing outputs are plausible. Continue to registration and inspect anatomical correspondence. Then examine the design matrix, EVs, and contrasts. Only after those dependencies pass should you interpret thresholded results.

## Specific observations are auditable

For motion, describe the pattern and any abrupt displacement. For registration, name boundaries and locations that agree or fail. For design, match columns to timing files and contrast weights to the hypothesis. Specific observations can be reviewed; vague reassurance cannot.

## A z-statistic is not an effect size

A cope is the estimated contrast effect. A varcope describes uncertainty in that estimate. A t or z statistic standardizes evidence relative to uncertainty. A thresholded map shows locations surviving the chosen inferential procedure. Do not describe a z-statistic map as an effect-size map.

## Pass, concern, or fail—with evidence

Finish with an explicit quality-control judgment: pass, concern, or fail, followed by the observations that support it. Record limitations and their likely effect on interpretation. The goal is not to prove that FEAT finished; it is to decide what this run can defensibly support.
