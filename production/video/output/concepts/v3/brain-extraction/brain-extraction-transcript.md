# Brain Extraction with BET

## Stripping non-brain tissue

Before registering a high-resolution anatomical scan to a standard template, you must remove non-brain tissue. Scalp fat, muscle, eyes, and skull exhibit intense MRI contrast that confuses registration cost functions. FSL's Brain Extraction Tool, or BET, strips these structures.

## Tuning fractional intensity (-f)

BET inflates a tessellated deformable sphere outward from the brain center until it reaches brain edge gradients. The primary control parameter is fractional intensity threshold, specified with dash f. The default is 0.5. Smaller values like 0.3 keep more tissue; larger values like 0.7 peel deeper into the brain.

## Inspect sagittal and coronal limits

Always review skull-stripped outputs in FSLEyes before accepting them. Check the sagittal plane to verify that the cerebellum and brainstem are intact, and check the axial slices for orbital fat. Clipping genuine cortical gray matter will permanently erase your experimental activations.

## BET best practices

Start with fractional intensity 0.5, inspect the frontal pole and cerebellum in FSLEyes, and adjust dash f when necessary. Clean brain extraction is the foundation of accurate spatial normalization.
