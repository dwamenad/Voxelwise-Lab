import { learningLesson } from "@/lib/content/helpers";
import type { Course } from "@/lib/types";

export const preprocessingCourse: Course = {
  id: "course-preprocessing",
  slug: "fmri-preprocessing-fsl",
  catalogNumber: "FSL 201",
  title: "fMRI Preprocessing with FSL",
  shortTitle: "fMRI Preprocessing",
  description:
    "Understand what each preprocessing step changes, configure FEAT deliberately, and make quality control an integral part of your neuroimaging workflow.",
  difficulty: "Intermediate",
  status: "available",
  duration: "6 weeks · 8 hours",
  prerequisites: ["FSL & Neuroimaging Foundations", "Access to a BOLD and T1-weighted image"],
  objectives: [
    "Explain why preprocessing is essential for statistical validity",
    "Configure FEAT preprocessing parameters deliberately",
    "Inspect motion, brain extraction, smoothing, filtering, and registration",
    "Diagnose subtle artifacts using quantitative QC metrics and visual overlays",
    "Compare the roles and outputs of FEAT preprocessing and fMRIPrep",
  ],
  requirements: ["Neurodesk with FSL", "Example dataset from the TUBRIC lab"],
  neurodeskRequired: true,
  accent: "blue",
  sourceLabs: ["Lab-2_Preprocessing.md", "Lab-2_Supplement_fMRIPrep.md"],
  resources: [
    {
      id: "preprocessing-source",
      title: "Original preprocessing lab",
      description: "TUBRIC Lab 2 source material covering motion correction, BET, filtering, and registration.",
      format: "Markdown",
      href: "https://github.com/tubric/2026s-fmri-class/blob/main/Lab-2_Preprocessing.md",
      available: true,
    },
  ],
  modules: [
    {
      id: "preproc-module-1",
      number: 1,
      title: "Before Preprocessing",
      description: "Screen raw BOLD and structural acquisitions before running automated pipelines.",
      lessons: [
        learningLesson({
          id: "preproc-why-preprocessing-exists",
          slug: "why-preprocessing-exists",
          number: "1.1",
          title: "Why Preprocessing Exists",
          description: "Separate acquisition artifacts, physiological nuisance, and anatomical alignment from statistical modeling.",
          duration: 18,
          objectives: [
            "Distinguish scanner-level artifacts from neural signals",
            "Identify the sequence of transformations applied to 4D fMRI data",
          ],
          conceptTitle: "The Goals of Preprocessing",
          concept:
            "Raw fMRI data contains cardiac/respiratory pulsatility, bulk head motion, spatial distortion from magnetic susceptibility, and inter-subject anatomical variability. Preprocessing conditions the raw time series so that voxel-wise GLM assumptions remain valid.",
          explanation:
            "A standard fMRI pipeline transforms raw 4D data through motion correction, brain extraction, slice timing correction (optional), high-pass temporal filtering, spatial smoothing, and cross-modal registration. Each step makes irreversible alterations to the underlying signal; knowing what each step changes prevents over-filtering or introducing spurious correlations.",
          task: [
            "Open your Neurodesk desktop terminal.",
            "Navigate to your tutorial data directory containing raw BOLD runs.",
            "Use fslinfo to review the dimensions (dim1..dim4) and voxel sizes (pixdim1..pixdim4) of the uncorrected BOLD run.",
          ],
          command: "fslinfo raw_bold.nii.gz",
          expected: {
            output: "dim1           64\ndim2           64\ndim3           36\ndim4           180\npixdim4        2.000000",
            explanation: "Review TR (pixdim4 = 2.0s) and number of acquired volumes (dim4 = 180).",
          },
          quiz: {
            id: "preproc-q1",
            question: "Why should spatial smoothing be performed AFTER motion correction rather than before?",
            options: [
              {
                id: "opt-1",
                text: "Smoothing blurs anatomical edges that MCFLIRT needs to estimate rigid-body realignment parameters.",
                isCorrect: true,
                explanation: "Correct! MCFLIRT uses high-frequency edge information to compute rotation and translation matrices.",
              },
              {
                id: "opt-2",
                text: "Smoothing increases the dimensionality of the 4D matrix.",
                isCorrect: false,
                explanation: "Smoothing preserves spatial dimensions while blurring neighboring voxels.",
              },
              {
                id: "opt-3",
                text: "Smoothing removes the temporal dimension of the data.",
                isCorrect: false,
                explanation: "Spatial smoothing operates exclusively within spatial slices/volumes, not across time.",
              },
            ],
            hint: "Think about what visual features an algorithm uses to align two images.",
            explanation: "Pre-smoothing degrades intensity contrast across tissue boundaries, making motion estimation less precise.",
          },
          summary: [
            "Raw BOLD signals reflect both neural hemodynamics and severe non-neural confounds.",
            "Every preprocessing stage alters variance; each must be inspected for quality.",
          ],
          sourceLab: "Lab-2_Preprocessing.md",
          sourceSection: "1. Introduction to Preprocessing",
        }),
        learningLesson({
          id: "preproc-inspecting-raw-bold",
          slug: "inspecting-raw-bold-data",
          number: "1.2",
          title: "Inspecting Raw BOLD Data",
          description: "Detect signal dropout, spikes, ghosting, and orientation mismatches in FSLEyes.",
          duration: 22,
          objectives: [
            "Identify Nyquist N/2 ghosting and susceptibility dropout in EPI scans",
            "Screen for volume-to-volume intensity spikes and severe head motion",
          ],
          conceptTitle: "Raw Data Screening",
          concept:
            "Before launching any automated preprocessing pipeline, visually play through the raw functional run as a movie in FSLEyes. Catching scanner RF coil failures or participant movement early saves hours of wasted computation.",
          explanation:
            "In EPI sequences, susceptibility differences near air-tissue interfaces (orbitofrontal cortex and inferior temporal lobes) cause geometric distortion and signal loss. Nyquist ghosting appears as faint duplicate brain edges shifted by half the field of view.",
          task: [
            "Launch FSLEyes in Neurodesk.",
            "Load raw_bold.nii.gz and open the Time Series view (View -> Views -> Time series).",
            "Enable the Movie playback control to sweep through volumes 0 to 180.",
          ],
          command: "fsleyes raw_bold.nii.gz &",
          errorSpotting: {
            id: "raw-bold-errors",
            title: "Diagnosing Raw BOLD Artifacts",
            scenario: "A researcher inspects an fMRI run where the participant sneezed midway through the scan.",
            codeOrReport: "Mean framewise displacement (FD): 3.8 mm\nMax absolute displacement: 7.2 mm\nSlices 18-22 in volume 84 show horizontal black banding.",
            options: [
              {
                id: "err-1",
                description: "Severe motion spike exceeding voxel dimension (FD > 3mm).",
                isFlaw: true,
                explanation: "Head displacement greater than voxel size invalidates rigid-body assumptions and causes spin-history artifacts.",
              },
              {
                id: "err-2",
                description: "The scan TR is set to 2.0 seconds.",
                isFlaw: false,
                explanation: "A 2.0s TR is standard for multi-slice whole-brain 2D EPI.",
              },
              {
                id: "err-3",
                description: "Corrupted slice banding during volume 84 requiring volume censoring/scrubbing.",
                isFlaw: true,
                explanation: "Inter-slice banding from abrupt motion ruins slice excitation; volume 84 must be censored or modeled as a dummy spike regressor.",
              },
            ],
            summary: "Never run automated preprocessing blindly on runs with uninspected head spikes.",
          },
          summary: [
            "Always inspect raw BOLD movies before configuring FEAT.",
            "Identify whether motion is gradual drift or sudden sharp rotational jerks.",
          ],
          sourceLab: "Lab-2_Preprocessing.md",
          sourceSection: "2. Raw Data QA",
        }),
      ],
    },
    {
      id: "preproc-module-2",
      number: 2,
      title: "Within-Run Corrections",
      description: "Motion correction, brain extraction, spatial smoothing, and temporal filtering.",
      lessons: [
        learningLesson({
          id: "preproc-motion-correction-mcflirt",
          slug: "motion-correction-with-mcflirt",
          number: "2.1",
          title: "Motion Correction with MCFLIRT",
          description: "Estimate and correct 6-parameter rigid body motion across volumes.",
          duration: 25,
          objectives: [
            "Explain the 6 degrees of freedom in rigid-body realignment (3 rotations, 3 translations)",
            "Interpret MCFLIRT rotational (radians) and translational (mm) motion plots",
          ],
          conceptTitle: "Rigid-Body Realignment",
          concept:
            "MCFLIRT aligns each volume in a 4D timeseries to a reference volume (typically the middle volume) using a rigid-body transformation (3 translations x, y, z and 3 rotations pitch, roll, yaw).",
          explanation:
            "Even sub-millimeter head motion creates artifactual variance that correlates with task timing. MCFLIRT generates transformation matrices and summary plots (.par files). Inspect both absolute displacement (relative to reference volume) and relative displacement (volume-to-volume).",
          task: [
            "Run MCFLIRT from the terminal with reporting and plot generation flags enabled.",
            "Plot the generated motion parameters using fsl_tsplot.",
          ],
          command: "mcflirt -in raw_bold.nii.gz -out bold_mcf -plots -report",
          expected: {
            output: "Writing output volume... bold_mcf\nWriting plots... bold_mcf.par",
            explanation: "MCFLIRT outputs the realigned 4D image and the 6-column parameter file.",
          },
          commandBuilder: {
            id: "mcflirt-builder",
            title: "Build the MCFLIRT Command",
            prompt: "Assemble the command to realign raw_bold.nii.gz to its middle volume, saving plots to bold_mcf.par.",
            targetTokens: ["mcflirt", "-in", "raw_bold.nii.gz", "-out", "bold_mcf", "-plots"],
            scrambledTokens: ["-plots", "raw_bold.nii.gz", "mcflirt", "-out", "-in", "bold_mcf", "-s", "-Tmean"],
            hint: "Starts with the executable mcflirt followed by -in and -out.",
            explanation: "mcflirt -in <input> -out <output> -plots produces the aligned 4D volume and 6 rigid-body motion parameters.",
          },
          summary: [
            "MCFLIRT corrects 6 degrees of freedom within a single run.",
            "Always inspect both absolute and relative motion plots in the FEAT report.",
          ],
          sourceLab: "Lab-2_Preprocessing.md",
          sourceSection: "3. MCFLIRT",
        }),
        learningLesson({
          id: "preproc-brain-extraction-bet",
          slug: "brain-extraction",
          number: "2.2",
          title: "Brain Extraction with BET",
          description: "Remove skull and non-brain tissue while preserving cortex and cerebellum.",
          duration: 20,
          objectives: [
            "Tune fractional intensity threshold (-f) to balance under- and over-stripping",
            "Verify brain extraction boundaries in FSLEyes before registration",
          ],
          conceptTitle: "Brain Extraction Tool (BET)",
          concept:
            "Skull, eyes, neck fat, and dura possess high MRI signal intensities that disrupt registration cost functions. BET estimates the brain surface using a tessellated deformable sphere.",
          explanation:
            "A fractional intensity threshold (-f) that is too high (e.g. 0.7) will clip cortex and cerebellum. An -f that is too low (e.g. 0.2) will leave skull fragments that bias registration to standard MNI space.",
          task: [
            "Run BET on the structural T1 image with default -f 0.5.",
            "Overlay the resulting mask on the original T1 in FSLEyes to check brain boundaries.",
          ],
          command: "bet highres.nii.gz highres_brain.nii.gz -f 0.4 -m",
          expected: {
            output: "Output files: highres_brain.nii.gz, highres_brain_mask.nii.gz",
            explanation: "BET generates the skull-stripped brain volume and a binary mask.",
          },
          quiz: {
            id: "bet-quiz",
            question: "What happens if BET clips parts of the frontal pole or occipital cortex on the highres T1?",
            options: [
              {
                id: "opt-1",
                text: "Subsequent non-linear registration (FNIRT) will warp and distort those regions into the MNI template incorrectly.",
                isCorrect: true,
                explanation: "Accurate! If anatomical cortex is missing, registration algorithms will stretch or distort remaining tissue to fill the template space.",
              },
              {
                id: "opt-2",
                text: "FSL automatically recovers clipped cortex during temporal filtering.",
                isCorrect: false,
                explanation: "Temporal filtering operates on BOLD timeseries and cannot restore clipped anatomical voxels.",
              },
            ],
            explanation: "Always review structural BET boundaries carefully before running FEAT.",
          },
          summary: [
            "Fractional intensity -f is the primary tuning parameter for BET.",
            "Check that the sagittal slices include the full cerebellum and superior sagittal sinus.",
          ],
          sourceLab: "Lab-2_Preprocessing.md",
          sourceSection: "4. Brain Extraction",
        }),
        learningLesson({
          id: "preproc-spatial-smoothing",
          slug: "spatial-smoothing",
          number: "2.3",
          title: "Spatial Smoothing with SUSAN",
          description: "Improve signal-to-noise ratio and satisfy Gaussian Random Field theory assumptions.",
          duration: 20,
          objectives: [
            "Convert Full Width at Half Maximum (FWHM) to Gaussian sigma",
            "Explain how smoothing impacts spatial localization vs. statistical power",
          ],
          conceptTitle: "Spatial Smoothing (FWHM)",
          concept:
            "Smoothing convolves 3D volumes with a 3D Gaussian kernel. It averages local noise, accounts for residual anatomical differences between subjects, and ensures data meets Gaussian Random Field smoothness assumptions for cluster correction.",
          explanation:
            "FSL uses SUSAN (Smallest Univalue Segment Assimilating Nucleus) to smooth within similar tissue intensities rather than blurring across sharp boundaries. Remember that in FSL commands, smoothing parameters often require Gaussian sigma rather than FWHM: FWHM = sigma * 2.355.",
          task: [
            "Calculate Gaussian sigma for a 5mm FWHM kernel: 5 / 2.355 = 2.12 mm.",
            "Apply spatial smoothing to your functional mean image using fslmaths.",
          ],
          command: "fslmaths example_func.nii.gz -s 2.12 example_func_smooth.nii.gz",
          summary: [
            "FWHM = sigma * 2.35482.",
            "Smoothing increases SNR for larger activations but reduces precision for small subcortical nuclei.",
          ],
          sourceLab: "Lab-2_Preprocessing.md",
          sourceSection: "5. Spatial Smoothing",
        }),
        learningLesson({
          id: "preproc-temporal-filtering",
          slug: "temporal-filtering",
          number: "2.4",
          title: "Temporal Filtering",
          description: "Remove low-frequency scanner drift without attenuating task frequencies.",
          duration: 20,
          objectives: [
            "Calculate the high-pass filter cutoff using the maximum task cycle duration",
            "Explain why low-pass filtering is generally avoided in event-related fMRI",
          ],
          conceptTitle: "High-Pass Filtering",
          concept:
            "MRI scanners exhibit slow thermal and physical drifts that manifest as massive low-frequency power in the power spectrum. High-pass temporal filtering removes these trends.",
          explanation:
            "Rule of thumb for high-pass cutoff: Cutoff >= 2 * (duration of longest condition block + rest period). If your task cycle is 50 seconds, set highpass cutoff to at least 100 seconds. Setting the cutoff too aggressively will erase your experimental BOLD signal.",
          task: [
            "Inspect the task timing design in seconds.",
            "Verify the Highpass Filter Cutoff parameter in the FEAT Pre-stats GUI tab.",
          ],
          commandBuilder: {
            id: "bptf-builder",
            title: "Build the High-Pass Filter Command",
            prompt: "Apply a high-pass filter with cutoff of 50 TRs (sigma = 25 TRs) with no low-pass filtering (-1) using fslmaths.",
            targetTokens: ["fslmaths", "bold_mcf", "-bptf", "25", "-1", "bold_filtered"],
            scrambledTokens: ["-bptf", "bold_mcf", "25", "-1", "fslmaths", "bold_filtered", "-Tmean", "50"],
            hint: "-bptf takes <highpass_sigma> <lowpass_sigma> where -1 disables filtering.",
            explanation: "fslmaths in -bptf hp_sigma -1 out applies a temporal high-pass Butterworth/Gaussian filter.",
          },
          summary: [
            "Set highpass cutoff to at least twice the longest cycle length of your experimental conditions.",
            "Never filter out task-relevant frequencies.",
          ],
          sourceLab: "Lab-2_Preprocessing.md",
          sourceSection: "6. Temporal Filtering",
        }),
      ],
    },
    {
      id: "preproc-module-3",
      number: 3,
      title: "Registration and Quality Control",
      description: "Multi-stage alignment from native BOLD to high-resolution structural and standard MNI152 template.",
      lessons: [
        learningLesson({
          id: "preproc-func-to-anat-reg",
          slug: "functional-to-anatomical-registration",
          number: "3.1",
          title: "Functional to Anatomical Registration",
          description: "Align EPI BOLD data to high-resolution T1 structural using FLIRT and BBR.",
          duration: 25,
          objectives: [
            "Explain Boundary-Based Registration (BBR) using the white matter cortical boundary",
            "Evaluate registration alignment quality in FSLEyes and FEAT reports",
          ],
          conceptTitle: "Boundary-Based Registration (BBR)",
          concept:
            "EPI functional images have low spatial resolution (2-3mm) and distorted contrast. Aligning functional directly to an MNI template fails. Instead, FSL uses a two-step registration: Functional -> Participant T1 (6 DOF rigid-body BBR), then Participant T1 -> MNI152 (12 DOF affine + non-linear FNIRT).",
          explanation:
            "BBR projects the white matter boundary segmented from the T1 image onto the functional image and evaluates the intensity gradient across the boundary. It is significantly more robust to geometric distortions than traditional correlation ratio metrics.",
          task: [
            "Open the FEAT report registration page (report_reg.html).",
            "Inspect the red boundary lines overlaid on the functional image.",
            "Check that ventricles, corpus callosum, and insular boundaries match precisely.",
          ],
          command: "epi_reg --epi=example_func.nii.gz --t1=highres.nii.gz --t1brain=highres_brain.nii.gz --out=example_func2highres",
          quiz: {
            id: "bbr-quiz",
            question: "Why does functional-to-anatomical registration use 6 degrees of freedom (DOF) instead of 12 DOF?",
            options: [
              {
                id: "opt-1",
                text: "The brain belongs to the same individual; head shape and brain size do not change between scans, so only rigid rotation and translation are valid.",
                isCorrect: true,
                explanation: "Spot on! 6 DOF represents rigid-body transformations. Scaling or shearing the brain within the same scanning session is non-physical.",
              },
              {
                id: "opt-2",
                text: "6 DOF runs faster than 12 DOF.",
                isCorrect: false,
                explanation: "While faster, the scientific constraint is that brain anatomy does not morph within the same subject.",
              },
            ],
            explanation: "Within-subject registration must always use 6 DOF rigid-body transformations.",
          },
          summary: [
            "Two-step registration: functional -> anatomical (6 DOF BBR) -> MNI standard (12 DOF + FNIRT).",
            "Check red outline alignment along the ventricles and Sylvian fissure.",
          ],
          sourceLab: "Lab-2_Preprocessing.md",
          sourceSection: "7. Registration",
        }),
        learningLesson({
          id: "preproc-anat-to-standard-reg",
          slug: "anatomical-to-standard-registration",
          number: "3.2",
          title: "Anatomical to Standard Registration",
          description: "Map participant anatomy to standard MNI152 space with linear FLIRT and non-linear FNIRT.",
          duration: 25,
          objectives: [
            "Distinguish linear affine (12 DOF) from non-linear warp field transformations",
            "Recognize common registration failures caused by poor initial brain extraction",
          ],
          conceptTitle: "Non-Linear Registration with FNIRT",
          concept:
            "Human brains differ substantially in gyral folding patterns. Linear affine registration (12 DOF) only aligns global orientation, position, and overall size. FNIRT estimates a dense non-linear displacement field to match local sulcal anatomy to the MNI152 template.",
          explanation:
            "FNIRT writes a warp coefficient file (highres2standard_warp.nii.gz). In group analyses, individual functional statistics (copes and varcopes) are transformed to standard space using this warp field.",
          task: [
            "Review the FNIRT warp field in FSLEyes or check the registration summary in FEAT report.",
            "Verify that deep gray matter structures (caudate, putamen, thalamus) align with MNI152.",
          ],
          command: "fnirt --in=highres.nii.gz --aff=highres2standard.mat --cout=highres2standard_warp --config=T1_2_MNI152_2mm",
          summary: [
            "FLIRT computes the initial 12-parameter affine transformation.",
            "FNIRT refines alignment with non-linear warping for accurate group-level standardization.",
          ],
          sourceLab: "Lab-2_Preprocessing.md",
          sourceSection: "8. FNIRT Standard Registration",
        }),
        learningLesson({
          id: "preproc-qc-checklist",
          slug: "preprocessing-quality-control",
          number: "3.3",
          title: "Preprocessing Quality Control Checklist",
          description: "Synthesize motion metrics, registration overlays, and carpet plots into a rigorous QC decision.",
          duration: 25,
          objectives: [
            "Construct a reproducible quality control log for neuroimaging studies",
            "Establish principled inclusion/exclusion thresholds for head motion and registration errors",
          ],
          conceptTitle: "Systematic QC Protocol",
          concept:
            "Quality control is not an afterthought; it is a critical scientific decision. Every subject must be evaluated on motion thresholds (mean FD, max displacement), registration overlap, and signal temporal SNR.",
          explanation:
            "Always inspect: 1. MCFLIRT displacement plots (< 2mm max or 0.5mm mean FD); 2. BET brain mask boundaries; 3. BBR functional-to-structural alignment; 4. FNIRT standard space normalization; 5. Unsmoothed residual variance.",
          task: [
            "Open your subject's .feat/report.html in a browser.",
            "Review Pre-stats and Registration tabs.",
            "Fill in a standardized QC verification sheet before proceeding to first-level GLM.",
          ],
          errorSpotting: {
            id: "qc-pipeline-errors",
            title: "Evaluating a Preprocessing Report",
            scenario: "You review the FEAT output directory for Subject 014. Look for reasons to reject or rerun the analysis.",
            codeOrReport: "MCFLIRT: Mean FD = 0.18 mm, Max = 0.8 mm\nBET highres: Eyes and orbital tissue included in brain mask\nRegistration: Functional to highres BBR cost = 0.85 (red line shifted 8mm out of cortex)\nTemporal Filter: Highpass cutoff = 100s for a 40s task cycle",
            options: [
              {
                id: "q-1",
                description: "BET failure: orbital fat in highres mask caused BBR registration to fail.",
                isFlaw: true,
                explanation: "Unstripped eye/fat tissue misleads the registration cost function, pulling the functional alignment off cortex.",
              },
              {
                id: "q-2",
                description: "Motion parameters exceed acceptable scientific thresholds.",
                isFlaw: false,
                explanation: "Mean FD of 0.18mm is very clean head stability, well within normal thresholds.",
              },
              {
                id: "q-3",
                description: "Functional-to-highres alignment shifted by 8mm requires BET retuning and registration re-run.",
                isFlaw: true,
                explanation: "An 8mm registration error means functional activation will be localized to the wrong brain regions.",
              },
            ],
            summary: "Never run group-level models when native-to-structural registration has failed.",
          },
          summary: [
            "Always verify motion and registration before proceeding to statistical analysis.",
            "A failed registration invalidates all downstream first-level and group-level results.",
          ],
          sourceLab: "Lab-2_Preprocessing.md",
          sourceSection: "9. QC Decisions",
        }),
      ],
    },
    {
      id: "preproc-module-4",
      number: 4,
      title: "fMRIPrep Supplement",
      description: "Compare FEAT preprocessing with modern BIDS-compliant fMRIPrep pipelines.",
      lessons: [
        learningLesson({
          id: "preproc-when-to-use-fmriprep",
          slug: "when-to-use-fmriprep",
          number: "4.1",
          title: "When to Use fMRIPrep",
          description: "Compare workflow scope, provenance tracking, containerization, and FEAT integration.",
          duration: 20,
          objectives: [
            "Identify the architectural differences between FEAT preprocessing and fMRIPrep",
            "Determine when to preprocess inside FEAT versus feeding fMRIPrep outputs into FEAT",
          ],
          conceptTitle: "fMRIPrep in the Neuroimaging Ecosystem",
          concept:
            "fMRIPrep is a robust, containerized pipeline developed by the NiPreps community that combines FSL, ANTs, FreeSurfer, and AFNI into an automated BIDS-compatible workflow with comprehensive visual HTML reports.",
          explanation:
            "While FEAT provides a convenient all-in-one GUI for preprocessing and modeling, fMRIPrep standardizes preprocessing across diverse scanner protocols and outputs pre-calculated confounds (FD, DVARS, aCompCor). You can use fMRIPrep for preprocessing and then run FEAT Level 1 modeling on the resulting preprocessed volumes.",
          task: [
            "Check if your dataset complies with the Brain Imaging Data Structure (BIDS) standard.",
            "Review the generated derivatives/fmriprep folder structure.",
          ],
          summary: [
            "fMRIPrep requires BIDS-formatted datasets.",
            "FEAT can take preprocessed NIfTI files from fMRIPrep directly into first-level modeling.",
          ],
          sourceLab: "Lab-2_Supplement_fMRIPrep.md",
          sourceSection: "1. fMRIPrep Overview",
        }),
        learningLesson({
          id: "preproc-reading-fmriprep-report",
          slug: "reading-an-fmriprep-report",
          number: "4.2",
          title: "Reading an fMRIPrep Report",
          description: "Inspect anatomical surface reconstructions, susceptibility distortion correction, and carpet plots.",
          duration: 22,
          objectives: [
            "Read fMRIPrep visual report cards (flicker gifs, carpet plots, tissue segmentations)",
            "Select appropriate confounds from confounds_timeseries.tsv for FEAT modeling",
          ],
          conceptTitle: "fMRIPrep Visual Diagnostics",
          concept:
            "fMRIPrep HTML reports feature interactive before/after flicker overlays for EPI distortion correction and carpet plots showing voxel time series ordered by tissue type alongside framewise displacement.",
          explanation:
            "In the confounds TSV file, fMRIPrep provides motion parameters (trans_x..rot_z), their temporal derivatives, framewise_displacement, and aCompCor components. Including these in your FEAT design matrix removes non-neural nuisance variance.",
          task: [
            "Open an fMRIPrep sub-XX.html visual report.",
            "Review the Susceptibility Distortion Correction (SDC) section.",
            "Inspect the carpet plot for vertical bands indicating global motion spikes.",
          ],
          summary: [
            "fMRIPrep visual reports provide interactive flicker comparisons for registration and distortion correction.",
            "Use confounds_timeseries.tsv regressors directly in your FEAT design matrix.",
          ],
          sourceLab: "Lab-2_Supplement_fMRIPrep.md",
          sourceSection: "2. Visual Report QA",
        }),
      ],
    },
  ],
};
