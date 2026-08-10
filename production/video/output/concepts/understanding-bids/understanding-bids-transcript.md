# Understanding BIDS

## Understanding BIDS

Understanding BIDS. Read standardized neuroimaging filenames and find anatomy, function, events, and metadata. The goal is clear: Identify BIDS entities in a filename.

## Structure is part of the data

Structure is part of the data. The Brain Imaging Data Structure (BIDS) uses predictable folders and filenames so people and software can identify participants, sessions, tasks, runs, and modalities without relying on local naming conventions. A functional run lives under sub-*/func/ and pairs a _bold.nii.gz image with a _bold.json sidecar. Its _events.tsv file describes event onsets and durations. Anatomical T1-weighted data typically live under sub-*/anat/.

## Try this in Neurodesk

Now connect the idea to an observable check. First, list one participant folder. Next, find one bold image and its JSON sidecar. Then, find the matching events.tsv file. After that, translate each filename entity into plain language. The command shown on screen is an example. Adapt its path to your own working directory and verify the target before running it.

## What would make this interpretation trustworthy?

Quality control comes before interpretation. Before interpreting the result, confirm that the input, operation, and output support the same scientific question. A useful self-check is this: Why does a bold run need both NIfTI and JSON files? The NIfTI stores image data; the JSON sidecar stores acquisition metadata that may not be represented reliably in the image filename or header.

## Carry the reasoning into the next step

To recap: First, BIDS makes inputs discoverable and machine-readable. Next, match images, sidecars, and events by their shared entities. Before continuing, make sure you can explain this objective: Identify BIDS entities in a filename.

---

Source: tubric/2026s-fmri-class, Lab-0_Glossary.md, BIDS and file types; MIT License.
