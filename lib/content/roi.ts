import { learningLesson } from "@/lib/content/helpers";
import type { Course } from "@/lib/types";

export const roiCourse: Course = {
  id: "course-roi",
  slug: "roi-analysis-fsl",
  catalogNumber: "FSL 350",
  title: "ROI Analysis with FSL",
  shortTitle: "ROI Analysis",
  description:
    "Extract unbiased regional statistics and time series using atlas masks, coordinate spheres, and command-line FSL utilities.",
  difficulty: "Intermediate",
  status: "available",
  duration: "4 weeks · 5 hours",
  prerequisites: ["FSL & Neuroimaging Foundations", "Basic registration concepts"],
  objectives: [
    "Distinguish anatomical atlas ROIs from functional localizer masks",
    "Prevent statistical circularity and double dipping in ROI extraction",
    "Build and combine binary masks using fslmaths",
    "Transform masks between spaces using appropriate nearest-neighbour interpolation",
    "Extract regional means and time series using fslstats and fslmeants",
  ],
  requirements: ["FSL and FSLEyes", "An anatomical atlas or independently defined ROI"],
  neurodeskRequired: true,
  accent: "rose",
  sourceLabs: ["Lab-1_FSLeyes.md", "Lab-5_PPI_ICA.md"],
  resources: [
    {
      id: "roi-source",
      title: "Original mask workflow",
      description: "Atlas mask extraction in the TUBRIC PPI lab.",
      format: "Markdown",
      href: "https://github.com/tubric/2026s-fmri-class/blob/main/Lab-5_PPI_ICA.md",
      available: true,
    },
  ],
  modules: [
    {
      id: "roi-module-1",
      number: 1,
      title: "Defining an ROI",
      description: "Choose scientifically defensible region boundaries without introducing statistical circularity.",
      lessons: [
        learningLesson({
          id: "roi-anat-vs-functional",
          slug: "anatomical-and-functional-rois",
          number: "1.1",
          title: "Anatomical and Functional ROIs",
          description: "Choose an independent ROI definition that matches your scientific hypothesis.",
          duration: 20,
          objectives: [
            "Distinguish probabilistic anatomical atlases (Harvard-Oxford) from independent functional localizers",
            "Evaluate trade-offs between anatomical precision and functional heterogeneity",
          ],
          conceptTitle: "Types of Regions of Interest",
          concept:
            "Anatomical ROIs rely on macroscopic gyral/sulcal landmarks or cytoarchitectonic atlases. Functional ROIs identify clusters activated by an independent localizer task (e.g. Fusiform Face Area identified by a separate localizer run).",
          explanation:
            "FSL provides standard atlases in $FSLDIR/data/atlases (e.g., Harvard-Oxford cortical/subcortical structural atlases, Juelich histological atlas). In FSLEyes, you can load these atlases directly via Settings -> Atlases.",
          task: [
            "Open FSLEyes with the standard MNI152 template.",
            "Open the Atlas panel and add the Harvard-Oxford Cortical Structural Atlas.",
            "Locate the Left Amygdala or Fusiform Cortex.",
          ],
          summary: [
            "Anatomical ROIs are independent of task activations in the current experiment.",
            "Functional ROIs require an independent localizer scan or cross-validation fold.",
          ],
          sourceLab: "Lab-1_FSLeyes.md",
          sourceSection: "1. Atlases in FSLEyes",
        }),
        learningLesson({
          id: "roi-avoiding-circularity",
          slug: "avoiding-circularity",
          number: "1.2",
          title: "Avoiding Circularity (Double Dipping)",
          description: "Keep ROI definition statistically independent from the contrast effect extracted within it.",
          duration: 22,
          objectives: [
            "Recognize circular analysis (Kriegeskorte et al., 2009; Vul et al., 2009)",
            "Structure ROI pipelines with independent selection and held-out testing",
          ],
          conceptTitle: "The Double Dipping Fallacy",
          concept:
            "Selecting voxels that pass a statistical threshold for Contrast A (e.g., Task > Rest) and then extracting and running a t-test on those exact same voxels for Contrast A creates circular, non-independent bias. Effect sizes and p-values become severely distorted.",
          explanation:
            "Define ROIs using prespecified anatomy, an independent localizer, or held-out data. Orthogonal contrast vectors alone do not guarantee statistical independence. Cross-validation must keep selection separate from held-out observations and account for dependence between folds.",
          task: [
            "Review your candidate ROI selection criteria.",
            "Verify statistical independence of selection and testing; orthogonal contrast vectors alone are insufficient.",
            "Document whether selection was based on an anatomical atlas or independent localizer.",
          ],
          quiz: {
            id: "circularity-quiz",
            question: "Which of the following ROI analyses is statistically circular (invalid)?",
            options: [
              {
                id: "opt-1",
                text: "Thresholding the whole-brain map at p < 0.001 for Condition A > Condition B, extracting the mean beta from the significant cluster, and reporting p < 0.0001 from a t-test on that mean.",
                isCorrect: true,
                explanation: "Correct! The voxels were pre-selected specifically because they showed high Condition A > Condition B difference. Running a statistical test on them is circular double dipping.",
              },
              {
                id: "opt-2",
                text: "Extracting mean betas for Condition A > Condition B from an anatomical mask defined in the Harvard-Oxford atlas.",
                isCorrect: false,
                explanation: "Anatomical masks are independent of the functional data, avoiding circularity.",
              },
            ],
            explanation: "Selection criteria and test criteria must be statistically independent.",
          },
          summary: [
            "Never perform hypothesis tests on voxels selected with that same test.",
            "Use independent localizers, anatomical atlases, or cross-validation.",
          ],
          sourceLab: "Lab-5_PPI_ICA.md",
          sourceSection: "2. Circularity and Independence",
        }),
      ],
    },
    {
      id: "roi-module-2",
      number: 2,
      title: "Working with Masks",
      description: "Build, threshold, combine, and resample binary volume masks with fslmaths and FLIRT.",
      lessons: [
        learningLesson({
          id: "roi-building-mask-fslmaths",
          slug: "building-a-mask-with-fslmaths",
          number: "2.1",
          title: "Building a Mask with fslmaths",
          description: "Threshold probabilistic atlases, binarize, and combine masks using boolean arithmetic.",
          duration: 25,
          objectives: [
            "Extract specific atlas labels and threshold probability images",
            "Combine masks using -add, -mul, and -bin operators in fslmaths",
          ],
          conceptTitle: "Binary Masks with fslmaths",
          concept:
            "Probabilistic atlas maps contain voxel values from 0 to 100 representing the percentage of subjects sharing that label. A binary ROI mask contains only 1s inside the region and 0s elsewhere.",
          explanation:
            "To build a robust anatomical mask: 1. Threshold at a desired probability (e.g. -thr 25 for voxels with >= 25% probability); 2. Binarize using -bin; 3. Combine bilateral hemispheres with -add.",
          task: [
            "Extract Left Amygdala from the Harvard-Oxford subcortical atlas (label index 10).",
            "Threshold at 50% probability and binarize.",
          ],
          command: "fslmaths HarvardOxford-sub-maxprob-thr25-2mm.nii.gz -thr 10 -uthr 10 -bin left_amygdala_mask.nii.gz",
          commandBuilder: {
            id: "fslmaths-mask-builder",
            title: "Build the Mask Threshold Command",
            prompt: "Assemble the command to threshold probability_map.nii.gz at 30%, binarize, and save to roi_mask.nii.gz.",
            targetTokens: ["fslmaths", "probability_map.nii.gz", "-thr", "30", "-bin", "roi_mask.nii.gz"],
            scrambledTokens: ["roi_mask.nii.gz", "-bin", "30", "fslmaths", "-thr", "probability_map.nii.gz", "-M"],
            hint: "fslmaths <input> -thr <val> -bin <output>",
            explanation: "Zeroes voxels below 30 and sets all remaining voxels to 1.",
          },
          summary: [
            "-thr zeroes intensities below threshold; -bin converts non-zero voxels to 1.",
            "Always inspect generated masks in FSLEyes before extracting values.",
          ],
          sourceLab: "Lab-5_PPI_ICA.md",
          sourceSection: "3. Mask Creation",
        }),
        learningLesson({
          id: "roi-matching-image-spaces",
          slug: "matching-image-spaces",
          number: "2.2",
          title: "Matching Image Spaces",
          description: "Verify matrix dimensions, voxel grids, and apply nearest-neighbour interpolation.",
          duration: 20,
          objectives: [
            "Explain why extracting statistics requires masks and functional images to share identical voxel grids",
            "Use nearest-neighbour interpolation (-interp nearestneighbour) to preserve binary mask integrity",
          ],
          conceptTitle: "Voxel Grid and Space Alignment",
          concept:
            "If an ROI mask is defined in 2mm MNI standard space (91x109x91) but your functional data is in 3mm native EPI space (64x64x36), matrix indexing fails. The mask must be transformed into the target space.",
          explanation:
            "When resampling a binary mask, never use trilinear or spline interpolation, which create fractional edge values (e.g. 0.3, 0.7). Always specify -interp nearestneighbour in flirt or applywarp to preserve pure binary 0 and 1 values.",
          task: [
            "Transform standard_roi.nii.gz into participant native functional space.",
            "Use the inverse transformation matrix and nearest-neighbour interpolation.",
          ],
          command: "flirt -in standard_roi.nii.gz -ref example_func.nii.gz -applyxfm -init standard2example_func.mat -interp nearestneighbour -out native_roi.nii.gz",
          quiz: {
            id: "interp-quiz",
            question: "Why MUST you use -interp nearestneighbour when transforming a binary mask?",
            options: [
              {
                id: "opt-1",
                text: "Trilinear or spline interpolation blurs boundary voxels into fractions, creating a non-binary fuzzy mask that distorts voxel counts.",
                isCorrect: true,
                explanation: "Spot on! Nearest neighbour ensures every output voxel remains exactly 0 or 1 without creating blurred partial intensities.",
              },
              {
                id: "opt-2",
                text: "Nearest neighbour produces higher spatial resolution.",
                isCorrect: false,
                explanation: "Nearest neighbour does not alter spatial resolution; it avoids interpolating numeric labels.",
              },
            ],
            explanation: "Binary masks and discrete atlas label images require nearest-neighbour interpolation.",
          },
          summary: [
            "Check that dim1..dim3 and pixdim1..pixdim3 match using fslinfo.",
            "Always use -interp nearestneighbour for masks and atlas label volumes.",
          ],
          sourceLab: "Lab-5_PPI_ICA.md",
          sourceSection: "4. Space Transformations",
        }),
      ],
    },
    {
      id: "roi-module-3",
      number: 3,
      title: "Extracting Values",
      description: "Calculate masked summary statistics and time series with fslstats and fslmeants.",
      lessons: [
        learningLesson({
          id: "roi-summary-values-fslstats",
          slug: "summary-values-with-fslstats",
          number: "3.1",
          title: "Summary Values with fslstats",
          description: "Calculate masked mean percent signal change, parameter estimates, and anatomical volumes.",
          duration: 20,
          objectives: [
            "Extract masked non-zero means (-M) and voxel counts (-V) across contrast cope images",
            "Construct batch shell loops to summarize statistical results across subjects",
          ],
          conceptTitle: "Extracting Metrics with fslstats",
          concept:
            "fslstats operates on 3D or 4D images with command-line flags. The -k flag restricts all requested calculations strictly inside voxels where mask > 0.",
          explanation:
            "Common flags: -k <mask.nii.gz> -M (mean of non-zero voxels); -k <mask.nii.gz> -V (voxel count and volume in mm³); -k <mask.nii.gz> -R (minimum and maximum values).",
          task: [
            "Extract the mean parameter estimate from cope1.nii.gz inside your amygdala mask.",
            "Check that the mask volume matches expected anatomical size.",
          ],
          command: "fslstats stats/cope1.nii.gz -k left_amygdala_mask.nii.gz -M",
          expected: {
            output: "24.6852",
            explanation: "The command prints the single mean contrast value across all mask voxels.",
          },
          summary: [
            "fslstats <stat_image> -k <mask_image> -M computes the regional mean effect.",
            "Combine with bash scripts to extract values across all participants into a CSV.",
          ],
          sourceLab: "Lab-5_PPI_ICA.md",
          sourceSection: "5. fslstats Extraction",
        }),
        learningLesson({
          id: "roi-time-series-fslmeants",
          slug: "time-series-with-fslmeants",
          number: "3.2",
          title: "Time Series with fslmeants",
          description: "Extract average BOLD time series for connectivity modeling and event-related plotting.",
          duration: 22,
          objectives: [
            "Extract a 1D time course vector from 4D preprocessed BOLD data",
            "Inspect physiological seed variance and prepare regressors for PPI analysis",
          ],
          conceptTitle: "Extracting Mean Time Series",
          concept:
            "fslmeants averages all voxel timeseries within an ROI mask across each TR, producing a single text column of N time points (e.g. 180 rows).",
          explanation:
            "This 1D time series represents the regional physiological activity. It can be plotted in Python/R to visualize peristimulus BOLD responses or entered as a physiological regressor in Psychophysiological Interaction (PPI) models.",
          task: [
            "Extract the average time course from filtered_func_data.nii.gz inside your seed mask.",
            "Plot the first 20 time points using head.",
          ],
          command: "fslmeants -i filtered_func_data.nii.gz -m left_amygdala_mask.nii.gz -o amygdala_ts.txt",
          expected: {
            output: "amygdala_ts.txt created (180 values)",
            explanation: "fslmeants writes a 1D ASCII text file with one value per volume.",
          },
          summary: [
            "fslmeants -i <4D_data> -m <mask> -o <output.txt> extracts the 1D time course.",
            "Essential for functional connectivity, peristimulus plots, and PPI regressors.",
          ],
          sourceLab: "Lab-5_PPI_ICA.md",
          sourceSection: "6. fslmeants Extraction",
        }),
      ],
    },
  ],
};
