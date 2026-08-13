# Understanding contrasts in FSL FEAT

## A contrast is a question

A first-level model may contain several explanatory variables, but a scientific result begins with a focused question. Was the response during left-button trials greater than the response during right-button trials? A contrast turns that comparison into precise weights. Those weights must agree with the model columns and with the words used to describe the hypothesis.

## Estimate first, combine second

At each voxel, FEAT fits the general linear model. The design matrix contains explanatory variables, and beta contains one fitted coefficient for each model column. A contrast does not change those estimates. It defines a linear combination, written as c transpose beta, where c is the vector of hypothesis weights.

## Selection is not comparison

Suppose the explanatory-variable order is Left followed by Right. The weights one, zero select the Left coefficient. Zero, one select the Right coefficient. In a usual task model, each is tested relative to the implicit baseline represented by the rest of the model. Neither is a direct Left-versus-Right comparison. One, one tests their positive sum, while one half, one half tests the numerical average.

## Signs define direction

To compare Left directly with Right, use one, negative one. This computes beta Left minus beta Right and tests the positive direction, Left greater than Right. Reversing the signs tests Right greater than Left. A negative weight means that a coefficient is subtracted in this hypothesis. It does not, by itself, mean deactivation.

## Weights follow EV order

Contrast numbers only have meaning when aligned with the correct design-matrix columns. If the actual order is Right then Left, one, negative one tests Right greater than Left, even if the contrast is named Left greater than Right. Write the EV order, read each contrast as a sentence, and point from every weight to its displayed column before running FEAT.

## Name, enter, verify

In FEAT, open Full model setup, then Contrasts and F-tests. Give each contrast a scientific name, enter weights in the displayed EV order, and inspect the arrows in the design preview. Before selecting Done, compare every row with the analysis plan and save the design file so the model specification remains reproducible.

## Separate effect from evidence

For each contrast, FEAT writes several related outputs. The cope is the weighted contrast estimate in model units. The varcope quantifies uncertainty in that estimate. A t statistic compares the cope with its standard error, and FEAT converts it to a z statistic for inference. A z-statistic map is standardized evidence, not an effect-size map.

## Make every layer agree

Before running FEAT, list the EVs in matrix order and state the scientific question for every contrast. Translate the sentence into weights, then translate the weights back into a sentence. Inspect the design matrix and contrast arrows. Finally, distinguish the effect estimate, its uncertainty, and the standardized statistic. The model is ready when the design, weights, and scientific language tell the same story.
