@fused.udf
def udf(crop: str = "maize", region: str = "western_nyanza_medium"):
    """Return indicative crop calendar rows for a Kenyan crop and agroecological region."""
    import pandas as pd

    # Month numbers are indicative planning windows, not farm-level prescriptions.
    calendars = {
        "maize": {
            "western_nyanza_medium": [("Long rains", "Planting", 2, 3), ("Long rains", "Vegetative / reproductive", 3, 6), ("Long rains", "Ripening / harvest", 7, 8), ("Short rains", "Planting", 9, 10), ("Short rains", "Harvest", 12, 1)],
            "north_rift_unimodal": [("Long rains", "Planting", 3, 4), ("Long rains", "Harvest", 11, 12)],
            "eastern_coast": [("Long rains", "Planting", 3, 4), ("Long rains", "Harvest", 7, 8), ("Short rains", "Planting", 10, 11), ("Short rains", "Harvest", 2, 3)],
            "central_rift": [("Long rains", "Planting", 3, 4), ("Long rains", "Harvest", 10, 12), ("Short rains", "Planting", 9, 10), ("Short rains", "Harvest", 1, 2)],
            "north_eastern_arid": [("Long rains", "Planting", 3, 4), ("Long rains", "Harvest", 7, 9), ("Short rains", "Planting", 10, 11), ("Short rains", "Harvest", 1, 3)],
        },
        "beans": {
            "western_nyanza_medium": [("Long rains", "Planting", 3, 4), ("Long rains", "Harvest", 7, 9), ("Short rains", "Planting", 9, 10), ("Short rains", "Harvest", 12, 1)],
            "north_rift_unimodal": [("Long rains", "Planting", 3, 4), ("Long rains", "Harvest", 8, 10)],
            "eastern_coast": [("Long rains", "Planting", 3, 4), ("Long rains", "Harvest", 7, 9), ("Short rains", "Planting", 10, 11), ("Short rains", "Harvest", 2, 3)],
            "central_rift": [("Long rains", "Planting", 3, 4), ("Long rains", "Harvest", 8, 10)],
            "north_eastern_arid": [("Long rains", "Planting", 3, 4), ("Long rains", "Harvest", 7, 9)],
        },
        "sorghum": {
            "western_nyanza_medium": [("Long rains", "Planting", 3, 4), ("Long rains", "Harvest", 8, 10), ("Short rains", "Planting", 9, 10), ("Short rains", "Harvest", 12, 1)],
            "eastern_coast": [("Long rains", "Planting", 3, 4), ("Long rains", "Harvest", 8, 10), ("Short rains", "Planting", 10, 11), ("Short rains", "Harvest", 2, 3)],
            "north_eastern_arid": [("Long rains", "Planting", 3, 4), ("Long rains", "Harvest", 8, 10), ("Short rains", "Planting", 10, 11), ("Short rains", "Harvest", 2, 3)],
        },
        "millet": {
            "western_nyanza_medium": [("Long rains", "Planting", 3, 4), ("Long rains", "Harvest", 8, 10), ("Short rains", "Planting", 9, 10), ("Short rains", "Harvest", 12, 1)],
            "eastern_coast": [("Long rains", "Planting", 3, 4), ("Long rains", "Harvest", 8, 10), ("Short rains", "Planting", 10, 11), ("Short rains", "Harvest", 2, 3)],
            "north_eastern_arid": [("Long rains", "Planting", 3, 4), ("Long rains", "Harvest", 2, 3)],
        },
    }
    notes = {
        "maize": "Western/Nyanza stages are based on the supplied regional calendar; other windows are broad seasonal patterns and need local confirmation.",
        "beans": "Indicative regional windows only; variety and local rainfall determine actual timing.",
        "sorghum": "Broad planning windows; verify locally before use.",
        "millet": "Broad planning windows; verify locally before use.",
    }
    crop, region = str(crop).strip().lower(), str(region).strip().lower()
    if crop not in calendars:
        raise ValueError("Unknown crop. Choose maize, beans, sorghum or millet.")
    if region not in {"western_nyanza_medium", "north_rift_unimodal", "eastern_coast", "central_rift", "north_eastern_arid"}:
        raise ValueError("Unknown region. Choose one of the five configured Kenyan agroecological regions.")
    rows = calendars[crop].get(region, [])
    return pd.DataFrame([
        {"crop": crop, "region": region, "season": season, "stage": stage,
         "start_month": start, "end_month": end, "source_note": notes[crop],
         "calendar_status": "Indicative — validate locally"}
        for season, stage, start, end in rows
    ], columns=["crop", "region", "season", "stage", "start_month", "end_month", "source_note", "calendar_status"])
