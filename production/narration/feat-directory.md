# Understanding the .feat directory — narration

## 1. Start at the top level

A `.feat` directory is a structured record of one first-level analysis. Begin in `/home/jovyan/Voxelwise-Walkthroughs/outputs/sub-10015_sharedreward_mb3me1_L1.feat` and list its top-level contents. The directory holds configuration, processed data, registration evidence, statistical estimates, logs, and linked HTML reports. Not every NIfTI file is a final result.

Open `design.fsf` to see the saved FEAT settings. `design.mat` contains the numerical design matrix, `design.con` contains contrast weights, and `design.png` provides a visual model summary. These files let a reviewer connect the analysis plan to the model that actually ran.

## 2. Follow the processing record

Identify the processed four-dimensional data and the mean functional image. Then locate motion estimates and diagnostic plots produced during Pre-stats. These files document operations and help evaluate data quality; their presence does not by itself mean the data passed QC.

Open the `reg` directory. It contains transformation matrices, registered images, and boundary-check images for functional-to-structural and structural-to-standard alignment. Registration will receive its own walkthrough because transforms must be inspected anatomically.

## 3. Separate estimates from inference

Open `stats`. Parameter estimates, or PEs, correspond to modeled columns. Copes are contrast estimates, varcopes describe their uncertainty, and t-statistic and z-statistic images standardize evidence. Thresholded cluster products and renderings appear elsewhere in the report structure. The filename tells you the computation, not the scientific meaning; use the contrast table to map `cope1` or `zstat3` back to a named hypothesis.

## 4. Use the report as an index

Open `report.html`. Its navigation links connect Pre-stats, Registration, Stats, and Post-stats sections. The report is an efficient entry point, but it does not replace the underlying design files or images.

End by grouping the directory into five questions: what was configured, how was the run prepared, how was it aligned, what did the model estimate, and what evidence supports the reported results? This structure turns the `.feat` folder from a collection of files into an auditable analysis record.
