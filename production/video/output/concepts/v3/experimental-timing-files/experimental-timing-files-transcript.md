# Experimental timing files

## Events become model input

Experimental timing files translate the task into model input. Each row states an onset in seconds, a duration in seconds, and an amplitude. Each condition usually receives its own file so the design can form a separate explanatory variable.

## Onset, duration, amplitude

The first column is onset measured from the start of the run. The second is duration. The third is amplitude, often one for a simple condition but variable for parametric designs. These values describe the neural-event model before convolution with the hemodynamic response.

## Timing must fit the run

Read each row against the event table. Confirm the units are seconds, not volumes. Check that onsets are nonnegative, durations are plausible, and no event extends beyond the run. Then plot or preview the resulting model rather than trusting the text file alone.

## Timing changes what you can estimate

Timing is part of experimental design, not file formatting. Blocked designs often provide strong detection power. Jittered event-related designs improve separation and estimation of individual events. Mixed designs can model sustained and transient effects. The best choice depends on the hypothesis and constraints.

## Timing encodes the experiment

A three-column file is a compact model of the experiment. Encode onset, duration, and amplitude accurately; validate the rows against the run; and remember that timing determines which effects the design can detect and estimate.
