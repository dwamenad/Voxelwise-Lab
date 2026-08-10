import type { GlossaryTerm } from "@/lib/types";

const definitions: [string, string, string[]][] = [
  ["BET", "Brain Extraction Tool; an FSL tool that estimates a brain surface and removes non-brain tissue from an image.", ["fmri-preprocessing-fsl"]],
  ["BIDS", "Brain Imaging Data Structure; a convention for organizing and describing neuroimaging datasets with predictable folders, filenames, and metadata.", ["fsl-neuroimaging-foundations"]],
  ["BOLD", "Blood-oxygen-level-dependent contrast; the MRI signal used as an indirect measure of changes related to neural activity.", ["fsl-neuroimaging-foundations", "first-level-fmri-analysis-feat"]],
  ["cope", "Contrast of parameter estimates. A cope image contains the estimated effect for a particular contrast and is passed to higher-level analysis with its varcope.", ["first-level-fmri-analysis-feat", "higher-level-fmri-analysis"]],
  ["contrast", "A weighted combination of model parameter estimates that specifies a hypothesis to test.", ["first-level-fmri-analysis-feat"]],
  ["DataLad", "A data-management tool built on Git and git-annex that can install dataset structure separately from large file content.", ["fsl-neuroimaging-foundations"]],
  ["derivative", "An output produced from source data, such as a preprocessed BOLD image, mask, confound file, or statistical map.", ["fmri-preprocessing-fsl"]],
  ["EV", "Explanatory variable; a predictor column used to explain variation in the modeled BOLD signal.", ["first-level-fmri-analysis-feat"]],
  ["FEAT", "FMRI Expert Analysis Tool; FSL's interface and pipeline for preprocessing and statistical analysis of fMRI data.", ["first-level-fmri-analysis-feat"]],
  ["FILM", "FMRIB's Improved Linear Model; the time-series model used by FEAT at the first level, including local autocorrelation estimation.", ["first-level-fmri-analysis-feat"]],
  ["FLAME", "FMRIB's Local Analysis of Mixed Effects; FSL methods for modeling participant-level variation in higher-level analyses.", ["higher-level-fmri-analysis"]],
  ["FLIRT", "FMRIB's Linear Image Registration Tool; an FSL tool for affine or rigid linear registration.", ["fmri-preprocessing-fsl"]],
  ["FNIRT", "FMRIB's Nonlinear Image Registration Tool; an FSL tool for nonlinear registration, commonly from structural to standard space.", ["fmri-preprocessing-fsl"]],
  ["fMRIPrep", "A robust preprocessing pipeline that produces standardized derivatives, confounds, and visual reports for fMRI data.", ["fmri-preprocessing-fsl"]],
  ["FSLEyes", "FSL's image viewer for inspecting NIfTI images, overlays, coordinates, time series, histograms, and atlases.", ["fsl-neuroimaging-foundations"]],
  ["GLM", "General linear model; a framework that represents observed data as a weighted combination of predictors plus residual error.", ["first-level-fmri-analysis-feat"]],
  ["HRF", "Hemodynamic response function; a model of the delayed BOLD response used to transform event timing into an fMRI predictor.", ["first-level-fmri-analysis-feat"]],
  ["MCFLIRT", "FSL's motion-correction tool, which estimates rigid-body alignment of volumes within an fMRI run.", ["fmri-preprocessing-fsl"]],
  ["MNI space", "A shared stereotaxic template coordinate system used to compare locations across participants and studies.", ["fsl-neuroimaging-foundations", "fmri-preprocessing-fsl"]],
  ["NIfTI", "Neuroimaging Informatics Technology Initiative image format, commonly stored as .nii or compressed .nii.gz files.", ["fsl-neuroimaging-foundations"]],
  ["PE", "Parameter estimate; the fitted coefficient describing an explanatory variable's contribution to the signal at each voxel.", ["first-level-fmri-analysis-feat"]],
  ["PPI", "Psychophysiological interaction; a model testing whether functional coupling with a seed changes with psychological context.", ["ppi-and-ica"]],
  ["ROI", "Region of interest; a defined set of voxels used for targeted visualization, extraction, or hypothesis testing.", ["roi-analysis-fsl"]],
  ["TR", "Repetition time; the interval between successive volume acquisitions in an fMRI time series.", ["fsl-neuroimaging-foundations"]],
  ["varcope", "Variance of a contrast of parameter estimates. It quantifies uncertainty in the cope and is required for weighted higher-level modeling.", ["first-level-fmri-analysis-feat", "higher-level-fmri-analysis"]],
  ["voxel", "A three-dimensional image sample with a value and a location on the image grid.", ["fsl-neuroimaging-foundations"]],
  ["z-statistic", "A standardized statistic used by FEAT for inference and display; it reflects estimated effect relative to uncertainty, not raw effect size.", ["first-level-fmri-analysis-feat"]],
];

export const glossaryTerms: GlossaryTerm[] = definitions
  .map(([term, definition, relatedCourseSlugs]) => ({
    term,
    definition,
    relatedCourseSlugs,
    slug: term.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  }))
  .sort((a, b) => a.term.localeCompare(b.term));

export function searchGlossary(query: string): GlossaryTerm[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return glossaryTerms;
  return glossaryTerms
    .filter((item) => `${item.term} ${item.definition}`.toLowerCase().includes(normalized))
    .sort((a, b) => {
      const aExact = a.term.toLowerCase() === normalized ? 1 : 0;
      const bExact = b.term.toLowerCase() === normalized ? 1 : 0;
      return bExact - aExact || a.term.localeCompare(b.term);
    });
}
