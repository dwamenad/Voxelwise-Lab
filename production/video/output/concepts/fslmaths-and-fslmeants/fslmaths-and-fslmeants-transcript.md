# fslmaths and fslmeants

## fslmaths and fslmeants

F S L maths and F S L means. Create masks and extract a mean time series without losing track of image space. The goal is clear: Build a simple thresholded mask.

## Transform first, measure second

Transform first, measure second. F S L maths applies image operations in sequence and writes a new image. F S L means summarizes a four-D time series within a mask. The mask and source data must have compatible dimensions and spatial alignment. A binary mask contains 1 for included voxels and 0 elsewhere. Thresholding alone may not create a scientifically valid ROI; it is simply an operation. View every derived mask before using it to extract values.

## Try this in Neurodesk

Now connect the idea to an observable check. First, create a binary mask from an example image. Next, open the mask over the source image. Then, confirm dimensions with F S L info. After that, extract a mean time series and inspect its first values. The command shown on screen is an example. Adapt its path to your own working directory and verify the target before running it.

## What would make this interpretation trustworthy?

Quality Control Check. Overlay the mask on the exact image used for extraction. Matching dimensions do not guarantee meaningful anatomical alignment. A useful self-check is this: What must you verify before using a mask with F S L means? That it is scientifically appropriate and aligned to the same dimensions and space as the four-D input.

## Carry the reasoning into the next step

To recap: First, F S L maths writes derived images; preserve meaningful names. Next, never extract a signal from an uninspected mask. Before continuing, make sure you can explain this objective: Build a simple thresholded mask.

---

Source: tubric/2026s-fmri-class, Lab-1_FSLeyes.md, Measuring the brain and atlas masks; MIT License.
