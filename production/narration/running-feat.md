# Running FEAT — narration

## 1. Complete the preflight check

Before selecting Go, confirm the input run, 1.7-second TR, 260 volumes, preprocessing settings, registration targets, two EV timing files, and five contrasts. Set the output to the new path `/home/jovyan/Voxelwise-Walkthroughs/outputs/sub-10015_sharedreward_mb3me1_L1`. FEAT will append `.feat`.

Save the configuration as an `.fsf` file. That file is the reproducible analysis recipe and should be kept with the output. Verify that no output directory with the same name already exists. Reusing an old path can mix states or prompt an overwrite decision that is difficult to reconstruct later.

## 2. Launch once and monitor evidence

Select Go once. A FEAT run can be quiet while motion correction, registration, model fitting, or report generation is active. Silence is not evidence of failure, and opening a second run creates competing outputs and confusing logs.

Locate the new `.feat` directory and open the progress report. The report log identifies the current stage and records commands. In the terminal, a process check or the timestamps of files in the directory can provide additional evidence that work is continuing.

If FEAT stops, find the first explicit error. Common causes include a missing input, malformed timing row, invalid contrast configuration, or output-name conflict. Repair one identified cause, save a revised design, and run to a new output rather than changing several settings at once.

## 3. Define completion carefully

FEAT is computationally complete when the report and expected output structure are present and no terminal error remains. Scientific completion requires more: motion, preprocessing, registration, the design, and statistical outputs must still be reviewed.

Show `design.fsf`, the logs, the `stats` directory, the `reg` directory, and `report.html` appearing as the run progresses. Do not jump straight to colored clusters.

End by recording the exact saved design and output paths. The next walkthrough will use the completed `.feat` directory as an auditable analysis record rather than treating it as a single result image.
