# Introduction to FSLEyes

## Looking is part of analysis

Visual inspection is an analysis step, not decoration. FSLEyes shows the same coordinate in sagittal, coronal, and axial planes. It lets you inspect orientation, brain coverage, image intensity, and the relationship between overlays before trusting a pipeline result.

## Crosshairs connect the planes

The orthographic display shows three views of one location. Crosshairs connect those planes, so a movement in one view updates the others. The overlay list controls which images are visible, their order, opacity, and color mapping.

## Check orientation and coverage

Scroll from one end of the brain to the other. Confirm that left and right orientation are understood, the expected anatomy is covered, and no large region is missing or severely distorted. A later analysis cannot recover anatomy that was never acquired.

## Plausible is not aligned

Two images can overlap near the center and still be misregistered elsewhere. Inspect multiple slices and anatomical boundaries. Adjust opacity and color mapping so disagreement is visible. A reassuring first impression is not a quality-control result.

## Inspect before you infer

Use FSLEyes to understand the image before relying on derived results. Orient yourself in three planes, inspect coverage across the volume, and compare overlays at visible boundaries. Visual evidence is a required part of quality control.
