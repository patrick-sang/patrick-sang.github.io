@fused.udf
def udf(
    lat: float = -0.0917,
    lon: float = 34.7680,
    timezone: str = "Africa/Nairobi",
    forecast_days: int = 14,
):
    """Return recent and forecast daily weather plus an indicative planting-screening score.

    Defaults are a valid point in Kenya (Kisumu), so running the UDF with its
    default parameters does not trigger the former 0,0 coordinate error.
    """
    import requests
    import pandas as pd
    from datetime import datetime, timezone as dt_timezone

    lat, lon = float(lat), float(lon)
    # Kenya-wide rectangular screening envelope; this is not an administrative boundary.
    if not (-5.2 <= lat <= 5.2 and 33.5 <= lon <= 42.5):
        raise ValueError(
            f"Coordinates outside the Kenya screening envelope: lat={lat}, lon={lon}. "
            "Pass latitude and longitude separately (latitude first); e.g. lat=-0.0917, lon=34.7680."
        )
    forecast_days = max(1, min(int(forecast_days), 16))
    allowed_timezones = {"Africa/Nairobi", "UTC"}
    if timezone not in allowed_timezones:
        timezone = "Africa/Nairobi"

    params = {
        "latitude": lat,
        "longitude": lon,
        "timezone": timezone,
        "past_days": 7,
        "forecast_days": forecast_days,
        "daily": ",".join([
            "precipitation_sum", "precipitation_probability_max",
            "temperature_2m_max", "temperature_2m_min",
            "et0_fao_evapotranspiration", "soil_moisture_0_to_7cm_mean"
        ])
    }
    response = requests.get("https://api.open-meteo.com/v1/forecast", params=params, timeout=45)
    response.raise_for_status()
    payload = response.json()
    daily = payload.get("daily") or {}
    dates = daily.get("time") or []
    if not dates:
        raise RuntimeError("Open-Meteo returned no daily values. Check the coordinates and try again.")

    def values(key):
        vals = daily.get(key)
        if not isinstance(vals, list):
            return [None] * len(dates)
        return (vals + [None] * len(dates))[:len(dates)]

    df = pd.DataFrame({
        "date": dates,
        "precipitation_mm": values("precipitation_sum"),
        "precipitation_probability_pct": values("precipitation_probability_max"),
        "temperature_max_c": values("temperature_2m_max"),
        "temperature_min_c": values("temperature_2m_min"),
        "et0_mm": values("et0_fao_evapotranspiration"),
        "soil_moisture_0_7cm": values("soil_moisture_0_to_7cm_mean"),
    })
    numeric = ["precipitation_mm", "precipitation_probability_pct", "temperature_max_c",
               "temperature_min_c", "et0_mm", "soil_moisture_0_7cm"]
    for col in numeric:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df["rain_7d_mm"] = df["precipitation_mm"].rolling(7, min_periods=1).sum()
    rain_score = (df["rain_7d_mm"].fillna(0) / 25.0 * 55).clip(0, 55)
    moisture = df["soil_moisture_0_7cm"].fillna(0.20)
    moisture_score = ((moisture - 0.10) / 0.20 * 30).clip(0, 30)
    probability_score = (df["precipitation_probability_pct"].fillna(0) / 100 * 15).clip(0, 15)
    df["planting_conditions_score"] = (rain_score + moisture_score + probability_score).round(1)
    df["assessment"] = pd.cut(
        df["planting_conditions_score"], bins=[-1, 25, 50, 75, 100],
        labels=["Low signal", "Watch", "Moderate signal", "Favourable signal"]
    ).astype(str)
    today = datetime.now().strftime("%Y-%m-%d")
    df["data_period"] = ["Recent" if str(d) < today else "Forecast" for d in df["date"]]
    df["latitude"], df["longitude"], df["timezone"] = lat, lon, timezone
    df["source"] = "Open-Meteo Forecast API"
    df["generated_at_utc"] = datetime.now(dt_timezone.utc).isoformat()
    return df
