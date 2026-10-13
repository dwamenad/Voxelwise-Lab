# Fixed, Random, and Mixed Effects

## Scope of population inference

When combining data across participants, the choice between fixed and mixed effects determines the scope of your scientific claims. Fixed effects assumes that between-subject variance is zero, meaning conclusions apply strictly to the specific individuals scanned. Mixed effects models biological diversity, allowing you to generalize to the broader human population.

## Why FLAME models two variance sources

FSL's FLAME mixed-effects engine separates within-subject measurement noise from true between-subject variation. Rather than treating all subjects as equally reliable, FLAME weights each participant by the precision of their individual estimate. Subjects with clean data and small varcope carry more influence than noisy outliers.

## Model selection rules

Use fixed-effects modeling when combining runs within the same participant at level two, but always use FLAME mixed effects for group-level inference. This ensures your scientific claims accurately represent the general population.
