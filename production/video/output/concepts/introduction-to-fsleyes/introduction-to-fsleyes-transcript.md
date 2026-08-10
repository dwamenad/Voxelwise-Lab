# Introduction to FSLEyes

## Introduction to FSLEyes

Introduction to F S L Eyes. Load anatomical and functional NIfTI files and orient yourself in three planes. The goal is clear: Open files from the terminal.

## Visual inspection is an analysis step

Visual inspection is an analysis step. F S L Eyes lets you examine image geometry and intensity directly. The orthographic view shows the same location in three anatomical planes. The overlay list controls which images are visible and how they are colored. Start by checking that the brain is oriented sensibly, the field of view is complete, and signal is present. For four-D images, move through volumes or open the time-series view. A file loading without an error does not prove that the data are usable.

## Try this in Neurodesk

Now connect the idea to an observable check. First, launch F S L Eyes with a NIfTI path. Next, move the crosshair through the brain. Then, record one scanner coordinate and voxel coordinate. After that, for a bold file, open View then Time series. The command shown on screen is an example. Adapt its path to your own working directory and verify the target before running it.

## What would make this interpretation trustworthy?

Quality Control Check. Confirm orientation, brain coverage, and visible signal before beginning preprocessing. A later pipeline cannot recover anatomy that was never acquired. A useful self-check is this: Why can the same point have both voxel and scanner coordinates? Voxel coordinates index the image grid; scanner/world coordinates locate that point in physical space using the image affine.

## Carry the reasoning into the next step

To recap: First, inspect every key input and output visually. Next, use the overlay list and coordinate panel deliberately. Before continuing, make sure you can explain this objective: Open files from the terminal.

---

Source: tubric/2026s-fmri-class, Lab-1_FSLeyes.md, Viewing MRI data and functional time series; MIT License.
