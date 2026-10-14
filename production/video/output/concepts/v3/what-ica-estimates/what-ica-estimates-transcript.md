# What ICA Estimates with MELODIC

## Blind signal separation with MELODIC

While the general linear model requires a predefined model of experimental timing, Independent Component Analysis, or ICA, is entirely data-driven. FSL's MELODIC tool separates four-dimensional fMRI data into a set of spatially independent component maps, each paired with its own time course.

## Spatial independence across networks

Spatial ICA assumes that the brain signal is a mixture of spatial sources that fluctuate over time. Statistical independence does not require their maps to be spatially non-overlapping. MELODIC estimates components whose spatial patterns are as statistically independent as possible. Components may reflect neural activity, motion, or physiological artifacts. Inspect their spatial maps, time courses, and spectra before classifying them.

## ICA principles

MELODIC spatial ICA provides a powerful, hypothesis-free method to explore brain networks and isolate structured noise. It is the foundation of resting-state fMRI and automated artifact cleaning.
