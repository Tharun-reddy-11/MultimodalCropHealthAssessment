# Dataset layout and guardrails

This folder contains data supplied with the project. The original directories are preserved:

- `MangoLeafBD Dataset/` — directory-labelled leaf images; usable for image-only classification after inspection.
- `MH-SoyaHealthVision/` and `PlantDoc/` — source parquet shards; inspect their documented schema before extracting or training.

`reports/` is generated locally by the inspection utility. Future real paired observations should be placed in a documented `paired_multimodal/` directory with image ID, sensor timestamp, feature units, provenance, consent/retention controls, and health label. Do not join arbitrary weather values to these images or report synthetic data as greenhouse measurements.
