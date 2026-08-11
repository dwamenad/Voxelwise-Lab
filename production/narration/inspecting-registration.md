# Inspecting registration — narration

## 1. Review the intended mappings

This design aligns the functional run to the skull-stripped T1-weighted image using normal angular search and boundary-based registration. The structural image is then aligned to the MNI152 two-millimeter brain with normal search and 12 degrees of freedom. These settings describe the attempted transformations; the images determine whether they succeeded.

Open the Registration section of the FEAT report. Show the functional-to-structural boundary image first. Inspect several axial, coronal, and sagittal locations rather than a single central slice.

## 2. Check anatomical landmarks

Follow cortical boundaries around the brain. Compare ventricular contours, deep structures, cerebellum, and inferior frontal and temporal regions. Look for gross translation, rotation, scaling errors, left-right flips, distortion, and incomplete functional coverage.

Boundary-based registration can improve alignment by using tissue boundaries, but the presence of a transform matrix is only evidence that optimization finished. It is not a QC decision.

Next inspect structural-to-standard alignment. Compare outer cortical shape, ventricles, midline, and posterior fossa with the MNI reference. A global match can hide local disagreement, so move through multiple slices.

## 3. Confirm with overlays

Load the registered images and references in FSLEyes when the report montage is ambiguous. Change opacity or use edge overlays so mismatches are visible. Do not judge alignment from activation clusters; registration is evaluated from anatomical correspondence.

## 4. Record an explicit verdict

Finish with pass, concern, or fail, plus a reason. A pass names the landmarks inspected. A concern identifies a localized mismatch that needs review. A fail describes a problem such as a flip, large offset, incorrect reference, or unusable coverage and blocks downstream interpretation.

If registration fails, check the structural input, brain extraction, acquisition coverage, and selected method before changing parameters. Make one evidence-based correction and write to a new output. FEAT completing successfully is never used as the registration verdict.
