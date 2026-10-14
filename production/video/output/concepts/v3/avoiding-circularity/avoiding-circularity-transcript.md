# Avoiding Circularity (Double Dipping)

## The double dipping trap

Circularity, commonly known as double dipping, occurs when data selection criteria are not independent of the subsequent statistical test. If you search the whole brain for voxels showing greater activation for task over baseline, and then extract and report the mean activation from those exact voxels, the extracted effect estimate can be biased upward and an uncorrected follow-up test can be invalid.

## Preserve selection independence

Use a prespecified anatomical mask, an independent localizer, or held-out data for selection and testing. Orthogonal contrast vectors alone do not guarantee statistical independence. Cross-validation must keep selection separate from the held-out observations and account for dependence between folds.

## Independence rules

Never perform hypothesis tests on voxels selected with that same test. Always derive region boundaries independently to ensure your reported effect sizes are scientifically defensible.
