# What first-level analysis means

## One participant, one run

A first-level analysis models one run from one participant. At every voxel, it compares the observed BOLD time series with predicted task and nuisance patterns. The resulting estimates belong to that run; they are not yet evidence about a population.

## Fit the design at every voxel

The design matrix describes expected patterns across the run. FEAT fits that same set of predictors separately to each voxel's measured time series. Beta estimates describe the fitted contribution of each column, and residuals contain structure the model did not explain.

## Columns must match the run

Before interpreting a first-level result, inspect the design matrix. Confirm that task columns match the run's timing, nuisance columns have the expected length, and contrasts point to the intended explanatory variables. A design from another run can fit without answering the correct question.

## A run is not a population

First-level results describe one run. Fixed-effects combinations can summarize multiple runs from a participant, but they still do not model population variability. Random-effects analysis uses variation across participants to support population-level inference.

## Keep the level explicit

First-level analysis fits one run from one participant at every voxel. Inspect the design and contrasts in that scope, then use appropriate higher-level models for within-subject combinations and population inference. Never let the image hide the level of analysis.
