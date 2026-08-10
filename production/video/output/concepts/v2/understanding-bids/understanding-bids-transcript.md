# Understanding BIDS

## Structure is part of the data

The Brain Imaging Data Structure, or BIDS, uses predictable folders and filename entities. Those labels tell people and software which participant, session, task, run, and modality a file represents. The structure reduces ambiguity and makes automated workflows safer.

## Entities answer specific questions

Read a BIDS filename as a sequence of questions. Sub identifies the participant label. Task identifies the paradigm. Run distinguishes repeated acquisitions. The suffix, such as bold or T one w, identifies the data type. Underscores separate entities; hyphens separate keys from values.

## Image, events, metadata

A functional NIfTI does not stand alone. Its matching events table describes what happened during the run, and the JSON sidecar records acquisition metadata. Shared entities in the filenames let you connect those files without relying on memory.

## Identifiers do not belong in filenames

BIDS structure supports responsible sharing only when participant labels are de-identified. Do not place names, medical-record numbers, or other direct identifiers in filenames. Brain images may also require defacing and institutional review before they are shared.

## Let the name explain the file

BIDS makes file identity explicit. Decode the entities, follow shared labels across images, events, and metadata, and protect participant identity. Good structure is not cosmetic; it is part of reproducible and responsible analysis.
