@fused.udf
def udf(
    lat: float = -0.0917,
    lon: float = 34.7680,
    days_back: int = 45,
    max_items: int = 12,
):
    """Search Digital Earth Africa STAC for Sentinel-2 metadata near a Kenya point.

    Returns catalogue metadata only; it does not download satellite imagery.
    The default point is in Kisumu, Kenya, avoiding the old invalid (0, 0) default.
    """
    import requests
    import pandas as pd
    from datetime import datetime, timedelta, timezone

    lat, lon = float(lat), float(lon)
    if not (-5.2 <= lat <= 5.2 and 33.5 <= lon <= 42.5):
        raise ValueError(
            f"Coordinates outside the Kenya screening envelope: lat={lat}, lon={lon}. "
            "Use latitude first and longitude second; e.g. -0.0917, 34.7680."
        )
    days_back = max(7, min(int(days_back), 365))
    max_items = max(1, min(int(max_items), 50))
    endpoint = "https://explorer.digitalearth.africa/stac/search"
    end = datetime.now(timezone.utc)
    start = end - timedelta(days=days_back)
    body = {
        "intersects": {"type": "Point", "coordinates": [lon, lat]},
        "datetime": f"{start.isoformat()}/{end.isoformat()}",
        "limit": max_items,
        "query": {"eo:cloud_cover": {"lt": 60}},
    }

    # Collection identifiers can vary between catalogue deployments. Try the
    # commonly used ID first, then retry without a collection constraint.
    attempts = [dict(body, collections=["sentinel-2-l2a"]), body]
    last_error = None
    payload = None
    for request_body in attempts:
        try:
            response = requests.post(endpoint, json=request_body, timeout=60,
                                     headers={"Accept": "application/geo+json, application/json"})
            if response.status_code in (400, 404) and "collections" in request_body:
                last_error = f"Collection filter not accepted (HTTP {response.status_code}); retrying without it."
                continue
            response.raise_for_status()
            payload = response.json()
            break
        except requests.RequestException as exc:
            last_error = str(exc)
            if "collections" not in request_body:
                raise RuntimeError(f"Digital Earth Africa STAC request failed: {last_error}")
    if payload is None:
        raise RuntimeError(f"Digital Earth Africa STAC search failed: {last_error or 'No response'}")

    rows = []
    for item in payload.get("features", []) or []:
        props = item.get("properties") or {}
        links = item.get("links") or []
        self_link = next((x.get("href") for x in links if x.get("rel") == "self"), None)
        rows.append({
            "id": item.get("id"),
            "collection": item.get("collection"),
            "datetime": props.get("datetime"),
            "cloud_cover_pct": props.get("eo:cloud_cover"),
            "platform": props.get("platform"),
            "instrument": props.get("instruments"),
            "item_url": self_link,
            "latitude": lat,
            "longitude": lon,
            "catalog": "Digital Earth Africa STAC",
        })
    return pd.DataFrame(rows, columns=[
        "id", "collection", "datetime", "cloud_cover_pct", "platform",
        "instrument", "item_url", "latitude", "longitude", "catalog"
    ])
