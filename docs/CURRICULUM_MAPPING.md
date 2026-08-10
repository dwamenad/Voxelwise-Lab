# Source curriculum mapping

The complete public `tubric/2026s-fmri-class` repository was inspected before implementation: all Markdown labs, four notebooks, utility files, shell code, image assets, README, and license.

## Repository summary

- `Lab-0_Neurodesk.md`: Play/EDU/local setup, persistent storage, base versus application terminals, DataLad, and FreeSurfer-license preparation.
- `Lab-0_Glossary.md`: Linux, BIDS, DataLad, FSL, file formats, voxels, 3D/4D data, coordinates, atlases, and intensity concepts.
- `Lab-0_GeneralTroubleshootingGuide.md`: environment/path triage and contextual Linux, DataLad, FEAT, FSLEyes, and fMRIPrep fixes.
- `Lab-1_FSLeyes.md`: downloading example data, symlinks, anatomy, functional time series, histograms, atlases, and visual inspection.
- `Lab-2_Preprocessing.md` and supplement: raw-data QA, motion correction, brain extraction, smoothing, filtering, registration, fMRIPrep, and reports.
- `Lab-3_FSL_Level1.md`, supplement, and `Lab-X_Contrast.md`: timing files, FEAT inputs, EVs, contrasts, thresholding, outputs, confounds, and visualization.
- `Lab-4_FSL_Level2_Level3.md`: within-subject fixed effects, group mixed effects, FLAME, and higher-level output.
- `Lab-5_PPI_ICA.md`: atlas seeds, native-space transforms, seed extraction, PPI EVs/contrasts, and ICA.
- Notebooks: reproducible dataset download/visualization, fMRIPrep-to-FEAT, scripted higher-level FEAT, and a multi-echo fMRIPrep/tedana demonstration.
- Images: real Neurodesk, FSLEyes, BET, FEAT, registration, design, and report screenshots suitable for attributed instructional use.

## Application mapping

| FSL Academy course | Primary source | Lesson treatment |
| --- | --- | --- |
| FSL & Neuroimaging Foundations | Labs 0 and 1 | Fully populated concepts, commands, Neurodesk tasks, output checks, and QC |
| fMRI Preprocessing with FSL | Lab 2 + fMRIPrep supplement | Polished module and lesson outline |
| First-Level fMRI Analysis in FEAT | Lab 3 + supplement + contrast lab | Fully populated 20-module course |
| Higher-Level fMRI Analysis | Lab 4 + higher-level notebook | Polished Level 2/3 outline |
| ROI Analysis with FSL | Labs 1 and 5 | Mask, space, extraction, and circularity outline |
| PPI and ICA | Lab 5 | Seed, interaction, FEAT, and component outline |

The notebooks are treated as advanced reproducible resources, not copied into beginner lesson prose. Technically important commands and real screenshots are retained in context. Troubleshooting material is centralized and also inserted into the lesson moments where a student is likely to encounter the issue.

