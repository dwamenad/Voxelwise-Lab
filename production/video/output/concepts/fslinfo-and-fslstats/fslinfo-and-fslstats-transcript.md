# fslinfo and fslstats

## fslinfo and fslstats

F S L info and F S L stats. Inspect image metadata and compute targeted summary statistics. The goal is clear: Choose F S L info for metadata.

## Metadata describes the container; statistics describe its values

Metadata describes the container; statistics describe its values. F S L info reports header fields such as dimensions and voxel sizes. F S L stats computes statistics over image intensities, optionally after applying thresholds or masks. A number is only interpretable when you know which voxels contributed to it. For example, F S L stats image -R reports the robust intensity range. -V reports the number and physical volume of nonzero voxels. Nonzero voxels are not automatically the brain; background noise, skull, or artifacts may also be nonzero.

## Try this in Neurodesk

Now connect the idea to an observable check. First, run F S L info and record image dimensions. Next, use F S L stats -R for the intensity range. Then, use -V and explain both returned numbers. After that, open the image to verify what was counted. The command shown on screen is an example. Adapt its path to your own working directory and verify the target before running it.

## What would make this interpretation trustworthy?

Quality control comes before interpretation. For -V, the first value is the count of nonzero voxels and the second is their volume in cubic millimetres. A useful self-check is this: Why is F S L stats image -V not automatically a brain-volume measurement? It counts all nonzero voxels, which may include non-brain signal unless the image is a validated brain mask.

## Carry the reasoning into the next step

To recap: First, match the utility to the question. Next, define which voxels a statistic summarizes. Then, check numerical results against the image. Before continuing, make sure you can explain this objective: Choose F S L info for metadata.

---

Source: tubric/2026s-fmri-class, Lab-0_Glossary.md, fslstats and estimating volume; MIT License.
