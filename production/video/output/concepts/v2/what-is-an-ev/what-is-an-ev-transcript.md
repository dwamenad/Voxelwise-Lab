# What is an explanatory variable?

## One column, one modeled pattern

An explanatory variable, or EV, is one modeled pattern in the design matrix. A task EV represents an experimental condition. A parametric EV represents graded trial values. A nuisance EV represents structured variation that is not the effect of interest.

## Columns are not interchangeable

The interpretation of an EV comes from how it was constructed and why it belongs in the model. A condition column asks about an average task effect. A parametric column asks whether response changes with a value. A motion column controls nuisance variation rather than testing the task.

## Verify order, timing, and dependence

Inspect the design matrix after EV construction. Confirm that each column has the expected timing and order. Look for near-duplicate patterns or strong correlation. When predictors overlap, each beta estimate describes a contribution after accounting for the other columns.

## Do not copy the stimulus list

A complex stimulus does not automatically require a column for every feature. Build the model around the hypothesized processes and comparisons. An EV is justified by the scientific question and design, not merely by the availability of a label.

## Every EV needs a reason

An EV is one hypothesized source of variation in the design matrix. Define what it represents, distinguish effects of interest from nuisance structure, and inspect its timing and relationship to other columns before interpreting beta estimates or contrasts.
