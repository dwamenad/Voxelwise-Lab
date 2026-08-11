# Opening FEAT — narration

## 1. Enter the approved environment

In this walkthrough, we will open FEAT inside Neurodesk and build a map of its interface before changing any analysis settings. FEAT is both a model-configuration interface and a pipeline runner. The choices made here determine the data, preprocessing, registration, statistical model, and reporting steps that FSL will execute.

Begin on the Neurodesktop workspace. Open the Applications menu, choose Neurodesk, then Functional Imaging, FSL, and the approved FSL version. This versioned launcher prepares the environment so the FSL commands and graphical tools are available in the terminal it opens. That is more reproducible than assuming that a terminal outside this environment is using the intended FSL installation.

## 2. Launch FEAT

At the prompt, enter `Feat`, with a capital F, followed by an ampersand. The capitalised command starts the FEAT graphical interface; the lower-case `feat` command expects a saved design file. The ampersand returns control of the terminal while the interface remains open. If the window takes a moment to appear, wait. Starting another copy simply because the launch is quiet can leave several indistinguishable FEAT windows open.

FEAT may remember settings from an earlier session, so treat every value as something to verify. A familiar-looking interface is not evidence that the current design is safe.

## 3. Choose the analysis scope

At the top of FEAT, select First-level analysis. First level means one run from one participant. It is not a within-subject combination across runs, and it is not a group analysis. Keeping that unit explicit prevents participant-specific results from being described as population conclusions.

Next, select Full analysis for this orientation. Full analysis exposes the steps used to prepare and model a run. This is a scope choice, not a universal recommendation. If the input has already been preprocessed, the workflow must be adjusted so that motion correction, smoothing, filtering, or registration are not repeated unintentionally.

## 4. Read the tabs before editing

The Data tab establishes the identity of the model. It contains the four-dimensional functional input, repetition time, number of volumes, and output directory. These values connect image sampling to experimental timing. Later, we will verify them against the image header and BIDS metadata before entering them.

The Pre-stats tab controls preprocessing operations such as motion correction, brain extraction, spatial smoothing, and temporal filtering. These are scientific decisions. Applying a step twice is not neutral, and leaving a required step off is not repaired by a plausible activation map.

The Registration tab controls mappings between functional, anatomical, and standard spaces. A completed transform only shows that an optimisation finished. Registration quality must still be checked visually across the brain, including cortical boundaries, ventricles, cerebellum, and areas of incomplete functional coverage.

The Stats tab defines the general linear model. Here, explanatory variables represent task conditions or nuisance structure. Task timing can be convolved with a haemodynamic response, contrasts encode planned hypotheses, and the design preview exposes the actual matrix FEAT will fit. Before running anything, the columns, timing, correlations, and contrast weights must tell the same experimental story as the protocol.

The Post-stats tab controls thresholding and result reporting. It is tempting to start with bright clusters, but inference is only interpretable after the input, preprocessing, registration, and design have passed their own quality-control checks.

The Misc tab contains auxiliary settings and output options. Most projects use only a subset of them, but they remain part of the saved design and should be reviewed when reproducing or auditing an analysis.

## 5. Close with the workflow map

The practical order is Data, Pre-stats, Registration, Stats, Post-stats, and then Misc. That order moves from the measured time series, through preparation and spatial alignment, into the model and finally the report.

For now, leave the values unchanged. You have opened the intended FSL environment, launched FEAT, selected a first-level scope, and identified what each tab controls. In the next walkthrough, we will configure the Data tab using a real BOLD run and verify every value against the source files.
