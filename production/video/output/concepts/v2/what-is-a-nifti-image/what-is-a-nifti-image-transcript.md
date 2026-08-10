# What is a NIfTI image?

## A NIfTI stores sampled space

A NIfTI file stores numerical samples arranged in space. One sample is a voxel, a tiny three-dimensional box. Voxels form slices, slices form a three-dimensional volume, and repeated volumes form a four-dimensional fMRI time series.

## Voxel, volume, time

An anatomical image is often one three-dimensional volume. A BOLD image usually contains many volumes sampled at successive time points. The file header records dimensions, voxel sizes, orientation transforms, and timing so software can interpret the array correctly.

## Dimensions describe the container

Fslinfo exposes the image header. Here, the first three dimensions describe a sixty-four by sixty-four by forty spatial grid. Dimension four contains two hundred forty time points, and pixdim four reports a two-second repetition time. These values describe sampling, not data quality.

## Smaller voxels are not automatically better

Voxel dimensions define spatial sampling, not anatomical precision. Smaller voxels can reduce signal-to-noise, and functional localization also depends on physiology, preprocessing, and experimental design. Never translate voxel size directly into certainty about a cognitive process.

## Read shape before signal

A NIfTI image is a structured numerical container. Understand its voxels, volumes, dimensions, orientation, and timing before analyzing intensity values. Sampling describes how data were arranged; it does not guarantee what the data can reveal.
