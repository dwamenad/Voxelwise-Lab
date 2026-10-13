import { learningLesson } from "@/lib/content/helpers";
import type { Course } from "@/lib/types";

export const higherLevelCourse: Course = {
  id: "course-higher-level",
  slug: "higher-level-fmri-analysis",
  catalogNumber: "FSL 401",
  title: "Higher-Level fMRI Analysis",
  shortTitle: "Higher-Level fMRI",
  description:
    "Scale from single runs to within-subject combinations and group-level population inference using FLAME mixed-effects modeling.",
  difficulty: "Advanced",
  status: "available",
  duration: "5 weeks · 7 hours",
  prerequisites: ["First-Level fMRI Analysis in FEAT", "Basic matrix algebra"],
  objectives: [
    "Distinguish within-subject fixed effects (Level 2) from between-subject mixed effects (Level 3)",
    "Combine multiple fMRI runs per participant properly weighting run-level variance (varcopes)",
    "Configure FLAME mixed-effects models for one-sample, two-sample, and covariate designs",
    "Apply cluster-based Gaussian Random Field and Threshold-Free Cluster Enhancement (TFCE) corrections",
    "Interpret group results without falling into the threshold-as-effect-size trap",
  ],
  requirements: ["FSL and Neurodesk", "Completed first-level .feat directories"],
  neurodeskRequired: true,
  accent: "amber",
  sourceLabs: ["Lab-4_FSL_Level2_Level3.md"],
  resources: [
    {
      id: "higher-source",
      title: "Original higher-level lab",
      description: "TUBRIC Level 2 and Level 3 source material.",
      format: "Markdown",
      href: "https://github.com/tubric/2026s-fmri-class/blob/main/Lab-4_FSL_Level2_Level3.md",
      available: true,
    },
  ],
  modules: [
    {
      id: "higher-module-1",
      number: 1,
      title: "Units and Effects",
      description: "Understand the hierarchy of variance from individual runs to the broader population.",
      lessons: [
        learningLesson({
          id: "higher-runs-vs-participants",
          slug: "runs-versus-participants",
          number: "1.1",
          title: "Runs Versus Participants",
          description: "Identify the observational unit entering each level of the multi-level GLM.",
          duration: 20,
          objectives: [
            "Distinguish scan time points (Level 1) from runs (Level 2) and participants (Level 3)",
            "Explain why treating runs as independent subjects commits a unit-of-analysis fallacy",
          ],
          conceptTitle: "The Multi-Level Hierarchy",
          concept:
            "In fMRI, timepoints within a run share scanner noise and autocorrelation. Runs within a subject share anatomy and individual physiology. Participants within a group share population-level effects.",
          explanation:
            "Level 1 models TR-to-TR signal changes within a single run. Level 2 combines multiple runs from the same subject. Level 3 combines subjects to infer population generalizability. Never pool runs across different subjects at Level 2.",
          task: [
            "Inspect the file tree of your analysis project.",
            "Verify that each subject has dedicated run-1.feat and run-2.feat directories.",
          ],
          quiz: {
            id: "hl-q1",
            question: "What error occurs if a researcher enters 40 runs from 10 participants directly into a group-level t-test?",
            options: [
              {
                id: "opt-1",
                text: "Pseudoreplication: within-subject variance is treated as between-subject variance, drastically inflating degrees of freedom and false positive rates.",
                isCorrect: true,
                explanation: "Exactly right! Runs from the same participant are not independent observations.",
              },
              {
                id: "opt-2",
                text: "The FEAT GUI will crash due to file format incompatibility.",
                isCorrect: false,
                explanation: "FEAT will run the computation mathematically, but the scientific inference is completely invalid.",
              },
            ],
            explanation: "Degrees of freedom in group tests must equal the number of independent subjects, not runs.",
          },
          summary: [
            "Level 1 = Timepoints -> Level 2 = Runs within Subject -> Level 3 = Subjects across Population.",
            "Respect the unit of analysis to prevent severe Type I error inflation.",
          ],
          sourceLab: "Lab-4_FSL_Level2_Level3.md",
          sourceSection: "1. Units of Analysis",
        }),
        learningLesson({
          id: "higher-fixed-random-mixed",
          slug: "fixed-random-and-mixed-effects",
          number: "1.2",
          title: "Fixed, Random, and Mixed Effects",
          description: "Connect model choice to the intended population scope of scientific inference.",
          duration: 22,
          objectives: [
            "Contrast fixed-effects scope (limited to the sample) with random/mixed-effects scope (generalizing to the population)",
            "Explain why FLAME estimates both within-session measurement noise and between-subject variance",
          ],
          conceptTitle: "Inference Scope",
          concept:
            "Fixed-effects analysis assumes zero between-subject variance; conclusions apply strictly to the specific participants scanned. Mixed-effects analysis models both within-subject estimation uncertainty and true between-subject biological variation, allowing generalization to the population.",
          explanation:
            "In FSL FEAT, higher-level mode lets you choose between 'Fixed Effects', 'Simple OLS', and 'FLAME 1 / FLAME 1+2'. Population inference must account for between-participant variation. FLAME carries lower-level variances into mixed-effects estimation; OLS is another option when its assumptions are appropriate. Choose the method for your design and data.",
          task: [
            "Open the FEAT GUI and switch the top-left dropdown to Higher-level analysis.",
            "Inspect the stats tab options: Fixed Effects, OLS, FLAME 1.",
          ],
          summary: [
            "Fixed-effects conclusions are limited to the specific observations analyzed.",
            "Mixed effects (FLAME) models biological between-subject variance to generalize to the population.",
          ],
          sourceLab: "Lab-4_FSL_Level2_Level3.md",
          sourceSection: "2. Fixed vs Mixed Effects",
        }),
      ],
    },
    {
      id: "higher-module-2",
      number: 2,
      title: "Level 2: Within-Subject Combination",
      description: "Combine multiple sessions or runs for each participant using fixed-effects weighting.",
      lessons: [
        learningLesson({
          id: "higher-combining-runs",
          slug: "combining-runs-within-a-participant",
          number: "2.1",
          title: "Combining Runs Within a Participant",
          description: "Use fixed-effects FEAT to combine compatible run-level copes and varcopes.",
          duration: 25,
          objectives: [
            "Select first-level .feat directories as inputs to higher-level analysis",
            "Explain how varcope (variance of the cope) weights runs with differing noise or motion",
          ],
          conceptTitle: "Fixed Effects Weighting",
          concept:
            "Within a single subject, true activation magnitude beta is assumed constant across runs. Runs with cleaner data and smaller varcope are given higher statistical weight.",
          explanation:
            "Level 2 FEAT takes run1.feat and run2.feat and outputs a subject-level .gfeat directory. Every contrast from Level 1 produces a corresponding copeX.feat directory inside the .gfeat.",
          task: [
            "In the FEAT GUI Higher-level mode, set Number of inputs to 2.",
            "Select sub-01_run-1.feat and sub-01_run-2.feat.",
            "In Model setup, choose Fixed Effects.",
          ],
          commandBuilder: {
            id: "gfeat-run-builder",
            title: "Launch Scripted Level 2 FEAT",
            prompt: "Assemble the shell command to execute the Level 2 design file design_sub01_lev2.fsf.",
            targetTokens: ["feat", "design_sub01_lev2.fsf"],
            scrambledTokens: ["feat", "design_sub01_lev2.fsf", "fslstats", "-m", "run1.feat"],
            hint: "FEAT analyses are executed by passing the .fsf configuration file directly to feat.",
            explanation: "feat <design.fsf> executes the full Level 2 higher-level pipeline.",
          },
          summary: [
            "Use Fixed Effects when combining runs within the same participant.",
            "Level 2 weights each run inversely by its estimation variance (varcope).",
          ],
          sourceLab: "Lab-4_FSL_Level2_Level3.md",
          sourceSection: "3. Level 2 Setup",
        }),
        learningLesson({
          id: "higher-reviewing-gfeat",
          slug: "reviewing-a-gfeat-directory",
          number: "2.2",
          title: "Reviewing a gfeat Directory",
          description: "Locate cope-specific outputs, z-stat maps, and check registration alignment across runs.",
          duration: 20,
          objectives: [
            "Navigate the sub-directories of a .gfeat directory (cope1.feat..copeN.feat)",
            "Verify that inputs were registered to the common standard space correctly",
          ],
          conceptTitle: "The .gfeat Architecture",
          concept:
            "A .gfeat (Group FEAT) directory contains one child .feat directory for every contrast modeled at Level 1. Inside each copeX.feat, stats/cope1.nii.gz and stats/varcope1.nii.gz contain the combined effect and its variance in standard space.",
          explanation:
            "Before passing Level 2 results into a group study, inspect the report.html inside the .gfeat. Ensure that both runs contributed equal degrees of freedom and that mask.nii.gz covers whole brain without dropout clipping.",
          task: [
            "In your terminal, list the contents of sub-01.gfeat.",
            "Inspect cope1.feat/stats/zstat1.nii.gz in FSLEyes overlaid on standard/MNI152_T1_2mm_brain.",
          ],
          command: "ls -la sub-01.gfeat/",
          expected: {
            output: "cope1.feat\ncope2.feat\nreport.html\nmask.nii.gz",
            explanation: "Each Level 1 contrast generates an independent cope directory.",
          },
          summary: [
            "Level 2 stores one copeX.feat per original Level 1 contrast.",
            "Always inspect the combined mask and standard space overlay in FSLEyes.",
          ],
          sourceLab: "Lab-4_FSL_Level2_Level3.md",
          sourceSection: "4. Reviewing Level 2",
        }),
      ],
    },
    {
      id: "higher-module-3",
      number: 3,
      title: "Level 3: Group Population Inference",
      description: "Configure FLAME mixed-effects models, group contrasts, covariates, and multiple comparison corrections.",
      lessons: [
        learningLesson({
          id: "higher-configuring-flame",
          slug: "configuring-flame",
          number: "3.1",
          title: "Configuring FLAME Mixed Effects",
          description: "Use FMRIB's Local Analysis of Mixed Effects (FLAME 1) to model between-subject variance.",
          duration: 25,
          objectives: [
            "Explain how FLAME incorporates both Level 1/2 varcope and between-subject random effects",
            "Contrast FLAME 1 with ordinary least squares (OLS) in the presence of outliers",
          ],
          conceptTitle: "FLAME Mixed Effects Engine",
          concept:
            "Ordinary regression treats all subjects as equally precise. But subjects with high motion or poor signal have larger variance. FLAME uses Bayesian modeling with fast MCMC sampling to down-weight noisy subjects in group estimates.",
          explanation:
            "FLAME 1 is fast, accurate, and recommended for nearly all group studies. FLAME 1+2 adds full MCMC sampling near the threshold boundary for borderline significance, taking significantly longer.",
          task: [
            "Set FEAT higher-level inputs to 'Inputs are lower-level FEAT directories'.",
            "Add all participant .gfeat directories or Level 1 .feat directories.",
            "Select FLAME 1 in the Stats tab.",
          ],
          quiz: {
            id: "flame-q",
            question: "Why is FLAME 1 superior to simple Ordinary Least Squares (OLS) for group fMRI?",
            options: [
              {
                id: "opt-1",
                text: "FLAME preserves and models lower-level estimation variances (varcopes), preventing noisy or erratic subjects from biasing group activations.",
                isCorrect: true,
                explanation: "Correct! OLS assumes homoscedasticity across subjects, making it fragile to noisy outliers.",
              },
              {
                id: "opt-2",
                text: "FLAME eliminates the need for multiple comparison correction.",
                isCorrect: false,
                explanation: "Multiple testing across 100,000 voxels must always be corrected regardless of estimation method.",
              },
            ],
            explanation: "FLAME carries forward both the effect size (cope) and estimation uncertainty (varcope).",
          },
          summary: [
            "FLAME 1 is the standard gold-standard mixed-effects estimator in FSL.",
            "Subjects with larger varcope naturally receive lower weighting in the group mean.",
          ],
          sourceLab: "Lab-4_FSL_Level2_Level3.md",
          sourceSection: "5. FLAME Modeling",
        }),
        learningLesson({
          id: "higher-group-contrasts-covariates",
          slug: "group-contrasts-and-covariates",
          number: "3.2",
          title: "Group Contrasts and Covariates",
          description: "Encode one-sample t-tests, two-sample group differences, and mean-centered continuous regressors.",
          duration: 28,
          objectives: [
            "Construct design matrices for independent two-sample t-tests (e.g. Patients vs Controls)",
            "Mean-center continuous behavioral or demographic covariates correctly",
          ],
          conceptTitle: "GLM Group Designs",
          concept:
            "Group models test hypotheses across participants. Continuous covariates (such as age, reaction time, or symptom score) must be mean-centered so that main effect regressors represent the group at the sample mean.",
          explanation:
            "For a two-sample t-test: EV1 = Group A indicator [1 1 0 0], EV2 = Group B indicator [0 0 1 1]. Contrast 1 (Group A > Group B) = [1 -1]. Contrast 2 (Group B > Group A) = [-1 1]. Set Group membership column to 1 and 2 if variances are modeled separately.",
          task: [
            "Open the FEAT Model Setup window.",
            "Create a two-group difference design with 1 continuous covariate.",
            "Check that the covariate values have the sample mean subtracted.",
          ],
          errorSpotting: {
            id: "group-glm-errors",
            title: "Auditing a Group Design Matrix",
            scenario: "A researcher sets up a two-group comparison with age as a covariate for 6 subjects (3 Patients, 3 Controls).",
            codeOrReport: "EV1 (Patients): [1, 1, 1, 0, 0, 0]\nEV2 (Controls): [0, 0, 0, 1, 1, 1]\nEV3 (Intercept): [1, 1, 1, 1, 1, 1]\nEV4 (Raw Age): [22, 25, 28, 45, 52, 60]\nContrast 1: [1, -1, 0, 0] (Patients > Controls)",
            options: [
              {
                id: "flaw-dummy",
                description: "Dummy variable trap: EV1 + EV2 = EV3 (collinear intercept). The design matrix is rank deficient.",
                isFlaw: true,
                explanation: "Including separate group indicators and a global intercept creates perfect multicollinearity. The GLM cannot be inverted.",
              },
              {
                id: "flaw-age",
                description: "Age is uncentered and heavily confounded with group (Controls are 30 years older than Patients).",
                isFlaw: true,
                explanation: "Collinearity between age and diagnosis makes it impossible to attribute activation differences to disease rather than normal aging.",
              },
              {
                id: "flaw-valid-contrast",
                description: "Contrast [1, -1, 0, 0] correctly contrasts EV1 and EV2.",
                isFlaw: false,
                explanation: "The contrast weights are mathematically correct, though the design itself has severe collinearity.",
              },
            ],
            summary: "Never include a global intercept alongside mutually exclusive group indicator columns.",
          },
          summary: [
            "Avoid the dummy variable trap (never combine group indicators with a global mean EV).",
            "Always mean-center continuous covariates.",
          ],
          sourceLab: "Lab-4_FSL_Level2_Level3.md",
          sourceSection: "6. Group Contrasts",
        }),
        learningLesson({
          id: "higher-multiple-comparisons",
          slug: "multiple-comparison-correction",
          number: "3.3",
          title: "Multiple Comparison Correction",
          description: "Cluster-extent Gaussian Random Field theory, TFCE, and avoiding circular display inferences.",
          duration: 25,
          objectives: [
            "Explain family-wise error rate (FWER) across 100,000 simultaneous voxel tests",
            "Configure Cluster-extent thresholding (Z > 3.1, p < 0.05) and Threshold-Free Cluster Enhancement (TFCE)",
          ],
          conceptTitle: "Correcting for Multiple Comparisons",
          concept:
            "A whole-brain volume contains ~100,000 voxels. Testing each voxel at uncorrected p < 0.05 produces ~5,000 false positive activations by chance alone.",
          explanation:
            "FSL offers: 1. Cluster-based thresholding using Gaussian Random Field (GRF) theory (primary cluster forming threshold Z > 3.1, cluster significance p < 0.05); 2. Non-parametric permutation testing with randomise and TFCE. Remember: statistical significance is not effect size.",
          task: [
            "In FEAT Post-stats tab, set Thresholding to Cluster.",
            "Set Z threshold to 3.1 and Cluster P threshold to 0.05.",
            "Inspect cluster table output in report_poststats.html.",
          ],
          summary: [
            "Uncorrected thresholds produce massive false positives.",
            "Use Z > 3.1 cluster-forming threshold to satisfy GRF assumptions, or run non-parametric TFCE.",
          ],
          sourceLab: "Lab-4_FSL_Level2_Level3.md",
          sourceSection: "7. Thresholding and Inference",
        }),
      ],
    },
  ],
};
