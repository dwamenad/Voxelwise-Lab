# What is a GLM?

## What is a GLM?

What is a G L M? Understand the model that relates expected task responses and confounds to the bold signal. The goal is clear: Explain the response, predictors, parameter estimates, and residuals in an functional M R I G L M.

## What is a GLM?

What is a G L M? The general linear model represents the measured bold time series as a weighted combination of explanatory variables plus unexplained residual error. FEAT fits this model separately at each voxel while accounting for temporal structure. The design matrix contains one row per time point and columns for task predictors and nuisance regressors. Parameter estimates describe each column's contribution. A good-looking activation map cannot rescue a design matrix that does not represent the experiment.

## Try this in Neurodesk

Now connect the idea to an observable check. First, write the model as Y = Xβ + ε. Next, label Y, X, β, and ε in plain language. Then, name one task predictor and one nuisance predictor for your study. Record what you observe so the decision remains reviewable.

## What would make this interpretation trustworthy?

Quality control comes before interpretation. Y is observed bold signal, X is the design matrix, β contains parameter estimates, and ε contains residual error. A useful self-check is this: In one or two sentences, what decision does “What is a G L M?” support? Explain the response, predictors, parameter estimates, and residuals in an functional M R I G L M.

## Carry the reasoning into the next step

To recap: First, understand the model that relates expected task responses and confounds to the bold signal. Next, document the decision and inspect the corresponding input or output. Before continuing, make sure you can explain this objective: Explain the response, predictors, parameter estimates, and residuals in an functional M R I G L M.

---

Source: tubric/2026s-fmri-class, Lab-3_FSL_Level1.md, Stats tab — EVs and contrasts; MIT License.
