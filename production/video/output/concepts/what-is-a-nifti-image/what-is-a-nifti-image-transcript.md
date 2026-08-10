# What is a NIfTI image?

## What is a NIfTI image?

What is a NIfTI image? Interpret the dimensions and spatial metadata stored in .nii and .nii.gz files. The goal is clear: Differentiate voxels and volumes.

## A 4D image is a time-ordered stack of 3D volumes

A four-D image is a time-ordered stack of three-D volumes. A voxel is a three-dimensional sample. An anatomical NIfTI is usually one three-D volume; a bold NIfTI usually contains many volumes along a fourth, temporal dimension. Header metadata records dimensions, voxel sizes, orientation, and timing. If dim4 is 240, the bold series contains 240 volumes. Spatial resolution comes from pixdim1 through pixdim3; pixdim4 often records the T R in seconds. Always verify the units in the header and JSON sidecar.

## Try this in Neurodesk

Now connect the idea to an observable check. First, navigate to a NIfTI file. Next, run F S L info on it. Then, record dim1–dim4 and pixdim1–pixdim4. After that, decide whether the file is anatomical or functional. The command shown on screen is an example. Adapt its path to your own working directory and verify the target before running it.

## What would make this interpretation trustworthy?

Quality control comes before interpretation. This example is a 64 by 64 by 40 image sampled over 240 time points with a 2-second T R. A useful self-check is this: What does dim4 = 240 mean for a bold image? The file contains 240 three-dimensional volumes in its time series.

## Carry the reasoning into the next step

To recap: First, voxels make up volumes; volumes make up a four-D time series. Next, inspect headers rather than inferring dimensions from filenames. Before continuing, make sure you can explain this objective: Differentiate voxels and volumes.

---

Source: tubric/2026s-fmri-class, Lab-0_Glossary.md, NIfTI, voxel, and 3D vs 4D data; MIT License.
