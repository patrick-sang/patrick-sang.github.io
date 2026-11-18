# Kenya Crop Calendar Intelligence WebGIS

A responsive static HTML/CSS/JavaScript Leaflet dashboard connected to three Fused Workbench UDFs:

- `crop_weather_intelligence` — recent seven-day weather plus forecast, Open-Meteo daily variables and an explainable planting-condition screening score.
- `deafrica_stac_search` — recent Sentinel-2 catalogue metadata from Digital Earth Africa STAC.
- `crop_calendar_reference` — indicative crop-calendar windows for maize, beans, sorghum and millet across five broad Kenyan agroecological regions.

The interface includes county and crop selectors, seasonal windows, map click/drag point selection, rainfall chart, weather table and STAC observation discovery. It can also run in preview mode without published Fused endpoints.

## 1. Corrected coordinate defaults

The previous UDF versions used `lat=0.0` and `lon=0.0` as defaults. That is outside Kenya, so a default Run in Workbench immediately raised `ValueError: Coordinates must be within the Kenya bounding area.`

This package fixes both weather and STAC defaults to a valid Kenya point near Kisumu:

- Latitude: `-0.0917`
- Longitude: `34.7680`

The UDFs accept latitude and longitude as separate parameters. Do not reverse them. In GeoJSON/STAC geometry, the internal coordinate array is `[longitude, latitude]` as required by GeoJSON.

The input guard uses an approximate Kenya rectangular envelope (`latitude -5.2 to 5.2`, `longitude 33.5 to 42.5`). It is not a national boundary polygon and should not be used as one.

## 2. Create the Fused Workbench canvas and UDFs

1. Open Fused Workbench and create a Canvas named **Kenya Crop Calendar Intelligence**.
2. Create a UDF named `crop_weather_intelligence`.
3. Open `fused_udfs/crop_weather_intelligence.py`, copy the entire file and paste it into the UDF editor. Keep `@fused.udf` and `def udf(...)` unchanged.
4. Save and run it with the defaults. It should use the Kisumu coordinates and return a daily table. If Workbench displays parameter controls, use `lat=-0.0917`, `lon=34.7680`.
5. Create a second UDF named `deafrica_stac_search`; paste the complete `fused_udfs/deafrica_stac_search.py` file. Save and run with defaults. It returns recent STAC item metadata; zero results can be normal for a cloudy date window or point.
6. Create a third UDF named `crop_calendar_reference`; paste `fused_udfs/crop_calendar_reference.py`. Save and run with defaults (`crop=maize`, `region=western_nyanza_medium`).
7. Workbench supplies the `fused` module. Do not add a pip install for `fused`.

If an editor retains old parameter values, reset them or explicitly enter the values above. The defaults in the corrected code are valid, but an old saved run configuration may still submit old values.

## 3. Publish the UDF endpoints

1. Use the UDF share/publish controls in Fused Workbench.
2. Copy the JSON endpoint for `crop_weather_intelligence` and `deafrica_stac_search`.
3. If the dashboard is public, configure public endpoint access only for data you are comfortable exposing. Do not put private credentials or API tokens in frontend code.
4. Keep the UDF names stable after publishing because the endpoint path uses the UDF name.

## 4. Connect the dashboard

Open `assets/app.js` and find:

```js
const CONFIG = { weatherEndpoint:"", stacEndpoint:"" };
```

Paste your actual published endpoints:

```js
const CONFIG = {
  weatherEndpoint: "https://udf.ai/fc_YOUR_CANVAS_TOKEN/crop_weather_intelligence.json",
  stacEndpoint: "https://udf.ai/fc_YOUR_CANVAS_TOKEN/deafrica_stac_search.json"
};
```

Replace the example token with the real endpoint path copied from Fused. Do not copy the placeholder literally. The calendar JSON is bundled locally in `data/crop_calendars.json`; the calendar UDF can be run independently when dynamic calendar retrieval is needed.

## 5. Run the website

Serve the project folder with a local static server (rather than opening the HTML as a `file://` URL):

```bash
python -m http.server 8000
```

Open `http://localhost:8000`. Select a county, crop, season and region, then choose **Run seasonal analysis**. Click or drag the map marker to move the analysis point. Use **Search STAC** to find catalogue observations.

If endpoints are not configured, the dashboard uses its direct Open-Meteo/STAC preview paths where browser CORS/network policy permits. For deployment, the Fused endpoints are the intended backend.

## 6. Deploy with GitHub Pages

1. Create a repository, e.g. `kenya-crop-calendar-intelligence`.
2. Upload `index.html`, `assets/`, `data/`, and optionally `fused_udfs/` plus this README.
3. In repository Settings → Pages, select deployment from the main branch and root folder.
4. Wait for GitHub Pages to publish the site.

GitHub Pages serves the static frontend and calendar JSON. The Python UDF files are pasted into Fused Workbench; GitHub Pages does not execute them.

## 7. Data interpretation and limitations

The planting-condition score combines rolling seven-day precipitation (up to 55 points), shallow soil-moisture estimate (up to 30 points) and maximum daily precipitation probability (up to 15 points). It is a transparent first-pass screening heuristic, not a validated crop model, soil test, or agronomic recommendation. Open-Meteo soil moisture is modelled data, not a farm measurement. Calibrate thresholds by crop, soil, agroecological zone and local extension advice.

Crop-calendar windows are indicative regional planning windows. They vary with elevation, rainfall onset, variety and local practice. Validate them with county agricultural officers and farmer calendars before operational decisions. Some crop/region combinations intentionally return no rows where no defensible window was included in the supplied reference data.

The STAC UDF searches catalogue metadata only. It does not download Sentinel-2 assets or compute NDVI/EVI. A successful search can return an empty table if no matching acquisitions meet the date/cloud filters.

## 8. Sources

- Open-Meteo Forecast API: https://open-meteo.com/en/docs
- Digital Earth Africa STAC: https://explorer.digitalearth.africa/stac/
- Digital Earth Africa direct access documentation: https://docs.digitalearthafrica.org/en/latest/platform_tools/direct_access.html
- Fused UDF basics: https://docs.fused.io/guide/getting-started/first-udf-basics/
- Fused shared UDF endpoints: https://docs.fused.io/guide/data-input-outputs/export-api/tokens-endpoints/
- FEWS NET Kenya Data Book: https://help.fews.net/fde/v3/kenya-country-book
- FAO GIEWS Kenya Country Brief / crop calendar: https://www.fao.org/giews/countrybrief/country/KEN/pdf/KEN.pdf
- Kenya Western Region planting calendar: https://unctad.org/system/files/non-official-document/cw070823_p04_Kenya.pdf
