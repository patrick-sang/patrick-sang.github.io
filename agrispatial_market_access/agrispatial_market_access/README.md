# AgriSpatial Kenya — Market Accessibility Embeddings

A static, browser-first agricultural market accessibility explorer. It uses DuckDB-WASM from a CDN for CSV ingestion and SQL querying, Leaflet for mapping, and vanilla JavaScript for embedding construction, cosine similarity and K-means clustering.

## Run it

Because the browser loads a local CSV file, use a static HTTP server rather than opening `index.html` with `file://`.

### Option 1: VS Code
1. Open this folder in VS Code.
2. Install the Live Server extension.
3. Right-click `index.html` → **Open with Live Server**.

### Option 2: Python's built-in static server
If Python is already installed, run this command inside the project folder:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

No Python application/backend is used. Python here is only an optional static-file server for local development.

### Option 3: GitHub Pages
1. Create a GitHub repository.
2. Upload the contents of this folder to the repository root.
3. In **Settings → Pages**, deploy from the `main` branch and `/ (root)`.
4. Open the published Pages URL.

## CDN dependencies

- DuckDB-WASM `@duckdb/duckdb-wasm@1.29.0` via jsDelivr ESM CDN.
- Leaflet 1.9.4 via unpkg.
- OpenStreetMap tiles.
- Google Fonts (DM Sans and Manrope).

An internet connection is required to load the CDN libraries, map tiles and fonts.

## CSV schema

Uploaded CSV files must include these exact column names:

| Column | Meaning | Example |
|---|---|---|
| `site_id` | Unique production-zone ID | `S001` |
| `site_name` | Location name | `Kitale West` |
| `county` | Kenyan county | `Trans Nzoia` |
| `latitude` | WGS84 latitude | `1.015` |
| `longitude` | WGS84 longitude | `35.006` |
| `production_tonnes` | Production estimate | `18500` |
| `road_distance_km` | Road access distance indicator | `3.2` |
| `market_distance_km` | Distance to market indicator | `8.5` |
| `storage_distance_km` | Distance to storage indicator | `12` |
| `market_demand_tonnes` | Market demand estimate | `42000` |
| `transport_cost_kes_per_tonne_km` | Transport-cost indicator | `18` |
| `primary_crop` | Main crop / activity | `Maize` |

Rows should use numeric values for coordinates and numeric indicators. The application validates the required columns and coordinates.

## How the embeddings work

Each production zone receives a six-dimensional vector:

1. Market proximity (inverse normalized market distance)
2. Storage access (inverse normalized storage distance)
3. Road connectivity (inverse normalized road-distance indicator)
4. Market demand (normalized demand)
5. Transport affordability (inverse normalized transport-cost indicator)
6. Production scale (normalized production)

For each feature, min-max normalization is applied across the currently loaded dataset. The first five dimensions are not probabilities; they are relative indicators. The weighted accessibility index uses weights of 0.25, 0.20, 0.15, 0.15, 0.15 and 0.10 respectively.

Similarity is cosine similarity between vectors. K-means uses Euclidean distance in the six-dimensional normalized embedding space.

## Important interpretation notes

- The included CSV contains **illustrative demonstration values**, not verified official Kenyan agricultural statistics.
- The sample market and storage nodes are illustrative map reference points. The current prototype does not compute road-network routes or live road distances.
- The sample CSV's market and storage distance fields are input indicators. Replace them with measured road-network distances or sourced logistics data for real analysis.
- Min-max normalization is relative to the dataset currently loaded. Scores can change when the dataset changes.
- A high similarity score means the selected indicators have similar relative profiles; it does not prove that the sites are interchangeable.
- The accessibility index is a transparent prototype index, not a validated national standard.
- For a production deployment, document data sources, dates, units, uncertainty and licensing. Validate with field data and actual road-network travel costs.

## Current features

- DuckDB-WASM loads the CSV into a DuckDB table and queries it in-browser.
- County filtering.
- Leaflet production-zone and market/storage-node map.
- Six-dimensional spatial embedding generation.
- Cosine similarity search.
- K-means clustering.
- Location profile panel.
- CSV and GeoJSON export.
- User CSV upload without sending it to a server.

## Future upgrades

- Replace distance indicators with OSRM / OpenRouteService / routing-network travel times.
- Load official market, warehouse and production datasets.
- Add crop-specific embedding profiles.
- Add temporal embeddings for seasonality.
- Add HDBSCAN or DBSCAN and cluster diagnostics.
- Persist user datasets locally with IndexedDB.
- Add vector indexing for very large datasets.
