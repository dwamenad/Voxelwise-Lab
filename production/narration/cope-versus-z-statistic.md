# PE, cope, varcope, t-statistic, and z-statistic — narration

## 1. Begin with parameter estimates

The general linear model estimates one coefficient for each modeled column at every voxel. In FEAT these parameter-estimate images are PEs. A positive PE for the Left predictor means the fitted Left-related contribution is positive in the model’s scale; it is not yet the Left-greater-than-Right hypothesis.

## 2. Build a contrast estimate

A cope applies one contrast row to the relevant PEs. For the `[1, -1]` contrast, the cope estimates Left minus Right. It preserves an effect-estimate scale and direction. This is the quantity whose uncertainty will be carried alongside it into appropriate higher-level modeling.

The matching varcope estimates the variance of that cope. Two voxels can have similar copes but different uncertainty because their residual variation or model precision differs.

## 3. Standardize evidence

The t-statistic scales the cope by its estimated standard error. FEAT then expresses the inference in z-statistic form for reporting. A larger z-statistic can arise from a larger estimated effect, lower uncertainty, or both. A z-statistic is therefore not an effect-size map.

Use `fslstats` to compare the numerical ranges of one PE, its cope, varcope, t-statistic, and z-statistic. Then open `stats/cope3`, `stats/varcope3`, and `stats/zstat3` in FSLEyes. The maps may look spatially related because they come from the same hypothesis, but they answer different questions.

## 4. Preserve the contrast identity

Before interpreting `cope3` or `zstat3`, open `design.con` or the FEAT contrast table. For this run, contrast three is Left greater than Right. File numbering without the named contrast is not enough for a scientific statement.

End with a compact distinction: PE is one fitted column effect; cope is a weighted contrast effect; varcope is uncertainty in that contrast; the t-statistic and z-statistic express standardized evidence. Thresholded z-statistic displays support inference under the chosen procedure, while the cope remains the effect estimate. Never substitute one label for another because two maps share a bright region.
