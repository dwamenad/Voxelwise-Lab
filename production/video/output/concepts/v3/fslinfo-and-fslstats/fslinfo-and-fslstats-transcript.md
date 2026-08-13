# fslinfo and fslstats

## Container facts versus voxel values

Fslinfo and fslstats answer different questions. Fslinfo reads the NIfTI header and describes the image container. Fslstats calculates summaries from voxel values. A statistic is meaningful only when you know which image and which voxels contributed to it.

## Metadata and statistics differ

Use fslinfo when the question is about structure: dimensions, voxel spacing, orientation, or timing. Use fslstats when the question is about intensity values. The two outputs complement one another, but one cannot substitute for the other.

## State what was measured

With dash V, fslstats reports the number of nonzero voxels followed by their physical volume in cubic millimetres. Those values describe the selected image. They do not automatically describe the whole brain, because zeros, thresholds, and masks determine which voxels are counted.

## Make the voxel set visible

A numerical result can be perfectly computed and scientifically wrong. Confirm the input image and coordinate space. If a mask is involved, overlay it on the exact source data. Record the option and threshold so another person can reproduce the voxel set.

## Describe both data and selection

Use fslinfo to understand the image container and fslstats to summarize values. Never report a number without the image, option, threshold, and voxel selection that define it. Context turns output into interpretable evidence.
