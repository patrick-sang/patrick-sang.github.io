import * as duckdb from "https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.29.0/+esm";

const $ = (id) => document.getElementById(id);
const SAMPLE_URL = "./data/kenya_agri_access_sample.csv";
let db, conn, allRows=[], rows=[], markets=[], map, markersLayer, marketLayer, selectedId=null, similarIds=new Set(), clusterCount=4;
const MARKET_NODES = [
  {name:"Nairobi Wholesale Market",lat:-1.286,lon:36.817,type:"Wholesale market"},
  {name:"Eldoret Produce Market",lat:0.514,lon:35.269,type:"Wholesale market"},
  {name:"Kisumu Kibuye Market",lat:-0.102,lon:34.752,type:"Wholesale market"},
  {name:"Nakuru Wakulima Market",lat:-0.303,lon:36.080,type:"Wholesale market"},
  {name:"Mombasa Kongowea Market",lat:-4.043,lon:39.668,type:"Wholesale market"},
  {name:"Kitale Aggregation Centre",lat:1.015,lon:35.006,type:"Aggregation centre"},
  {name:"Mwea Rice Mill & Store",lat:-0.667,lon:37.350,type:"Storage / processing"},
  {name:"Meru Cold Storage",lat:0.050,lon:37.650,type:"Storage facility"},
  {name:"Nairobi Cold Chain Hub",lat:-1.292,lon:36.821,type:"Storage facility"},
  {name:"Kisumu Grain Store",lat:-0.091,lon:34.768,type:"Storage facility"}
];
const fmt = n => Number(n).toLocaleString("en-KE",{maximumFractionDigits:1});
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2600);}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

