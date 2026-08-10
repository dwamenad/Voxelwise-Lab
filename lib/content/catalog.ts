import { outlineLesson } from "@/lib/content/helpers";
import { firstLevelCourse } from "@/lib/content/first-level";
import { foundationsCourse } from "@/lib/content/foundations";
import type { Course, CourseModule, Lesson } from "@/lib/types";

function modulesFromOutline(
  courseKey: string,
  sourceLab: string,
  outline: { title: string; lessons: { title: string; description: string }[] }[],
): CourseModule[] {
  return outline.map((module, moduleIndex) => ({
    id: `${courseKey}-module-${moduleIndex + 1}`,
    number: moduleIndex + 1,
    title: module.title,
    lessons: module.lessons.map((lesson, lessonIndex) => {
      const slug = lesson.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      return outlineLesson(
        `${courseKey}-${slug}`,
        slug,
        `${moduleIndex + 1}.${lessonIndex + 1}`,
        lesson.title,
        lesson.description,
        sourceLab,
      );
    }),
  }));
}

const preprocessingCourse: Course = {
  id: "course-preprocessing",
  slug: "fmri-preprocessing-fsl",
  catalogNumber: "FSL 201",
  title: "fMRI Preprocessing with FSL",
  shortTitle: "fMRI Preprocessing",
  description: "Understand what each preprocessing step changes, configure FEAT deliberately, and make quality control part of the workflow.",
  difficulty: "Intermediate",
  status: "outline",
  duration: "6 weeks · 8 hours",
  prerequisites: ["FSL & Neuroimaging Foundations", "Access to a BOLD and T1-weighted image"],
  objectives: ["Explain why preprocessing is needed", "Configure FEAT preprocessing", "Inspect motion, extraction, smoothing, filtering, and registration", "Compare the roles of FEAT and fMRIPrep"],
  requirements: ["Neurodesk with FSL", "Example dataset from the TUBRIC lab"],
  neurodeskRequired: true,
  accent: "blue",
  sourceLabs: ["Lab-2_Preprocessing.md", "Lab-2_Supplement_fMRIPrep.md"],
  resources: [{ id: "preprocessing-source", title: "Original preprocessing lab", description: "TUBRIC Lab 2 source material.", format: "Markdown", href: "https://github.com/tubric/2026s-fmri-class/blob/main/Lab-2_Preprocessing.md", available: true }],
  modules: modulesFromOutline("preprocessing", "Lab-2_Preprocessing.md", [
    { title: "Before preprocessing", lessons: [{ title: "Why preprocessing exists", description: "Separate acquisition artifacts, nuisance variation, and anatomical alignment from the later statistical model." }, { title: "Inspecting raw BOLD data", description: "Identify coverage, dropout, motion, spikes, and orientation problems before running a pipeline." }] },
    { title: "Within-run corrections", lessons: [{ title: "Motion correction with MCFLIRT", description: "Estimate and review rigid-body motion across volumes." }, { title: "Brain extraction", description: "Remove non-brain tissue while preserving cortex and cerebellum." }, { title: "Spatial smoothing", description: "Understand how smoothing changes signal, noise, localization, and model assumptions." }, { title: "Temporal filtering", description: "Remove slow trends while preserving frequencies relevant to the design." }] },
    { title: "Registration and quality control", lessons: [{ title: "Functional to anatomical registration", description: "Align lower-resolution BOLD data to a participant's structural image." }, { title: "Anatomical to standard registration", description: "Map participant anatomy to a shared template space." }, { title: "Preprocessing quality control", description: "Combine motion plots, masks, overlays, and reports into a defensible QC decision." }] },
    { title: "fMRIPrep supplement", lessons: [{ title: "When to use fMRIPrep", description: "Compare workflow scope, provenance, reports, and downstream FEAT integration." }, { title: "Reading an fMRIPrep report", description: "Inspect anatomical, functional, confound, and registration sections before analysis." }] },
  ]),
};

