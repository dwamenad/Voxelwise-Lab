# What is a GLM?

## Explain signal with a design

The general linear model represents a measured BOLD time series as a weighted combination of predictors plus residual error. In compact form, Y equals X beta plus epsilon. FEAT fits this relationship separately at every voxel.

## Four parts, four meanings

Y is the observed BOLD time series. X is the design matrix containing task and nuisance predictors. Beta contains the fitted contribution of each column. Epsilon contains the remaining structure. Residuals are unexplained by the model; they are not automatically random or harmless.

## The design encodes the hypothesis

The design matrix is not a decorative preview. Its columns encode the model. Confirm the timing, identify task and nuisance regressors, and look for strong dependence between columns. Beta estimates are conditional on all the other predictors in X.

## A fit can answer the wrong question

A GLM can fit successfully and still answer the wrong scientific question. The model should follow the hypothesis about underlying processes, not merely every stimulus label. Nuisance structure must be addressed, and residual patterns should be inspected rather than dismissed as noise.

## The model makes assumptions visible

The fMRI GLM separates measured data, modeled predictors, fitted estimates, and residuals. Read those parts distinctly, inspect the design before the results, and remember that a successful fit only supports claims represented by the model.
