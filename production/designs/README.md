# Reusable FEAT designs

These FSL 6.0.7.22 design files are production checkpoints for the live Neurodesk walkthroughs. They are adapted from the official FSL 6.0 first-level `design.fsf` format and populated with the verified course inputs in `../metadata/feat-run-specs.yaml`.

## Files

- `sequence-pilot.fsf`: ds005085/sub-10015 shared-reward model used in walkthroughs 2–12.
- `guided-capstone.fsf`: ds000157/sub-01 passive-image-viewing model used in walkthrough 13.

## Required validation

Run these commands inside the approved FSL 6.0.7.22 Neurodesk environment:

```bash
cd ~/Voxelwise-Walkthroughs/designs
feat_model sequence-pilot
feat_model guided-capstone
```

Both commands must create `.mat`, `.con`, `.png`, and `_cov.png` files without errors. Inspect each design image and verify EV names, timing shapes, and all contrast rows.

The corrected `sequence-pilot.fsf` completed a full Neurodesk FEAT run on 2026-08-11 with 515 output files, zero FEAT report error matches, all five cope/z-stat outputs, and visually checked registration and Left > Right activation renders. `guided-capstone.fsf` also completed with 530 output files, zero report error matches, both planned contrasts, and visually checked registration and Food > Nonfood activation. The full-run evidence and numeric ranges are recorded in `../metadata/feat-run-specs.yaml`.

Before a real run, load the `.fsf` through the FEAT GUI and visually verify every tab. This protects against path, environment, or FEAT-version changes that a text review may miss. Run to a new output path only after the GUI and design-matrix checks pass.

## Recording checkpoints

Use copies of these files for partial lesson states. Do not edit source imaging data or the validated timing files to demonstrate failures. Fault examples belong in `~/Voxelwise-Walkthroughs/fault-examples` and must be derived copies with visibly different filenames.

The Opening FEAT review video remains the gate for recording walkthroughs 2–13. Preparing or validating the designs does not waive that gate.
