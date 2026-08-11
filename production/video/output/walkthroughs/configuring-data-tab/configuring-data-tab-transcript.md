# Configuring the Data tab — narration

## 1. Verify the run before opening a chooser

This walkthrough configures the Data tab for one first-level run from OpenNeuro dataset ds005085, participant sub-10015. Before entering values in FEAT, use the terminal to inspect the exact four-dimensional BOLD image. `fslval` reports 260 volumes and a repetition time of 1.7 seconds. The image dimensions are 86 by 86 by 51. These header values are evidence; a remembered value or a value left over from another FEAT session is not.

The modeled run is `sub-10015_task-sharedreward_acq-mb3me1_bold.nii.gz`. Confirm all BIDS entities in the filename. Similar runs can sit beside each other, and selecting the wrong echo or acquisition can still produce a technically valid analysis of the wrong data.

## 2. Establish the analysis unit

In FEAT, select First-level analysis and Full analysis. Set the number of inputs to one. This model represents one run from one participant. It should not be named or interpreted as a subject-level combination or a group result.

Choose the verified BOLD file as the four-dimensional input. Do not select the JSON sidecar, a mean functional image, or a three-dimensional example volume. Once the path appears, compare its participant, task, and acquisition entities with the run named in the analysis notes.

## 3. Enter and cross-check time-series values

Set the TR to 1.7 seconds and the number of volumes to 260. Together those values imply a 442-second time series. That duration gives us a useful boundary check for every event onset loaded later. If a timing row falls beyond the run, stop and repair the timing inputs before fitting the model.

Set deleted volumes to zero for this course example because the supplied run and timing files are being modeled as staged. For another dataset, non-steady-state handling must come from the acquisition and preprocessing record rather than imitation of this value.

## 4. Choose a new output identity

Set the output path to `/home/jovyan/Voxelwise-Walkthroughs/outputs/sub-10015_sharedreward_mb3me1_L1_video`. FEAT will append `.feat`. The name captures participant, task, acquisition, level, and this recorded run while remaining independent of the source data directory.

Before leaving the tab, read the input path, TR, volume count, and output path aloud. Confirm that the output does not already exist. Save the design as a checkpoint. The Data tab is complete only when those values agree with the image header and the planned unit of analysis.
