# Fixed, Random, and Mixed Effects

## Scope of population inference

When combining data across participants, the choice between fixed and mixed effects determines the scope of your scientific claims. Fixed effects assumes that between-subject variance is zero, meaning conclusions apply strictly to the specific individuals scanned. Mixed effects models biological diversity, allowing you to generalize to the broader human population.

## Why FLAME models two variance sources

FSL's FLAME mixed-effects engine separates within-subject measurement noise from true between-subject variation. Rather than treating all subjects as equally reliable, FLAME weights each participant by the precision of their individual estimate. Subjects with clean data and small varcope carry more influence than noisy outliers.

## Model selection rules

Fixed effects is commonly used to combine runs within a participant. Population inference needs a model that accounts for between-participant variation, such as FLAME mixed effects. Choose the method for your design and assumptions; fixed-effects results alone do not support population generalization.
