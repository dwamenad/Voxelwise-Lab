# Runs Versus Participants

## The hierarchy of variance

In functional neuroimaging, observations exist in a strict hierarchy. Volumes within a run share scanner noise and physiological rhythms. Runs within a subject share anatomy and personal traits. Participants within a study represent random draws from the broader population. You must never treat multiple runs from the same person as independent subjects.

## The unit of analysis fallacy

If you enter forty runs from ten participants directly into a group analysis, the model assumes forty independent human brains. This drastically inflates your degrees of freedom and creates severe false-positive rates. The correct approach is a two-stage summary: combine runs within each subject at level two, then test across subjects at level three.

## Hierarchical modeling rules

Always preserve the hierarchical structure of your dataset. Combine runs within participants before running group tests to ensure your statistical degrees of freedom reflect independent biological samples.
