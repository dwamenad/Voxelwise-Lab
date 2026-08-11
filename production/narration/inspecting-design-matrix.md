# Inspecting the design matrix — narration

## 1. Treat the preview as the model

Before FEAT spends time preprocessing and fitting data, open View design. The matrix is not decorative output. It is the clearest summary of what FEAT will estimate: one row for each modeled time point and columns derived from the Left and Right event files after hemodynamic convolution and temporal filtering.

Match the first displayed predictor to Left and the second to Right. The event structure should be visible in both columns, and neither column should be empty or constant. Compare their timing with the three-column files. If the design begins at a different time, contains events beyond the run, or shows two unexpectedly identical predictors, close the preview and repair the setup.

## 2. Inspect separability and model complexity

Review the correlation information. Strongly correlated columns are not automatically invalid, but they limit how confidently the model can separate their contributions. The appropriate question is whether the timing and model specification permit the planned Left-versus-Right comparisons to be estimated.

This design intentionally leaves temporal derivatives off, so the task portion should correspond to the two original EVs without derivative columns. Any nuisance columns added by preprocessing or another strategy must be identified rather than mistaken for task effects.

## 3. Verify contrasts on the same screen

Read the five contrast rows against the matrix order. Left is `[1, 0]`; Right is `[0, 1]`; Left greater than Right is `[1, -1]`; Right greater than Left is `[-1, 1]`; and Left plus Right is `[1, 1]`.

Pay particular attention to the directional contrasts. A swapped pair will still produce a valid cope and z-statistic, but the scientific statement will be reversed.

## 4. Record a pre-run QC decision

End with an explicit verdict: pass, concern, or fail. A pass means the columns contain the expected timing, the EV order is correct, correlations are understood, and every contrast selects the intended effects. A concern must be documented and resolved or justified. A fail means do not run.

Only after the visual model tells the same story as the protocol and timing files should the design proceed to computation.