const higherLevelCourse: Course = {
  id: "course-higher-level",
  slug: "higher-level-fmri-analysis",
  catalogNumber: "FSL 401",
  title: "Higher-Level fMRI Analysis",
  shortTitle: "Higher-Level Analysis",
  description: "Combine runs and participants while keeping fixed, random, and mixed effects—and their uncertainty—conceptually distinct.",
  difficulty: "Advanced",
  status: "outline",
  duration: "6 weeks · 8 hours",
  prerequisites: ["First-Level fMRI Analysis in FEAT", "Valid cope and varcope outputs"],
  objectives: ["Choose Level 2 and Level 3 inputs", "Distinguish fixed and mixed effects", "Configure FLAME models and covariates", "Interpret group output and correction"],
  requirements: ["Completed first-level FEAT runs", "Neurodesk FSL environment"],
  neurodeskRequired: true,
  accent: "violet",
  sourceLabs: ["Lab-4_FSL_Level2_Level3.md", "Demo_FEAT_HigherLevelStats.ipynb"],
  resources: [{ id: "higher-source", title: "Original higher-level lab", description: "TUBRIC Level 2 and Level 3 source material.", format: "Markdown", href: "https://github.com/tubric/2026s-fmri-class/blob/main/Lab-4_FSL_Level2_Level3.md", available: true }],
  modules: modulesFromOutline("higher", "Lab-4_FSL_Level2_Level3.md", [
    { title: "Units and effects", lessons: [{ title: "Runs versus participants", description: "Identify the observational unit entering each model level." }, { title: "Fixed, random, and mixed effects", description: "Connect model choice to the population scope of inference." }] },
    { title: "Level 2", lessons: [{ title: "Combining runs within a participant", description: "Use fixed effects to combine compatible run-level copes and varcopes." }, { title: "Reviewing a gfeat directory", description: "Locate cope-specific outputs and check that all runs contributed as intended." }] },
    { title: "Level 3", lessons: [{ title: "Configuring FLAME", description: "Create a group model with participant inputs and modeled between-subject variance." }, { title: "Group contrasts and covariates", description: "Encode group means, differences, and mean-centered covariates in a valid design." }, { title: "Multiple comparison correction", description: "Interpret thresholding and corrected inference without treating a display threshold as an effect size." }] },
  ]),
};

const roiCourse: Course = {
  id: "course-roi",
  slug: "roi-analysis-fsl",
  catalogNumber: "FSL 420",
  title: "ROI Analysis with FSL",
  shortTitle: "ROI Analysis",
  description: "Create and validate masks, match image spaces, and extract interpretable values without circular analysis choices.",
  difficulty: "Intermediate",
  status: "outline",
  duration: "4 weeks · 5 hours",
  prerequisites: ["FSL & Neuroimaging Foundations", "Basic registration concepts"],
  objectives: ["Distinguish anatomical and functional ROIs", "Build and inspect masks", "Use fslstats and fslmeants", "Recognize space mismatches and circularity"],
  requirements: ["FSL and FSLEyes", "An anatomical atlas or independently defined ROI"],
  neurodeskRequired: true,
  accent: "rose",
  sourceLabs: ["Lab-1_FSLeyes.md", "Lab-5_PPI_ICA.md"],
  resources: [{ id: "roi-source", title: "Original mask workflow", description: "Atlas mask extraction in the TUBRIC PPI lab.", format: "Markdown", href: "https://github.com/tubric/2026s-fmri-class/blob/main/Lab-5_PPI_ICA.md", available: true }],
  modules: modulesFromOutline("roi", "Lab-5_PPI_ICA.md", [
    { title: "Defining an ROI", lessons: [{ title: "Anatomical and functional ROIs", description: "Choose an independent ROI definition that matches the scientific question." }, { title: "Avoiding circularity", description: "Keep ROI definition statistically independent from the effect extracted within it." }] },
    { title: "Working with masks", lessons: [{ title: "Building a mask with fslmaths", description: "Threshold, binarize, combine, and name masks transparently." }, { title: "Matching image spaces", description: "Verify dimensions, affine, interpolation, and anatomical overlap before extraction." }] },
    { title: "Extracting values", lessons: [{ title: "Summary values with fslstats", description: "Calculate masked means, ranges, voxel counts, and volumes with explicit units." }, { title: "Time series with fslmeants", description: "Extract and inspect a representative signal from a validated ROI." }] },
  ]),
};

