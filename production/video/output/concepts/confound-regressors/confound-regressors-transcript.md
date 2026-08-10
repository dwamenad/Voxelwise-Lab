# Confound regressors

## Confound regressors

Confound regressors. Model nuisance variation without treating it as the effect of interest. The goal is clear: Explain why and how nuisance regressors enter a first-level design.

## Confound regressors

Confound regressors. Confound regressors capture structured variation—such as motion—that is not the experimental effect of interest. They reduce bias when specified appropriately, but they do not automatically repair poor data. Motion estimates, non-steady-state volumes, physiological terms, or fMRIPrep confounds may be used according to a documented strategy. Check column count, missing values, and time points. A confound file must have one row per modeled volume.

## Try this in Neurodesk

Now connect the idea to an observable check. First, find the number of bold volumes. Next, count rows and columns in the confound file. Then, confirm there are no text headers if FEAT expects numeric input. After that, document why each column is included. The command shown on screen is an example. Adapt its path to your own working directory and verify the target before running it.

## What would make this interpretation trustworthy?

Quality control comes before interpretation. The bold series and confound file have the same number of time points. A useful self-check is this: In one or two sentences, what decision does “Confound regressors” support? Explain why and how nuisance regressors enter a first-level design.

## Carry the reasoning into the next step

To recap: First, model nuisance variation without treating it as the effect of interest. Next, document the decision and inspect the corresponding input or output. Before continuing, make sure you can explain this objective: Explain why and how nuisance regressors enter a first-level design.

---

Source: tubric/2026s-fmri-class, Lab-3_Supplement.md, Supplement — extract basic confounds; MIT License.
