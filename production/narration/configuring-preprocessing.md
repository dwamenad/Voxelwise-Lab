# Configuring preprocessing options — narration

## 1. Begin with provenance

The Pre-stats tab must describe the actual state of the input. Our ds005085 BOLD image is the raw course input for a Full analysis, so this design includes the validated preprocessing sequence. If the input had already been preprocessed by another pipeline, copying these settings could repeat motion correction, smoothing, filtering, or registration and would change the data again.

Before configuring FEAT, open representative volumes or use the available inspection tools to look for missing coverage, orientation problems, spikes, and severe motion. Preprocessing settings cannot turn an unusable acquisition into a reliable result.

## 2. Configure the course sequence

Set motion correction to MCFLIRT. Motion correction estimates rigid-body alignment across volumes; it does not remove every motion-related artifact or prove that motion is acceptable. The later report must still be inspected.

Enable BET brain extraction for the functional input. Then set spatial smoothing to a five-millimeter full width at half maximum kernel. Smoothing changes spatial specificity and signal-to-noise characteristics, so the value is recorded as part of the analysis design rather than treated as cosmetic.

Set slice-timing correction to Regular down, matching the source lab instructions for this example. This choice is acquisition-dependent. Do not carry it to an unrelated run without checking how its slices were acquired and what prior processing has already occurred.

Leave intensity normalization off. Keep temporal high-pass filtering on with the course screenshot's 60-second cutoff, and keep low-pass filtering off. High-pass filtering removes slow drift, but it also changes the modeled time series; the EVs will be filtered consistently in the Stats tab.

## 3. Check for duplicate work

Pause on each control and ask two questions: does the course protocol require it, and has it already been performed on this input? For this raw example the answers support MCFLIRT, functional BET, five-millimeter smoothing, regular-down slice timing, and 60-second high-pass filtering. For a preprocessed image the safe configuration could be very different.

Save the design again. The evidence for this tab is a visible match between the course protocol, the known input provenance, and the final FEAT controls. Completion of FEAT later will not retroactively validate an incorrect preprocessing decision.
