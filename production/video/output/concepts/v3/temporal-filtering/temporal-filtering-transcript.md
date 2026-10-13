# Temporal Filtering

## Removing slow scanner drift

Over the course of an fMRI run, heating in the magnet gradients and subtle participant physiological shifts cause slow, monotonic changes in baseline signal. High-pass temporal filtering removes these low-frequency trends so they do not contaminate experimental regressors.

## Choose a design-aware cutoff

Choose the high-pass cutoff from your experimental design. For simple block designs, the full task and rest cycle is a useful starting point. Event-related designs need closer evaluation. Use FEAT high-pass estimation and inspect the filtered design to assess how much expected task signal remains.

## The danger of aggressive filtering

A short cutoff can remove task-related variation along with drift; a long cutoff may leave more low-frequency noise. FEAT applies the same temporal filtering to the model and data. Check signal retention and residuals instead of relying on a universal cutoff rule.

## Temporal filtering rules

High-pass temporal filtering removes scanner drift while preserving experimental BOLD signal. Choose the cutoff using the design, apply consistent filtering to data and model, and review expected signal retention in FEAT.
