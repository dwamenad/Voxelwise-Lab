# Temporal Filtering

## Removing slow scanner drift

Over the course of an fMRI run, heating in the magnet gradients and subtle participant physiological shifts cause slow, monotonic changes in baseline signal. High-pass temporal filtering removes these low-frequency trends so they do not contaminate experimental regressors.

## The 2× cycle length rule

Setting the high-pass filter cutoff requires balancing drift removal against preserving task signal. The golden rule is: cutoff must be at least twice the duration of the longest experimental cycle. For a block design with thirty seconds on and thirty seconds off, the cycle is sixty seconds, requiring a cutoff of at least one hundred and twenty seconds.

## The danger of aggressive filtering

If you set your cutoff too short, the filter cannot distinguish scanner drift from the hemodynamic response of your task. It will filter out your experimental effect entirely. When in doubt, err on the side of a longer cutoff; residual drift can still be captured by linear trend regressors.

## Temporal filtering rules

High-pass temporal filtering removes scanner drift while preserving experimental BOLD signal. Always calculate your cutoff from the longest task cycle, and verify that the design matrix in FEAT shows no filter attenuation.
