import { learningLesson } from "@/lib/content/helpers";
import type { Course } from "@/lib/types";

export const ppiIcaCourse: Course = {
  id: "course-ppi-ica",
  slug: "ppi-and-ica",
  catalogNumber: "FSL 430",
  title: "PPI and ICA",
  shortTitle: "PPI & ICA",
  description:
    "Extend first-level modeling beyond isolated activation to task-dependent functional connectivity (PPI) and data-driven component decomposition (MELODIC ICA).",
  difficulty: "Advanced",
  status: "available",
  duration: "6 weeks · 8 hours",
  prerequisites: ["First-Level fMRI Analysis in FEAT", "ROI Analysis with FSL"],
  objectives: [
    "Distinguish functional connectivity changes from regional activation differences",
    "Construct physiological, psychological, and interaction terms for PPI modeling",
    "Configure and run PPI models in FEAT and interpret directional interaction contrasts",
    "Explain spatial Independent Component Analysis (MELODIC ICA) principles",
    "Classify ICA components into canonical resting-state networks versus motion/physiological artifacts",
  ],
  requirements: ["Completed first-level example", "Validated seed ROI", "Neurodesk FSL environment"],
  neurodeskRequired: true,
  accent: "teal",
  sourceLabs: ["Lab-5_PPI_ICA.md"],
  resources: [
    {
      id: "ppi-source",
      title: "Original PPI and ICA lab",
      description: "TUBRIC Lab 5 source material.",
      format: "Markdown",
      href: "https://github.com/tubric/2026s-fmri-class/blob/main/Lab-5_PPI_ICA.md",
      available: true,
    },
  ],
  modules: [
    {
      id: "ppi-module-1",
      number: 1,
      title: "Connectivity Concepts",
      description: "Understand how task demands modulate inter-regional functional communication.",
      lessons: [
        learningLesson({
          id: "ppi-activation-vs-connectivity",
          slug: "activation-versus-connectivity",
          number: "1.1",
          title: "Activation Versus Connectivity",
          description: "Separate changes in regional BOLD magnitude from changes in inter-regional coherence.",
          duration: 20,
          objectives: [
            "Contrast functional segregation (GLM activation) with functional integration (connectivity)",
            "Explain why two regions can show correlated activity without changing their mean activation",
          ],
          conceptTitle: "Segregation vs Integration",
          concept:
            "Standard GLM analysis asks: 'Does region X activate more during condition A than condition B?' Connectivity asks: 'Does the coupling between region X and region Y change as a function of psychological context?'",
          explanation:
            "Task-based functional connectivity tests whether the slope of the regression line relating region X to region Y changes across task conditions. This is modeled statistically as an interaction effect in the GLM.",
          task: [
            "Review the PPI conceptual diagram in FSLEyes or lab slides.",
            "Identify candidate seed regions (e.g. Amygdala, Fusiform, DLPFC) for your scientific question.",
          ],
          quiz: {
            id: "conn-quiz",
            question: "Can two brain areas exhibit significant PPI connectivity during a task even if neither area shows a significant main effect of task activation?",
            options: [
              {
                id: "opt-1",
                text: "Yes: their mean BOLD response may stay constant while their temporal covariance increases selectively during the experimental condition.",
                isCorrect: true,
                explanation: "Correct! The slope of the relationship can change dramatically without changing the overall mean level of BOLD signal.",
              },
              {
                id: "opt-2",
                text: "No: a region must show significant activation in FEAT before it can participate in connectivity.",
                isCorrect: false,
                explanation: "Functional connectivity is distinct from mean amplitude changes.",
              },
            ],
            explanation: "Connectivity tests change in slope (interaction), not change in intercept or mean.",
          },
          summary: [
            "Activation measures mean BOLD response; connectivity measures co-fluctuation.",
            "Task modulation of connectivity is modeled as a statistical interaction.",
          ],
          sourceLab: "Lab-5_PPI_ICA.md",
          sourceSection: "1. Activation vs Connectivity",
        }),
        learningLesson({
          id: "ppi-three-terms",
          slug: "the-three-ppi-terms",
          number: "1.2",
          title: "The Three PPI Terms",
          description: "Physiological, psychological, and psychophysiological interaction regressors.",
          duration: 25,
          objectives: [
            "Define the Physiological term (Phys), Psychological term (Psych), and Interaction term (PPI)",
            "Explain why the main effects of Phys and Psych must be included to avoid spurious interaction effects",
          ],
          conceptTitle: "The Linear PPI Model",
          concept:
            "A valid PPI GLM requires three critical regressors: 1. Phys (seed BOLD time series); 2. Psych (task condition waveform, e.g. +1 for Task A, -1 for Task B); 3. Interaction (the product of Phys and Psych).",
          explanation:
            "Under the Neyman-Pearson linear model theorem, omitting the main effects of either Phys or Psych inflates the interaction term with baseline variance, creating rampant false positives. Both main effects must remain in the design matrix as nuisance regressors.",
          task: [
            "Sketch the three columns: Phys, Psych, and Phys * Psych.",
            "Verify that Psych is centered (e.g., +1 for Condition A, -1 for Condition B, 0 for rest).",
          ],
          errorSpotting: {
            id: "ppi-setup-errors",
            title: "Auditing a PPI Model Design",
            scenario: "A researcher configures a PPI model in FEAT to find regions functionally coupled with the amygdala during fearful vs neutral faces.",
            codeOrReport: "EV1 (PPI Interaction): Amygdala_Phys * Task_Psych\nContrast 1: [1] (Testing EV1 > 0)\n(No other EVs included in the model)",
            options: [
              {
                id: "ppi-err-main-effects",
                description: "Fatal statistical omission: The main effect of the seed (Phys) and task (Psych) are absent from the model.",
                isFlaw: true,
                explanation: "Without controlling for the main effect of seed variance and task timing, EV1 will capture general seed correlations and task activations as false positive connectivity.",
              },
              {
                id: "ppi-err-direction",
                description: "Contrast [1] is testing positive modulation.",
                isFlaw: false,
                explanation: "Testing [1] on the interaction regressor correctly isolates positive task-modulated slope.",
              },
            ],
            summary: "A PPI model is only valid when both constituent main effects (Phys and Psych) are entered alongside the interaction.",
          },
          summary: [
            "PPI requires: 1. Phys (seed), 2. Psych (task), 3. Phys * Psych (interaction).",
            "Never model the interaction without both main effects present.",
          ],
          sourceLab: "Lab-5_PPI_ICA.md",
          sourceSection: "2. The Three Terms",
        }),
      ],
    },
    {
      id: "ppi-module-2",
      number: 2,
      title: "Seed Workflow",
      description: "Extract and verify native-space seed time courses from anatomically validated masks.",
      lessons: [
        learningLesson({
          id: "ppi-creating-atlas-seed",
          slug: "creating-an-atlas-based-seed",
          number: "2.1",
          title: "Creating an Atlas-Based Seed",
          description: "Extract, threshold, and inspect a standardized seed region.",
          duration: 20,
          objectives: [
            "Generate standardized seed masks from the Harvard-Oxford structural atlas",
            "Inspect seed boundaries to ensure no white matter or CSF contamination",
          ],
          conceptTitle: "Seed Region Preparation",
          concept:
            "The seed is the reference ROI from which the physiological time course is extracted. Subcortical structures like the amygdala or striatum must be carefully thresholded to exclude surrounding ventricles.",
          explanation:
            "Use fslmaths to extract the specific label index from the atlas, threshold at 25-50% probability, and binarize. Check in FSLEyes that the seed sits entirely within grey matter.",
          task: [
            "Extract the Left Amygdala mask from the standard 2mm atlas.",
            "Inspect the mask overlaid on MNI152 in FSLEyes.",
          ],
          command: "fslmaths HarvardOxford-sub-maxprob-thr25-2mm.nii.gz -thr 10 -uthr 10 -bin seed_amygdala.nii.gz",
          summary: [
            "Isolate the atlas label index using -thr and -uthr.",
            "Verify that the seed mask avoids CSF and white matter.",
          ],
          sourceLab: "Lab-5_PPI_ICA.md",
          sourceSection: "3. Atlas Seed Extraction",
        }),
        learningLesson({
          id: "ppi-moving-seed-native-space",
          slug: "moving-the-seed-to-native-space",
          number: "2.2",
          title: "Moving the Seed to Native Space",
          description: "Apply inverse registration transforms with nearest-neighbour interpolation.",
          duration: 22,
          objectives: [
            "Invert the functional-to-standard transformation matrix",
            "Transform standard masks into subject-specific EPI native space",
          ],
          conceptTitle: "Inverse Coordinate Warping",
          concept:
            "BOLD time series live in native functional space (filtered_func_data.nii.gz). To extract the physiological time course without resampling the entire 4D time series, we warp the 3D seed mask backwards into native space.",
          explanation:
            "Invert standard2example_func.mat using convert_xfm. Then apply the inverted transform to the seed using flirt with -interp nearestneighbour.",
          task: [
            "Invert the registration matrix: convert_xfm -omat standard2func.mat -inverse func2standard.mat.",
            "Apply the transform to the seed mask.",
          ],
          command: "flirt -in seed_amygdala.nii.gz -ref example_func.nii.gz -applyxfm -init standard2func.mat -interp nearestneighbour -out native_seed.nii.gz",
          summary: [
            "Always invert the forward registration matrix using convert_xfm -inverse.",
            "Apply nearest-neighbour interpolation to maintain binary mask boundaries.",
          ],
          sourceLab: "Lab-5_PPI_ICA.md",
          sourceSection: "4. Native Space Warping",
        }),
        learningLesson({
          id: "ppi-extracting-seed-ts",
          slug: "extracting-the-seed-time-series",
          number: "2.3",
          title: "Extracting the Seed Time Series",
          description: "Run fslmeants and inspect physiological regressor properties.",
          duration: 20,
          objectives: [
            "Extract the 1D mean seed signal with fslmeants",
            "Examine the physiological regressor for sudden artifacts or zero variance",
          ],
          conceptTitle: "Physiological Regressor Extraction",
          concept:
            "fslmeants computes the spatial average across all voxels in the native seed mask for each volume, writing a 1D column vector.",
          explanation:
            "Inspect the extracted time series. If variance is zero, the mask warped entirely outside the brain. If spikes are present, correlate with motion parameters.",
          task: [
            "Run fslmeants on native preprocessed data.",
            "Verify that the number of rows equals the number of TRs in the scan.",
          ],
          command: "fslmeants -i filtered_func_data.nii.gz -m native_seed.nii.gz -o phys_seed_ts.txt",
          expected: {
            output: "Output phys_seed_ts.txt written.",
            explanation: "Text file containing 1 numeric value per TR volume.",
          },
          summary: [
            "Use fslmeants to extract the physiological regressor.",
            "Check that length matches dim4 and variance is non-zero.",
          ],
          sourceLab: "Lab-5_PPI_ICA.md",
          sourceSection: "5. Seed Time Course Extraction",
        }),
      ],
    },
    {
      id: "ppi-module-3",
      number: 3,
      title: "PPI in FEAT",
      description: "Build the interaction term and estimate task-modulated connectivity in FEAT.",
      lessons: [
        learningLesson({
          id: "ppi-building-interaction-term",
          slug: "building-the-interaction-term",
          number: "3.1",
          title: "Building the Interaction Term",
          description: "Center psychological and physiological terms to create a clean interaction vector.",
          duration: 25,
          objectives: [
            "Explain why centering waveforms prior to multiplication is essential",
            "Multiply centered Phys and Psych regressors using Python or text utilities",
          ],
          conceptTitle: "Waveform Centering",
          concept:
            "Before computing the element-wise product (Phys * Psych), both vectors must be zero-centered. If the psychological vector is coded as [0, 1] instead of [-1, +1], the interaction term will be collinear with the physiological regressor.",
          explanation:
            "Mean-center the physiological time series: Phys_centered = Phys - mean(Phys). Code psychological condition: Psych = +1 for Task A, -1 for Task B. Then multiply element-wise: PPI = Phys_centered * Psych.",
          task: [
            "Generate the centered interaction text column.",
            "Save as ppi_interaction_ts.txt.",
          ],
          summary: [
            "Mean-center the physiological time series before multiplication.",
            "Code contrast waveforms symmetrically (e.g. +1 vs -1) to prevent collinearity.",
          ],
          sourceLab: "Lab-5_PPI_ICA.md",
          sourceSection: "6. Interaction Regressor Construction",
        }),
        learningLesson({
          id: "ppi-feat-evs-contrasts",
          slug: "ppi-evs-and-contrasts",
          number: "3.2",
          title: "PPI EVs and Contrasts",
          description: "Configure FEAT with the 3 regressors and interpret directional connectivity maps.",
          duration: 28,
          objectives: [
            "Configure a 1st-level FEAT design matrix with custom 1D text files (1 entry per volume)",
            "Interpret positive ([1]) and negative ([-1]) interaction contrast maps",
          ],
          conceptTitle: "The Complete PPI Design Matrix",
          concept:
            "In FEAT, set Number of EVs to at least 3: EV1 = Task waveform (Custom 1 entry per volume); EV2 = Seed time course (Phys, uncentered or centered); EV3 = PPI Interaction regressor. Plus standard motion confound regressors.",
          explanation:
            "Contrast 1 (PPI > 0): [0, 0, 1]. Significant voxels in this map show increased functional coupling with the seed during Task A compared to Task B. Contrast 2 (PPI < 0): [0, 0, -1] identifies regions showing decoupled or anti-correlated activity.",
          task: [
            "In FEAT Full Analysis mode, load filtered_func_data.",
            "In the Stats tab, configure the 3 EVs using 'Custom (1 entry per volume)'.",
            "Set Contrasts: C1 = [0, 0, 1] (Task A > Task B Connectivity).",
          ],
          summary: [
            "EV1 = Task (Psych), EV2 = Seed (Phys), EV3 = Interaction (PPI).",
            "Contrast [0, 0, 1] tests condition-specific increases in functional coupling.",
          ],
          sourceLab: "Lab-5_PPI_ICA.md",
          sourceSection: "7. FEAT PPI Modeling",
        }),
      ],
    },
    {
      id: "ppi-module-4",
      number: 4,
      title: "Independent Component Analysis (ICA)",
      description: "Data-driven spatial decomposition of 4D BOLD data with MELODIC.",
      lessons: [
        learningLesson({
          id: "ica-what-ica-estimates",
          slug: "what-ica-estimates",
          number: "4.1",
          title: "What ICA Estimates with MELODIC",
          description: "Spatial Independent Component Analysis for blind signal separation.",
          duration: 25,
          objectives: [
            "Explain the difference between PCA (orthogonal variance) and ICA (statistical independence)",
            "Configure MELODIC in FSL for single-session or multi-session tensor ICA",
          ],
          conceptTitle: "Spatial ICA with MELODIC",
          concept:
            "Unlike GLM which requires a predefined task hypothesis, Independent Component Analysis (ICA) is a data-driven method that decomposes 4D fMRI data into spatially independent component maps and associated time courses: X = S * A.",
          explanation:
            "FSL's MELODIC (Multivariate Exploratory Linear Optimized Decomposition into Independent Components) uses spatial ICA. It assumes the brain is composed of non-Gaussian spatial networks that fluctuate over time.",
          task: [
            "Launch the MELODIC GUI or run melodic from the command line.",
            "Run single-session ICA on filtered_func_data.nii.gz.",
          ],
          command: "melodic -i filtered_func_data.nii.gz -o melodic_output --tr=2.0 --report",
          expected: {
            output: "MELODIC report written to melodic_output/report/00index.html",
            explanation: "MELODIC generates an interactive HTML report showing spatial maps, time courses, and power spectra.",
          },
          summary: [
            "MELODIC performs spatial ICA without needing task timing files.",
            "Decomposes fMRI data into spatial maps and time courses.",
          ],
          sourceLab: "Lab-5_PPI_ICA.md",
          sourceSection: "8. MELODIC Spatial ICA",
        }),
        learningLesson({
          id: "ica-interpreting-components",
          slug: "interpreting-components",
          number: "4.2",
          title: "Interpreting Components: Signal vs Artifact",
          description: "Identify default mode, executive, and sensory networks versus motion and vascular artifacts.",
          duration: 28,
          objectives: [
            "Recognize canonical resting-state networks (DMN, Salience, Visual, Sensorimotor)",
            "Classify artifactual components based on spatial edge ringing, CSF pulsations, and high-frequency power spectra",
          ],
          conceptTitle: "Component Classification",
          concept:
            "Each MELODIC component is represented by three pieces of evidence: 1. Spatial z-map (does it follow grey matter anatomy or tissue boundaries?); 2. Time series (does it show smooth neural dynamics or abrupt spike jumps?); 3. Frequency power spectrum (neural signal has power < 0.1 Hz; cardiac/scanner noise has high-frequency peaks).",
          explanation:
            "Signal networks (e.g. Default Mode Network in precuneus, posterior cingulate, and mPFC) show bilateral grey-matter distribution and low-frequency power. Artifacts show rim-like ring patterns around the edge of the skull (head motion), intense spots in the ventricles (CSF pulsatility), or sagittal sinus stripes (vascular noise). Tools like FSL FIX automate this classification.",
          task: [
            "Open melodic_output/report/00index.html.",
            "Review Component 1 through Component 10.",
            "Tag each component as either 'Neural Network' or 'Noise Artifact'.",
          ],
          errorSpotting: {
            id: "ica-classification-errors",
            title: "Classifying MELODIC Components",
            scenario: "An investigator reviews 3 MELODIC components to decide which to retain as neural networks vs clean with FSL FIX.",
            codeOrReport: "Component 3: Bilateral activations confined to gray matter in precuneus and bilateral angular gyrus. Power spectrum concentrated between 0.01 - 0.08 Hz.\nComponent 7: Thin 1-voxel bright outline around the entire outer rim of the cerebral cortex. Time series shows sudden spikes corresponding to participant swallows.\nComponent 12: High intensity strictly localized inside the fourth ventricle and lateral ventricles with sawtooth time series.",
            options: [
              {
                id: "ica-c3",
                description: "Component 3 is a canonical neural resting-state network (Default Mode Network).",
                isFlaw: false,
                explanation: "Bilateral grey matter localization and low-frequency spectral concentration (< 0.1 Hz) are hallmarks of neural signal.",
              },
              {
                id: "ica-c7",
                description: "Component 7 is head motion artifact (edge ringing).",
                isFlaw: false,
                explanation: "Outer rim outline and sudden step jumps in time series indicate bulk head displacement.",
              },
              {
                id: "ica-c12",
                description: "Component 12 is a physiological CSF pulsation artifact.",
                isFlaw: false,
                explanation: "Ventricular localization with sawtooth oscillation reflects non-neural cerebrospinal fluid pulsatility.",
              },
              {
                id: "ica-mistake",
                description: "Treating Component 7 as a task-activated cortical network.",
                isFlaw: true,
                explanation: "Interpreting motion edge ringing as cortical activation is a classic neuroimaging error.",
              },
            ],
            summary: "Examine spatial maps, time courses, and frequency spectra together to distinguish signal from noise.",
          },
          summary: [
            "Neural signal: Bilateral grey matter, low frequency (< 0.1 Hz).",
            "Artifact: Outer edge ringing, ventricles, blood vessels, sharp temporal jumps.",
          ],
          sourceLab: "Lab-5_PPI_ICA.md",
          sourceSection: "9. Component Classification",
        }),
      ],
    },
  ],
};
