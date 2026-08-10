# Overlays, atlases, and time series

## Overlays, atlases, and time series

Overlays, atlases, and time series. Compare aligned images, inspect a bold signal over time, and use atlas labels as references. The goal is clear: Configure overlay opacity and color maps.

## One coordinate, several sources of evidence

One coordinate, several sources of evidence. Overlays let you compare images in the same coordinate space. Time-series plots show how a voxel changes across volumes. Atlas lookup adds an anatomical label, but atlas boundaries are probabilistic and should not be treated as ground truth for every participant. Registration quality control is easiest when boundaries from two images can be seen together. Alternate visibility, adjust opacity, or use an edge overlay. For functional data, look for sudden spikes, drifts, or dropout and relate them to later motion and preprocessing reports.

## Try this in Neurodesk

Now connect the idea to an observable check. First, load an anatomical background and a functional or standard-space overlay. Next, reduce overlay opacity. Then, check alignment in at least three distant locations. After that, open atlas tools and note the probability for one label. Record what you observe so the decision remains reviewable.

## What would make this interpretation trustworthy?

Quality Control Check. Inspect multiple slices and brain boundaries. Do not accept registration because the images overlap near the center. A useful self-check is this: Why is a single central slice insufficient for registration quality control? Misalignment can be local or more visible near boundaries; several planes and regions must be inspected.

## Carry the reasoning into the next step

To recap: First, use overlays to test spatial correspondence. Next, atlas labels are references, not perfect individual anatomy. Before continuing, make sure you can explain this objective: Configure overlay opacity and color maps.

---

Source: tubric/2026s-fmri-class, Lab-1_FSLeyes.md, Navigating anatomy, functional data, and atlas tools; MIT License.