const ppiIcaCourse: Course = {
  id: "course-ppi-ica",
  slug: "ppi-and-ica",
  catalogNumber: "FSL 430",
  title: "PPI and ICA",
  shortTitle: "PPI & ICA",
  description: "Extend first-level thinking from activation to task-dependent connectivity and data-driven components.",
  difficulty: "Advanced",
  status: "outline",
  duration: "6 weeks · 8 hours",
  prerequisites: ["First-Level fMRI Analysis in FEAT", "ROI Analysis with FSL"],
  objectives: ["Distinguish connectivity from activation", "Create physiological, psychological, and interaction terms", "Configure a PPI model", "Interpret ICA components and artifacts"],
  requirements: ["Completed first-level example", "Validated seed ROI", "Neurodesk FSL environment"],
  neurodeskRequired: true,
  accent: "teal",
  sourceLabs: ["Lab-5_PPI_ICA.md"],
  resources: [{ id: "ppi-source", title: "Original PPI and ICA lab", description: "TUBRIC Lab 5 source material.", format: "Markdown", href: "https://github.com/tubric/2026s-fmri-class/blob/main/Lab-5_PPI_ICA.md", available: true }],
  modules: modulesFromOutline("ppi", "Lab-5_PPI_ICA.md", [
    { title: "Connectivity concepts", lessons: [{ title: "Activation versus connectivity", description: "Separate changes in regional response from changes in the relationship between regions." }, { title: "The three PPI terms", description: "Understand physiological, psychological, and interaction regressors." }] },
    { title: "Seed workflow", lessons: [{ title: "Creating an atlas-based seed", description: "Extract, binarize, and visually verify an anatomical region." }, { title: "Moving the seed to native space", description: "Apply the correct inverse transform and interpolation for a mask." }, { title: "Extracting the seed time series", description: "Use fslmeants and inspect the physiological regressor." }] },
    { title: "PPI in FEAT", lessons: [{ title: "Building the interaction term", description: "Combine centered psychological and physiological terms appropriately." }, { title: "PPI EVs and contrasts", description: "Configure the first-level model and interpret an interaction contrast." }] },
    { title: "Independent component analysis", lessons: [{ title: "What ICA estimates", description: "Understand spatially independent components as a data-driven decomposition." }, { title: "Interpreting components", description: "Use spatial pattern, time course, and frequency evidence to identify signal and artifact." }] },
  ]),
};

export const courses: Course[] = [
  foundationsCourse,
  preprocessingCourse,
  firstLevelCourse,
  higherLevelCourse,
  roiCourse,
  ppiIcaCourse,
];

export function getCourse(courseSlug: string): Course | undefined {
  return courses.find((course) => course.slug === courseSlug);
}

export function getLesson(courseSlug: string, lessonSlug: string): { course: Course; lesson: Lesson; module: CourseModule } | undefined {
  const course = getCourse(courseSlug);
  if (!course) return undefined;
  for (const courseModule of course.modules) {
    const lesson = courseModule.lessons.find((item) => item.slug === lessonSlug);
    if (lesson) return { course, lesson, module: courseModule };
  }
  return undefined;
}

export function getAllLessons(course: Course): Lesson[] {
  return course.modules.flatMap((module) => module.lessons);
}

export function getAdjacentLessons(course: Course, lessonSlug: string): { previous?: Lesson; next?: Lesson } {
  const lessons = getAllLessons(course);
  const index = lessons.findIndex((lesson) => lesson.slug === lessonSlug);
  return {
    previous: index > 0 ? lessons[index - 1] : undefined,
    next: index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : undefined,
  };
}

export function getLessonCount(course: Course): number {
  return getAllLessons(course).length;
}