async function initDuckDB(){
  const bundles=duckdb.getJsDelivrBundles();
  const bundle=await duckdb.selectBundle(bundles);
  const worker=new Worker(URL.createObjectURL(new Blob([`importScripts("${bundle.mainWorker}");`],{type:"text/javascript"})));
  db=new duckdb.AsyncDuckDB(new duckdb.ConsoleLogger(),worker);
  await db.instantiate(bundle.mainModule,bundle.pthreadWorker);
  conn=await db.connect();
  $("engineStatus").textContent="DuckDB-WASM ready";
}
async function loadCsvText(csvText){
  const bytes=new TextEncoder().encode(csvText);
  try { await db.dropFile("agri_access.csv"); } catch (_) {}
  await db.registerFileBuffer("agri_access.csv",bytes);
  await conn.query("DROP TABLE IF EXISTS production_zones");
  await conn.query(`CREATE TABLE production_zones AS SELECT * FROM read_csv_auto('agri_access.csv', header=true, sample_size=-1)`);
  const result=await conn.query(`SELECT site_id, site_name, TRIM(county) county, CAST(latitude AS DOUBLE) latitude, CAST(longitude AS DOUBLE) longitude, CAST(production_tonnes AS DOUBLE) production_tonnes, CAST(road_distance_km AS DOUBLE) road_distance_km, CAST(market_distance_km AS DOUBLE) market_distance_km, CAST(storage_distance_km AS DOUBLE) storage_distance_km, CAST(market_demand_tonnes AS DOUBLE) market_demand_tonnes, CAST(transport_cost_kes_per_tonne_km AS DOUBLE) transport_cost, primary_crop FROM production_zones`);
  const raw=result.toArray().map(r=>Object.fromEntries(Object.entries(r).map(([k,v])=>[k,typeof v==="bigint"?Number(v):v])));
  validateRows(raw);
  allRows=raw.map(r=>({...r,market_demand_tonnes:+r.market_demand_tonnes,production_tonnes:+r.production_tonnes}));
  deriveEmbeddings();
  populateFilters();
  applyFilters();
  $("engineStatus").textContent="DuckDB-WASM ready · data queried locally";
  $("dataStatus").textContent="DATA LOADED";
}
function validateRows(data){
  if(!data.length)throw new Error("The CSV contains no rows.");
  const required=["site_id","site_name","county","latitude","longitude","production_tonnes","road_distance_km","market_distance_km","storage_distance_km","market_demand_tonnes","transport_cost_kes_per_tonne_km","primary_crop"];
  const missing=required.filter(k=>!(k in data[0]));
  if(missing.length)throw new Error("Missing required columns: "+missing.join(", "));
  for(const r of data){
    if(!Number.isFinite(+r.latitude)||!Number.isFinite(+r.longitude)||Math.abs(+r.latitude)>90||Math.abs(+r.longitude)>180)throw new Error("Invalid coordinates in "+r.site_id);
  }
}
// Accessibility embedding: normalized feature vector [market proximity, storage proximity,
// road access, demand-to-output signal, low transport friction, production scale].
function deriveEmbeddings(){
  const ranges={};
  const cols=["market_distance_km","storage_distance_km","road_distance_km","market_demand_tonnes","transport_cost","production_tonnes"];
  for(const c of cols){const vals=allRows.map(r=>+r[c]);ranges[c]={min:Math.min(...vals),max:Math.max(...vals)};}
  allRows=allRows.map(r=>{
    const norm=(c,invert=false)=>{const {min,max}=ranges[c];const v=max===min?0.5:(+r[c]-min)/(max-min);return +(invert?1-v:v).toFixed(5);};
    const embedding=[norm("market_distance_km",true),norm("storage_distance_km",true),norm("road_distance_km",true),norm("market_demand_tonnes"),norm("transport_cost",true),norm("production_tonnes")];
    const weights=[.25,.20,.15,.15,.15,.10];
    const accessScore=Math.round(embedding.reduce((s,v,i)=>s+v*weights[i],0)*100);
    return {...r,embedding,accessScore,cluster:1};
  });
}
function populateFilters(){
  const counties=[...new Set(allRows.map(r=>r.county))].sort();
  $("regionFilter").innerHTML='<option value="all">All regions</option>'+counties.map(c=>`<option>${escapeHtml(c)}</option>`).join("");
  $("referenceSite").innerHTML=allRows.map(r=>`<option value="${escapeHtml(r.site_id)}">${escapeHtml(r.site_name)} · ${escapeHtml(r.county)}</option>`).join("");
}
function applyFilters(){
  const c=$("regionFilter").value;
  rows=allRows.filter(r=>c==="all"||r.county===c);
  similarIds.clear();
  renderAll();
}
function distanceKm(a,b){const R=6371,rad=x=>x*Math.PI/180,dLat=rad(b.lat-a.latitude),dLon=rad(b.lon-a.longitude),lat1=rad(a.latitude),lat2=rad(b.lat);const h=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(h));}
function initMap(){
  map=L.map("map",{zoomControl:true}).setView([-.7,37.1],6);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
  markersLayer=L.layerGroup().addTo(map);marketLayer=L.layerGroup().addTo(map);
}
function renderMap(){
  markersLayer.clearLayers();marketLayer.clearLayers();
  rows.forEach(r=>{
    const color=similarIds.has(r.site_id)?"#7655c7":"#277d59";
    const icon=L.divIcon({className:"",html:`<div class="marker-dot" style="background:${color}"></div>`,iconSize:[14,14],iconAnchor:[7,7]});
    const marker=L.marker([r.latitude,r.longitude],{icon}).bindPopup(`<b>${escapeHtml(r.site_name)}</b><br>${escapeHtml(r.county)} · ${escapeHtml(r.primary_crop)}<br>Production: ${fmt(r.production_tonnes)} tonnes<br>Access index: ${r.accessScore}/100`);
    marker.on("click",()=>showProfile(r.site_id));marker.addTo(markersLayer);
  });
  MARKET_NODES.forEach(m=>L.marker([m.lat,m.lon],{icon:L.divIcon({className:"",html:'<div class="market-dot"></div>',iconSize:[12,12],iconAnchor:[6,6]})}).bindPopup(`<b>${escapeHtml(m.name)}</b><br>${m.type}`).addTo(marketLayer));
  $("mapCount").textContent=`${rows.length} production locations · ${MARKET_NODES.length} network nodes`;
}
function renderMetrics(){
  const avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0;
  $("mLocations").textContent=fmt(rows.length);$("heroLocations").textContent=fmt(allRows.length);$("heroMarkets").textContent=MARKET_NODES.length;
  $("mMarketDistance").textContent=fmt(avg(rows.map(r=>r.market_distance_km)))+" km";
  $("mStorageDistance").textContent=fmt(avg(rows.map(r=>r.storage_distance_km)))+" km";
  $("mAccess").textContent=Math.round(avg(rows.map(r=>r.accessScore)))+"/100";
}
function renderDimensions(){
  const names=["Market proximity","Storage access","Road connectivity","Market demand","Transport affordability","Production scale"];
  const avg=names.map((_,i)=>rows.length?rows.reduce((s,r)=>s+r.embedding[i],0)/rows.length:0);
  $("dimensionBars").innerHTML=names.map((n,i)=>`<div class="dimension-row"><span>${n}</span><div class="bar-track"><div class="bar-fill" style="width:${avg[i]*100}%"></div></div><b>${Math.round(avg[i]*100)}</b></div>`).join("");
}
function renderTable(){
  $("dataTable").innerHTML=rows.map(r=>`<tr><td>${escapeHtml(r.site_name)}</td><td>${escapeHtml(r.county)}</td><td>${fmt(r.production_tonnes)}</td><td>${fmt(r.market_distance_km)} km</td><td>${fmt(r.storage_distance_km)} km</td><td class="score">${r.accessScore}/100</td><td><span class="cluster-tag">Cluster ${r.cluster}</span></td></tr>`).join("");
}
function renderAll(){renderMetrics();renderDimensions();renderMap();renderTable();if(selectedId&&rows.some(r=>r.site_id===selectedId))showProfile(selectedId);}
function showProfile(id){
  const r=allRows.find(x=>x.site_id===id);if(!r)return;selectedId=id;
  $("profileTitle").textContent=r.site_name;
  $("profileContent").innerHTML=`<div class="profile-grid">
    <div class="profile-item"><span>County / crop</span><strong>${escapeHtml(r.county)} · ${escapeHtml(r.primary_crop)}</strong></div>
    <div class="profile-item"><span>Accessibility index</span><strong>${r.accessScore}/100</strong></div>
    <div class="profile-item"><span>Market distance</span><strong>${fmt(r.market_distance_km)} km</strong></div>
    <div class="profile-item"><span>Storage distance</span><strong>${fmt(r.storage_distance_km)} km</strong></div>
    <div class="profile-item"><span>Road distance</span><strong>${fmt(r.road_distance_km)} km</strong></div>
    <div class="profile-item"><span>Production estimate</span><strong>${fmt(r.production_tonnes)} tonnes</strong></div>
  </div><p class="profile-summary">This zone's six-dimensional embedding represents market proximity, storage access, road connectivity, market demand, transport affordability and production scale. Similarity scores compare these normalized characteristics, not geographic distance alone.</p>`;
}
function cosine(a,b){const dot=a.reduce((s,v,i)=>s+v*b[i],0),na=Math.sqrt(a.reduce((s,v)=>s+v*v,0)),nb=Math.sqrt(b.reduce((s,v)=>s+v*v,0));return na&&nb?dot/(na*nb):0;}
function findSimilar(){
  const ref=allRows.find(r=>r.site_id===$("referenceSite").value);if(!ref)return;
  const ranked=allRows.filter(r=>r.site_id!==ref.site_id).map(r=>({...r,similarity:cosine(ref.embedding,r.embedding)})).sort((a,b)=>b.similarity-a.similarity).slice(0,6);
  similarIds=new Set(ranked.map(r=>r.site_id));renderMap();
  $("similarityResults").innerHTML=ranked.map(r=>`<div class="similar-item" data-id="${escapeHtml(r.site_id)}"><div><strong>${escapeHtml(r.site_name)}</strong><small>${escapeHtml(r.county)} · ${escapeHtml(r.primary_crop)}</small></div><span class="similar-score">${Math.round(r.similarity*100)}%</span></div>`).join("");
  document.querySelectorAll(".similar-item").forEach(el=>el.addEventListener("click",()=>{showProfile(el.dataset.id);map.setView([allRows.find(r=>r.site_id===el.dataset.id).latitude,allRows.find(r=>r.site_id===el.dataset.id).longitude],8);}));
  showProfile(ref.site_id);toast("Similarity search completed.");
}
// Deterministic K-means on the six normalized embedding dimensions.
function runKmeans(k){
  const data=allRows;if(data.length<k)throw new Error("Not enough rows for that number of clusters.");
  let centroids=[data[0].embedding];
  while(centroids.length<k){let farthest=data.reduce((best,r)=>{const d=Math.min(...centroids.map(c=>cosineDistance(r.embedding,c)));return d>best.d?{r,d}:best;},{r:data[0],d:-1});centroids.push(farthest.r.embedding);}
  let assignments=new Array(data.length).fill(-1);
  for(let iter=0;iter<35;iter++){
    let changed=false;
    data.forEach((r,i)=>{let best=0,dist=Infinity;centroids.forEach((c,j)=>{const d=euclidean(r.embedding,c);if(d<dist){dist=d;best=j;}});if(assignments[i]!==best){assignments[i]=best;changed=true;}});
    const sums=Array.from({length:k},()=>Array(6).fill(0)),counts=Array(k).fill(0);
    data.forEach((r,i)=>{counts[assignments[i]]++;r.embedding.forEach((v,j)=>sums[assignments[i]][j]+=v);});
    centroids=centroids.map((c,j)=>counts[j]?sums[j].map(v=>v/counts[j]):c);
    if(!changed)break;
  }
  data.forEach((r,i)=>r.cluster=assignments[i]+1);
  allRows=data;applyFilters();toast(`K-means completed with ${k} clusters.`);
}
function euclidean(a,b){return Math.sqrt(a.reduce((s,v,i)=>s+(v-b[i])**2,0));}
function cosineDistance(a,b){return 1-cosine(a,b);}
function csvEscape(v){const s=String(v??"");return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;}
function download(name,content,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);}
function exportCsv(){
  const cols=["site_id","site_name","county","latitude","longitude","primary_crop","production_tonnes","road_distance_km","market_distance_km","storage_distance_km","market_demand_tonnes","transport_cost","accessScore","cluster","embedding"];
  const lines=[cols.join(","),...rows.map(r=>cols.map(c=>csvEscape(c==="embedding"?JSON.stringify(r[c]):r[c])).join(","))];
  download("agrispatial_market_access_embeddings.csv",lines.join("\n"),"text/csv");
}
function exportGeojson(){
  const fc={type:"FeatureCollection",features:rows.map(r=>({type:"Feature",geometry:{type:"Point",coordinates:[r.longitude,r.latitude]},properties:{site_id:r.site_id,site_name:r.site_name,county:r.county,crop:r.primary_crop,production_tonnes:r.production_tonnes,accessibility_score:r.accessScore,cluster:r.cluster,embedding:r.embedding}}))};
  download("agrispatial_market_access_embeddings.geojson",JSON.stringify(fc,null,2),"application/geo+json");
}
async function handleUpload(file){
  if(!file)return;
  try{const text=await file.text();await loadCsvText(text);$("dataStatus").textContent="CUSTOM CSV";toast("CSV imported and analysed with DuckDB.");}
  catch(e){console.error(e);toast("Upload failed: "+e.message);}
}
async function main(){
  initMap();
  try{
    await initDuckDB();
    const res=await fetch(SAMPLE_URL);if(!res.ok)throw new Error("Could not load sample CSV. Run this project from a local web server or GitHub Pages.");
    await loadCsvText(await res.text());
  }catch(e){console.error(e);$("engineStatus").textContent="Engine error";toast(e.message);}
  $("regionFilter").addEventListener("change",applyFilters);
  $("clusterCount").addEventListener("input",e=>{$("clusterValue").textContent=e.target.value;});
  $("runClustering").addEventListener("click",()=>{try{runKmeans(+$("clusterCount").value);}catch(e){toast(e.message);}});
  $("findSimilar").addEventListener("click",findSimilar);
  $("csvUpload").addEventListener("change",e=>handleUpload(e.target.files[0]));
  $("resetData").addEventListener("click",async()=>{try{const r=await fetch(SAMPLE_URL);await loadCsvText(await r.text());$("dataStatus").textContent="SAMPLE DATA";$("similarityResults").innerHTML='<p class="muted">Choose a reference zone to discover locations with similar logistics characteristics.</p>';toast("Sample data restored.");}catch(e){toast(e.message);}});
  $("exportCsv").addEventListener("click",exportCsv);
  $("exportAll").addEventListener("click",()=>{exportCsv();setTimeout(exportGeojson,250);});
}
main();
