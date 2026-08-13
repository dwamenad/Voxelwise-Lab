# Confound regressors

## Not every pattern is the task

Measured BOLD contains task-related variation and many other patterns. Confound regressors represent structured nuisance variation, such as head motion or slow drift, so the GLM does not attribute all shared change to the task. They reduce some bias; they do not repair every artifact.

## Task and nuisance columns coexist

Task and nuisance regressors enter the same design matrix but support different interpretations. The task columns estimate effects of interest. The nuisance columns absorb specified variation. Because the estimates are conditional, strong dependence between columns can change both precision and interpretation.

## Plots reveal structured movement

Motion parameters describe translation and rotation across the run. Inspect the plots for abrupt jumps, slow drift, and patterns synchronized with the task. A motion regressor can reduce linear shared variance, but task-correlated motion is especially difficult to separate.

## Confounds cannot restore lost information

Confound regression does not reconstruct missing anatomy or undo every motion artifact. Distortion can depend on position in the magnetic field, and spin-history effects can persist after realignment. Severe problems may require censoring, exclusion, or a revised acquisition—not another regressor.

## Model nuisance, inspect damage

Confound regressors help separate specified nuisance variation from task effects. Inspect the nuisance patterns, their relationship to the task, and the underlying images. A cleaner model does not automatically mean the original data became valid.
