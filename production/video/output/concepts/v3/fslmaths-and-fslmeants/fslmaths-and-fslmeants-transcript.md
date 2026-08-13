# fslmaths and fslmeants

## Transform first, measure second

Fslmaths and fslmeants often appear together, but they do different jobs. Fslmaths applies operations in sequence and writes a new image. Fslmeants uses a mask to summarize a four-dimensional time series across selected voxels.

## Operations run left to right

Fslmaths reads an input, applies operations from left to right, and writes an output. A threshold removes values below a cutoff. Binarization converts the remaining selection to ones. The output is a new mask, not a label permanently attached to the original image.

## Make the spatial choice explicit

This example thresholds a statistical image, binarizes the result, and saves a mask. Fslmeants then extracts the mean BOLD value inside that mask for every volume. The output is a time series whose meaning depends entirely on the mask and source image.

## Matching dimensions are not enough

Two files can share dimensions while representing different anatomy. Check the headers, then overlay the mask on the exact image used for extraction. Confirm coverage across slices. A time series extracted from the wrong space is precise but meaningless.

## Transform, verify, then measure

Use fslmaths to create a derived image and fslmeants to measure a time series within a mask. Preserve the operation order, inspect the mask in the source space, and only then interpret the extracted values.
