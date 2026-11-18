# Fused Workbench UDFs — corrected package

Create three separate Python UDFs. Paste one complete file into each editor and keep the decorated entrypoint named `udf`.

1. `crop_weather_intelligence.py` — Open-Meteo daily weather and transparent screening score.
2. `deafrica_stac_search.py` — Digital Earth Africa STAC Sentinel-2 metadata search.
3. `crop_calendar_reference.py` — regional crop-calendar rows.

**Important correction:** the old weather and STAC UDFs defaulted to `lat=0.0, lon=0.0`. That point is in the Gulf of Guinea, not Kenya, so pressing Run without changing inputs always raised `Coordinates must be within the Kenya bounding area.` The corrected defaults are `lat=-0.0917`, `lon=34.7680` (Kisumu), which are inside the configured Kenya screening envelope. The dashboard already uses these same defaults.

For a manual test, use latitude `-0.0917` and longitude `34.7680`. Latitude comes first; STAC GeoJSON point coordinates are correctly sent as `[longitude, latitude]` inside the UDF.

The Kenya envelope is a rectangular input guard, not an official Kenya boundary polygon. The weather score is an indicative screening heuristic, not an agronomic recommendation. STAC returns metadata only; it does not download imagery or calculate vegetation indices.
