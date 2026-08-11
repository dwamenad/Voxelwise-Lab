# Creating EVs — narration

## 1. Inspect timing inputs first

This model has two experimental conditions: Left and Right button guesses. The matching FSL three-column files contain 28 Left events and 25 Right events. Each row gives onset in seconds, duration in seconds, and amplitude. Preview both files in the terminal and confirm that their onsets are non-negative and fall within the 442-second run.

A three-column file can be syntactically valid while describing the wrong task or run. The filenames, event counts, and experimental meaning must therefore be checked before they enter FEAT.

## 2. Create the original EVs in a fixed order

Open Full model setup in the Stats tab and set the number of original EVs to two. Name EV 1 `Left` and EV 2 `Right`. Write that order down because every contrast weight will use it.

For Left, select Custom three-column format and load `_guess_allLeftButton.txt`. Choose Double-Gamma HRF convolution. Leave the temporal derivative off and keep temporal filtering on. Repeat the same settings for Right using `_guess_allRightButton.txt`.

The HRF convolution turns event timing into a delayed, smooth prediction of the BOLD response. The columns are no longer instantaneous event lists. A temporal derivative would add model flexibility and another effective column, but it is disabled because the source lab does not specify it for this exercise.

## 3. Inspect each predictor

Use the EV plot or model preview to verify that both predictors contain events, cover plausible parts of the run, and differ from one another. An empty column, an identical pair of columns, or events concentrated outside the modeled interval are reasons to stop.

Do not add motion estimates as task EVs. Nuisance regressors have a different interpretation and should follow a documented confound strategy. This walkthrough stays with the two condition EVs prescribed by the course.

Before closing the model setup, read the order again: Left, then Right. Confirm the exact timing file beside each name, Double-Gamma convolution, derivatives off, and temporal filtering on. Save the design. The next walkthrough will express hypotheses against this fixed EV order.
