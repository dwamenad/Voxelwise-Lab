# Avoiding Circularity (Double Dipping)

## The double dipping trap

Circularity, commonly known as double dipping, occurs when data selection criteria are not independent of the subsequent statistical test. If you search the whole brain for voxels showing greater activation for task over baseline, and then extract and report the mean activation from those exact voxels, your effect sizes and p-values will be artificially inflated.

## Four ways to preserve independence

You can prevent circularity through four standard strategies: define regions using anatomical atlases; run an independent localizer scan; use orthogonal contrasts where selection and testing are mathematically uncorrelated; or apply leave-one-subject-out cross-validation.

## Independence rules

Never perform hypothesis tests on voxels selected with that same test. Always derive region boundaries independently to ensure your reported effect sizes are scientifically defensible.
