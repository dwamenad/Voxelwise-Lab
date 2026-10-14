# October concept release review

Reviewed against primary references on 2026-10-13 before publishing the ten new Daniel masters.

- Motion summaries distinguish MCFLIRT relative RMS displacement from Power FD; universal censoring thresholds were removed. [FSL motion outliers](https://fsl.fmrib.ox.ac.uk/fsl/docs/registration/motion_outliers.html)
- Filtering uses the experimental design and signal-retention checks. Registration guidance allows partial-FOV exceptions and separate distortion correction. Brain extraction preserves the original input for reruns. [FEAT user guide](https://fsl.fmrib.ox.ac.uk/fsl/docs/task_fmri/feat/user_guide.html), [FEAT practical](https://fsl.fmrib.ox.ac.uk/fslcourse/graduate/lectures/practicals/feat1/index.html)
- Population inference accounts for between-participant variation; FLAME is an option rather than a universal requirement. [FEAT user guide](https://fsl.fmrib.ox.ac.uk/fsl/docs/task_fmri/feat/user_guide.html)
- ROI independence requires more than orthogonal contrast vectors. [Kriegeskorte et al., 2009](https://pmc.ncbi.nlm.nih.gov/articles/PMC2841687/)
- PPI describes context-dependent coupling, with either sign, rather than proof of causal communication. [FSL PPI guidance](https://fsl.fmrib.ox.ac.uk/fsl/docs/task_fmri/ppi.html)
- Spatial ICA independence does not require disjoint maps; component interpretation requires review of maps, time courses, and spectra. [FSL MELODIC](https://fsl.fmrib.ox.ac.uk/fsl/docs/resting_state/melodic.html)

This records the automated editorial/source check. It does not replace an independent scientific reviewer or approval of the separate live FEAT walkthroughs.
