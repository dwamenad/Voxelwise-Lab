# The HRF and convolution

## The blood response arrives late

Neural events are fast, but the BOLD response is delayed and smooth. The hemodynamic response function, or HRF, approximates that response shape. Convolution combines event timing with the HRF to create a predictor that the GLM can compare with measured BOLD signal.

## Apply the response at every event

Imagine placing a copy of the HRF at every event onset. Each copy is scaled by the event amplitude, shifted in time, and added to the others. The result is a continuous predictor. Closely spaced events produce overlapping responses, which is why timing affects estimation.

## Rise, peak, fall, undershoot

A canonical response begins rising after roughly two seconds, peaks near five seconds, and may show a later undershoot. Those numbers are useful approximations, not universal constants. The HRF models vascular dynamics associated with neural activity; it is not the neural event itself.

## Real HRFs vary

The canonical HRF is a practical model, but real responses vary across participants and regions. Basis functions or finite impulse response models can represent some variation. The appropriate choice depends on the hypothesis, design, and available data.

## Timing becomes a BOLD prediction

Convolution translates event timing into an expected BOLD pattern by applying the HRF at each event. Read the predictor as a model of delayed vascular response, and keep biological variability and design overlap in mind when interpreting the fit.
