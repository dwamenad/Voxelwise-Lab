# Functional to Anatomical Registration

## Bridging function and anatomy

Functional fMRI data has high temporal resolution but low spatial resolution and significant geometric distortion. To localize activations onto gyral anatomy, we must accurately align the functional images to the participant's own high-resolution T1 structural scan.

## Aligning the cortical ribbon

Rather than matching raw voxel intensities, FSL uses Boundary-Based Registration, or BBR. BBR segments the white matter boundary on the T1 scan and evaluates the intensity gradient across that boundary in the functional image. This makes it remarkably resilient to EPI susceptibility distortions.

## Inspect the red outline overlay

In the FEAT registration report, examine the red outline representing the structural white matter boundary overlaid on the functional image. Look closely at the lateral ventricles, the corpus callosum, and the Sylvian fissure. If the red lines sit outside cortical boundaries, registration has failed and must be rerun.

## Registration rules

Within-subject functional-to-structural alignment must always use 6 degrees of freedom. Choose BBR as your cost function, and verify the red outline across multiple slices before accepting statistical results.
