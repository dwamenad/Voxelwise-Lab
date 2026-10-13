# Motion Correction with MCFLIRT

## Head motion is signal's enemy

Participants inevitably move during an fMRI session. Because voxels are small, a shift of just one millimeter moves brain tissue across voxel boundaries, introducing massive non-neural variance. Motion correction with MCFLIRT aligns each acquired volume back to a common reference position.

## Six degrees of freedom

MCFLIRT uses a rigid-body transformation with six degrees of freedom: three spatial translations along the x, y, and z axes, and three rotations: pitch, roll, and yaw. Because the brain does not stretch or shear within a scan, higher degrees of freedom would be unphysical.

## Absolute versus relative motion

MCFLIRT outputs two critical displacement plots. Absolute displacement measures total drift from the reference volume across the entire run. Relative displacement, or framewise displacement, measures abrupt volume-to-volume jerks. Sudden spikes above half a voxel indicate potential spin-history artifacts requiring volume censoring.

## Motion correction rules

Always inspect both absolute and relative motion plots before statistical modeling. Realign to the middle volume, flag sudden jumps, and never apply spatial smoothing before motion estimation is complete.
