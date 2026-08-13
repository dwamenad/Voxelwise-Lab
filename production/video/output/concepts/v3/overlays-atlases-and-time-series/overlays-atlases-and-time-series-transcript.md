# Overlays, atlases, and time series

## One coordinate, several questions

A single coordinate can support several observations. Overlays compare spatial relationships. A time-series plot shows how signal changes across volumes. An atlas lookup supplies a reference label. These sources complement one another, but none should be treated as unquestionable ground truth.

## Overlay order changes what you see

The upper overlay can hide the image beneath it. Use opacity, color maps, and display ranges to expose boundaries in both images. A good display does not make alignment true; it makes agreement and disagreement easier to inspect.

## A voxel is a time series

In a four-dimensional BOLD image, each voxel contains a sequence of values. The plot shows that sequence across the run. Spikes, slow drift, and task-related structure are different patterns; seeing a change does not yet identify its cause.

## A label is a reference

An atlas label is a reference derived from a template or population. It may be probabilistic, and individual anatomy varies. Confirm the coordinate space, inspect the participant's anatomy, and report uncertainty rather than presenting an atlas boundary as exact truth.

## Combine evidence, preserve uncertainty

Use overlays, time series, and atlas labels together. Confirm spatial alignment, inspect temporal behavior, and keep atlas uncertainty visible. A defensible interpretation states what each view contributes and what it cannot establish.
