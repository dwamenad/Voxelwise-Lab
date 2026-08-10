# Understanding contrasts in FSL FEAT

## A contrast is a question

A first-level model can contain several explanatory variables, but a scientific result usually begins with a narrower question. Was the response during left-button trials greater than the response during right-button trials? Was one condition positively related to the measured BOLD signal? A contrast turns a question like that into a precise set of weights. In this lesson, we will connect those weights to the parameter estimates in the general linear model, interpret baseline and difference contrasts, and identify the quality-control checks that prevent a correct calculation from answering the wrong question.

## FEAT estimates the model first

At each voxel, FEAT fits the general linear model. The design matrix contains the explanatory variables, or EVs, and beta contains one estimated coefficient for each model column. Those coefficients describe how strongly each predictor contributes to the observed signal after accounting for the other predictors. A contrast does not refit the model and does not change the original beta estimates. Instead, it defines a linear combination of selected estimates. In compact notation, the contrast estimate is c transpose beta. The vector c contains the weights that encode the hypothesis.

## Single-condition contrasts

Suppose the original EV order is Left followed by Right. The contrast one, zero selects the Left coefficient. In the usual FEAT task model, it tests a positive Left effect relative to the implicit baseline represented by the rest of the model. Zero, one selects the Right coefficient. These are not direct comparisons between Left and Right. They ask whether each selected estimate is positive in its modeled context. A contrast using one, one tests the positive sum of the two coefficients. Using one half, one half gives their numerical average. Those scaled contrasts have the same t or z statistic, but their cope values are on different scales, so name and report them carefully.

## Difference contrasts

To compare Left directly with Right, use one, negative one. This computes beta Left minus beta Right. The null hypothesis is that the weighted difference equals zero, and the positive direction tests whether Left is greater than Right. Reversing the signs gives negative one, one, which tests Right greater than Left. A negative weight does not mean deactivation. It means that the corresponding coefficient is subtracted in this particular hypothesis. Direction matters: Left greater than Right and Right greater than Left are related, but they are not interchangeable labels for one contrast.

## Weights follow EV order

Contrast numbers only have meaning when they are aligned with the correct design-matrix columns. If the actual order is Right then Left, the weights one, negative one test Right greater than Left, even if the contrast is named Left greater than Right. Before running FEAT, write the EV order, read each contrast as a sentence, and point from every weight to its displayed column name. Then inspect the design preview. Empty columns, swapped timing files, duplicated predictors, or unexpected derivatives can all change the interpretation. A plausible activation map cannot repair a mislabeled hypothesis.

## Name, enter, and verify

In FEAT, open Full model setup and then Contrasts and F-tests. Give each contrast a scientific name rather than a generic number. Enter the weights in the displayed EV order. For the source lab, the model contains Left and Right EVs, followed by contrasts for each condition, both directional differences, and a combined positive effect. The screenshot here is evidence from the real teaching workflow, not a generated interface. Before selecting Done, compare every row with the approved analysis plan and save the design file so the model specification remains reproducible.

## Effect, uncertainty, and evidence

For each contrast, FEAT writes several related outputs. The cope is the contrast of parameter estimates: the weighted effect in the units of the model. The varcope describes uncertainty in that contrast estimate. Dividing the cope by its standard error produces a t statistic, which FEAT converts to a z statistic for inference and reporting. A z-statistic map is therefore standardized evidence, not an effect-size map. Higher-level analyses use the cope together with its varcope. Thresholded z-statistic images help visualize inferential results, but interpretation should begin only after checking preprocessing, registration, the design matrix, and the contrast definition.

## Make the model tell the same story

Before you run FEAT, complete five checks. First, list EVs in matrix order. Second, state the scientific question for every contrast. Third, translate the sentence into weights and then translate the weights back into a sentence. Fourth, inspect the design matrix and contrast arrows visually. Fifth, distinguish the effect estimate, its uncertainty, and the standardized statistic you will later report. If the design, weights, and scientific language tell the same story, the contrast is ready to run. Next, the hands-on walkthrough will configure these contrasts in a live Neurodesk session and inspect the corresponding FEAT outputs.

---

Source: tubric/2026s-fmri-class (Lab-3_FSL_Level1.md, Lab-X_Contrast.md); MIT License.
