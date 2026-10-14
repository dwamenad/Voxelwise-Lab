# Motion Correction with MCFLIRT

## Head motion is signal's enemy

Participants inevitably move during an fMRI session. Because voxels are small, a shift of just one millimeter moves brain tissue across voxel boundaries, introducing massive non-neural variance. Motion correction with MCFLIRT aligns each acquired volume back to a common reference position.

## Six degrees of freedom

MCFLIRT uses a rigid-body transformation with six degrees of freedom: three spatial translations along the x, y, and z axes, and three rotations: pitch, roll, and yaw. This models head movement, but cannot correct every susceptibility or spin-history artifact.

## Absolute versus relative motion

MCFLIRT reports absolute and relative root mean square displacement. Absolute displacement compares each volume with the reference; relative displacement compares neighboring volumes. These summaries differ from Power framewise displacement. Inspect spikes alongside image quality, and choose outlier regressors or exclusion criteria appropriate to your study.

## Motion correction rules

Always inspect both absolute and relative motion plots before statistical modeling. Realign to the middle volume, flag sudden jumps, and never apply spatial smoothing before motion estimation is complete.
