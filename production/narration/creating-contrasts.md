# Creating contrasts — narration

## 1. Translate questions into weights

The model order is Left followed by Right. A contrast is a weighted combination of those estimated effects; it does not refit the underlying model. Because the meaning of each number depends on column order, keep the EV names visible while entering weights.

Open the contrast manager and create five t-contrasts. Name the first `Left` with weights one and zero. This tests the Left EV relative to the implicit baseline represented by the rest of the model. Name the second `Right` with weights zero and one.

Name the third `Left greater than Right` and enter one, minus one. Its null hypothesis is that the Left-minus-Right contrast is zero. Name the fourth `Right greater than Left` and enter minus one, one. This is the directional opposite, not a duplicate label for the same test.

Finally, create `Left plus Right` with weights one, one. This tests their summed modeled response. Do not describe it as an average unless the weights are scaled and the interpretation explicitly supports that wording.

## 2. Read every row as a sentence

Point to the Left and Right columns, then read each contrast aloud. `[1, 0]` selects Left. `[0, 1]` selects Right. `[1, -1]` subtracts Right from Left. `[-1, 1]` subtracts Left from Right. `[1, 1]` adds both condition estimates.

This verbal check catches the common failure in which correct-looking numbers are entered under the wrong EV order. Contrast names should state the scientific direction clearly enough that a later reviewer does not need to infer it from `cope1` or `cope3`.

## 3. Finish with the preview

Use the design preview to confirm that every contrast arrow and weight is attached to the intended columns. No F-test is required for this course setup; adding one would answer another question and must be justified separately.

Save the design after the contrast manager accepts the rows. The contrast table is complete only when the names, weights, displayed EV order, and planned hypotheses all agree.
