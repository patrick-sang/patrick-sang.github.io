
const COUNTY_POINTS = {
"Kisumu":[-0.0917,34.7680],"Siaya":[0.0607,34.2881],"Homa Bay":[-0.5273,34.4571],"Migori":[-1.0634,34.4731],
"Kakamega":[0.2827,34.7519],"Busia":[0.4608,34.1115],"Bungoma":[0.5635,34.5606],"Vihiga":[0.0768,34.7213],
"Kisii":[-0.6810,34.7667],"Nyamira":[-0.5633,34.9358],"Uasin Gishu":[0.5143,35.2698],"Trans Nzoia":[1.0157,35.0062],
"Nandi":[0.1836,35.1269],"Kericho":[-0.3676,35.2831],"Nakuru":[-0.3031,36.0800],"Machakos":[-1.5177,37.2634],
"Kitui":[-1.3667,38.0106],"Makueni":[-1.8039,37.6200],"Meru":[0.0463,37.6559],"Embu":[-0.5389,37.4574],
"Nyeri":[-0.4197,36.9553],"Kiambu":[-1.1714,36.8356],"Murang'a":[-0.7210,37.1526],"Laikipia":[0.3606,36.7819],
"Narok":[-1.0783,35.8601],"Kajiado":[-2.0981,36.7820],"Turkana":[3.1167,35.6000],"Marsabit":[2.3347,37.9899],
"Garissa":[-0.4532,39.6461],"Wajir":[1.7471,40.0573],"Mandera":[3.9366,41.8670],"Kilifi":[-3.5107,39.9093],
"Kwale":[-4.1737,39.4521],"Taita-Taveta":[-3.3167,38.4833],"Tana River":[-1.5000,39.7500],"Mombasa":[-4.0435,39.6682],
"Nairobi":[-1.2864,36.8172],"Nyandarua":[-0.1804,36.5220],"Kirinyaga":[-0.6591,37.3827],"Tharaka-Nithi":[-0.2965,37.7238],
"Isiolo":[0.3546,37.5822],"Samburu":[1.2150,36.9541],"West Pokot":[1.6210,35.1190],"Baringo":[0.4667,35.9667],
"Elgeyo-Marakwet":[0.8000,35.5000],"Bomet":[-0.7813,35.3416],"Other / map point":[-0.0917,34.7680]
};
const REGION_BY_COUNTY = {
"Kisumu":"western_nyanza_medium","Siaya":"western_nyanza_medium","Homa Bay":"western_nyanza_medium","Migori":"western_nyanza_medium","Kakamega":"western_nyanza_medium","Busia":"western_nyanza_medium","Bungoma":"western_nyanza_medium","Vihiga":"western_nyanza_medium","Kisii":"western_nyanza_medium","Nyamira":"western_nyanza_medium",
"Uasin Gishu":"north_rift_unimodal","Trans Nzoia":"north_rift_unimodal","Nandi":"north_rift_unimodal","West Pokot":"north_rift_unimodal","Baringo":"north_rift_unimodal","Elgeyo-Marakwet":"north_rift_unimodal",
"Kitui":"eastern_coast","Machakos":"eastern_coast","Makueni":"eastern_coast","Embu":"eastern_coast","Tharaka-Nithi":"eastern_coast","Meru":"eastern_coast","Taita-Taveta":"eastern_coast","Kilifi":"eastern_coast","Kwale":"eastern_coast","Mombasa":"eastern_coast","Tana River":"eastern_coast","Garissa":"eastern_coast",
"Turkana":"north_eastern_arid","Marsabit":"north_eastern_arid","Isiolo":"north_eastern_arid","Samburu":"north_eastern_arid","Mandera":"north_eastern_arid","Wajir":"north_eastern_arid",
"Nairobi":"central_rift","Kiambu":"central_rift","Murang'a":"central_rift","Nyeri":"central_rift","Kirinyaga":"central_rift","Nyandarua":"central_rift","Laikipia":"central_rift","Nakuru":"central_rift","Narok":"central_rift","Kajiado":"central_rift","Kericho":"central_rift","Bomet":"central_rift"
};
let calendarData, map, marker, rainChart, weatherRows=[];
const $ = id => document.getElementById(id);
const CONFIG = { weatherEndpoint:"https://udf.ai/fc_1F6QOJgJLp2hRF3v4sA0VX/crop_weather_intelligence.json, stacEndpoint:"https://udf.ai/fc_1F6QOJgJLp2hRF3v4sA0VX/deafrica_stac_search.json"
};
const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function point(){return {lat:Number($("lat").value),lon:Number($("lon").value)}}
function initMap(){
 map=L.map("map").setView(point().lat===0?[0,37.8]:[point().lat,point().lon],7);
 L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18,attribution:"© OpenStreetMap"}).addTo(map);
 marker=L.marker([point().lat,point().lon],{draggable:true}).addTo(map);
 marker.on("dragend",()=>setPoint(marker.getLatLng().lat,marker.getLatLng().lng));
 map.on("click",e=>setPoint(e.latlng.lat,e.latlng.lng));
}
function setPoint(lat,lon){$("lat").value=lat.toFixed(4);$("lon").value=lon.toFixed(4);marker.setLatLng([lat,lon]);map.panTo([lat,lon]);$("coordsLabel").textContent=`${lat.toFixed(4)}, ${lon.toFixed(4)}`;}
function monthRange(arr){if(!arr)return "Not specified";return `${MONTHS[arr[0]-1]} – ${MONTHS[arr[1]-1]}`;}
function selectedCrop(){return calendarData.crops.find(c=>c.id===$("crop").value)||calendarData.crops[0]}
function selectedWindow(){
 const c=selectedCrop(), region=$("region").value, season=$("season").value;
 return c.windows?.[region]?.[season] || c.windows?.western_nyanza_medium?.[season] || null;
}
function renderCalendar(){
 const c=selectedCrop(), w=selectedWindow(), region=$("region").value;
 $("calendarYear").textContent=new Date().getFullYear();
 const rows=[];
 if(c.id==="maize" && region==="western_nyanza_medium"){
   rows.push({name:"Planting",start:2,end:3,color:"#3b82f6"},{name:"Vegetative / reproductive",start:3,end:6,color:"#16a34a"},{name:"Ripening / harvest",start:7,end:8,color:"#eab308"});
 } else if(w){
   rows.push({name:"Planting window",start:w.planting[0],end:w.planting[1],color:"#3b82f6"});
   rows.push({name:"Harvest window",start:w.harvest[0],end:w.harvest[1],color:"#eab308"});
 } else {
   const stages=c.stages||[]; stages.forEach(s=>rows.push({name:s.name,start:s.start,end:s.end,color:s.color}));
 }
 $("plantingWindow").textContent=w?monthRange(w.planting):"Local data needed";
 $("windowNote").textContent=w?`${$("season").selectedOptions[0].text} · indicative`:"No validated window for this combination";
 $("calendarTimeline").innerHTML=`<div class="month-head"><span>Crop stage</span>${MONTHS.map(m=>`<span>${m}</span>`).join("")}</div>`+rows.map(r=>{
   const cells=MONTHS.map((m,i)=>{let n=i+1,active=r.start<=r.end?(n>=r.start&&n<=r.end):(n>=r.start||n<=r.end);return `<span class="month-cell ${active?"active":""}" style="--stage-color:${r.color}"></span>`}).join("");
   return `<div class="stage-row"><span class="stage-name">${r.name}</span>${cells}</div>`;
 }).join("");
}
function normalizeRows(data){
 if(Array.isArray(data))return data;
 if(data&&Array.isArray(data.data))return data.data;
 if(data&&data.type==="FeatureCollection")return data.features.map(f=>({...f.properties}));
 if(data&&data.features)return data.features.map(f=>({...f.properties}));
 if(data&&data.columns&&data.data)return data.data.map(row=>Object.fromEntries(data.columns.map((c,i)=>[c,row[i]])));
 return [];
}
async function getWeather(){
 const p=point();
 if(CONFIG.weatherEndpoint){
   const url=new URL(CONFIG.weatherEndpoint);url.searchParams.set("lat",p.lat);url.searchParams.set("lon",p.lon);
   const r=await fetch(url);if(!r.ok)throw new Error(`Fused weather UDF returned ${r.status}`);return normalizeRows(await r.json());
 }
 // Immediate preview mode; production mode should use the shared Fused endpoint above.
 const url=new URL("https://api.open-meteo.com/v1/forecast");
 url.search=new URLSearchParams({latitude:p.lat,longitude:p.lon,timezone:"Africa/Nairobi",past_days:7,forecast_days:14,daily:"precipitation_sum,precipitation_probability_max,temperature_2m_max,temperature_2m_min,et0_fao_evapotranspiration,soil_moisture_0_to_7cm_mean"});
 const r=await fetch(url);if(!r.ok)throw new Error(`Open-Meteo returned ${r.status}`);
 const j=await r.json(),d=j.daily;
 return d.time.map((date,i)=>({date,precipitation_mm:d.precipitation_sum?.[i],precipitation_probability_pct:d.precipitation_probability_max?.[i],temperature_max_c:d.temperature_2m_max?.[i],temperature_min_c:d.temperature_2m_min?.[i],et0_mm:d.et0_fao_evapotranspiration?.[i],soil_moisture_0_7cm:d.soil_moisture_0_to_7cm_mean?.[i],data_period:date<new Date().toISOString().slice(0,10)?"Recent":"Forecast"}));
}
function scoreRows(rows){
 let total=0;
 return rows.map((r,i)=>{const rain=Number(r.precipitation_mm)||0;total+=rain;const rolling=rows.slice(Math.max(0,i-6),i+1).reduce((s,x)=>s+(Number(x.precipitation_mm)||0),0);r.rain_7d_mm=Number(r.rain_7d_mm)||rolling;
 const sm=Number(r.soil_moisture_0_7cm);const prob=Number(r.precipitation_probability_pct)||0;
 if(r.planting_conditions_score==null){const a=Math.min(55,r.rain_7d_mm/25*55),b=Number.isFinite(sm)?Math.max(0,Math.min(30,(sm-.10)/.20*30)):15,c=Math.min(15,prob/100*15);r.planting_conditions_score=+(a+b+c).toFixed(1)}
 if(!r.assessment){let s=r.planting_conditions_score;r.assessment=s>=75?"Favourable signal":s>=50?"Moderate signal":s>=25?"Watch":"Low signal"}
 return r;});
}
function renderWeather(rows){
 weatherRows=scoreRows(rows);const recent=weatherRows.slice(0,7).reduce((s,r)=>s+(Number(r.precipitation_mm)||0),0);
 $("rain7").innerHTML=`${recent.toFixed(1)} <i>mm</i>`;
 const avg=weatherRows.slice(-7).reduce((s,r)=>s+(Number(r.planting_conditions_score)||0),0)/Math.max(1,weatherRows.slice(-7).length);
 $("signal").textContent=avg>=75?"Favourable":avg>=50?"Moderate":avg>=25?"Watch":"Low signal";
 $("signalNote").textContent=`Mean screening score ${avg.toFixed(0)}/100`;
 $("weatherRows").innerHTML=weatherRows.map(r=>`<tr><td>${r.date||"—"}</td><td>${r.data_period||"Forecast"}</td><td>${fmt(r.precipitation_mm,1)}</td><td>${fmt(r.temperature_max_c,1)}°C</td><td>${fmt(r.soil_moisture_0_7cm,2)}</td><td><span class="signal ${(r.planting_conditions_score||0)<25?"low":""}">${r.assessment||"—"}</span></td></tr>`).join("");
 const labels=weatherRows.map(r=>(r.date||"").slice(5));const vals=weatherRows.map(r=>Number(r.precipitation_mm)||0);
 if(rainChart)rainChart.destroy();
 rainChart=new Chart($("rainChart"),{type:"bar",data:{labels,datasets:[{label:"Rainfall",data:vals,backgroundColor:weatherRows.map(r=>r.data_period==="Recent"?"#9db8a6":"#176b4a"),borderRadius:4,maxBarThickness:20}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.raw} mm`}}},scales:{x:{grid:{display:false},ticks:{font:{size:9},maxRotation:0}},y:{beginAtZero:true,grid:{color:"#edf1ed"},ticks:{font:{size:9}}}}}});
}
function fmt(v,n){return v==null||v===""||Number.isNaN(Number(v))?"—":Number(v).toFixed(n)}
async function searchStac(){
 $("stacResults").innerHTML='<div class="empty">Searching Digital Earth Africa STAC…</div>';
 try{
  let rows;
  if(CONFIG.stacEndpoint){const u=new URL(CONFIG.stacEndpoint);const p=point();u.searchParams.set("lat",p.lat);u.searchParams.set("lon",p.lon);rows=normalizeRows(await (await fetch(u)).json())}
  else{
   const p=point(),end=new Date(),start=new Date(Date.now()-45*86400000);
   const res=await fetch("https://explorer.digitalearth.africa/stac/search",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({collections:["sentinel-2-l2a"],intersects:{type:"Point",coordinates:[p.lon,p.lat]},datetime:`${start.toISOString()}/${end.toISOString()}`,limit:12,query:{"eo:cloud_cover":{lt:60}}})});
   if(!res.ok)throw new Error("STAC search unavailable; configure the Fused STAC UDF endpoint.");
   rows=(await res.json()).features.map(f=>({id:f.id,collection:f.collection,datetime:f.properties?.datetime,cloud_cover_pct:f.properties?.["eo:cloud_cover"],platform:f.properties?.platform}));
  }
  $("stacCount").textContent=rows.length;
  $("stacResults").innerHTML=rows.length?rows.map(x=>`<div class="stac-item"><strong>${x.id||"Sentinel observation"}</strong><span>${x.datetime?new Date(x.datetime).toLocaleString():"Date unavailable"}</span><span>Cloud cover: ${fmt(x.cloud_cover_pct,1)}% · ${x.collection||x.platform||"STAC item"}</span></div>`).join(""):'<div class="empty">No matching items found in this time window. Try a larger search window or a nearby point.</div>';
 }catch(e){$("stacCount").textContent="Unavailable";$("stacResults").innerHTML=`<div class="empty">${e.message}</div>`}
}
async function analyse(){
 $("analyseBtn").disabled=true;$("analyseBtn").textContent="Analysing…";
 try{
  const rows=await getWeather();if(!rows.length)throw new Error("No weather rows returned.");
  renderWeather(rows);$("weatherStatus").textContent=CONFIG.weatherEndpoint?"Weather data supplied by your Fused UDF endpoint.":"Preview mode: direct Open-Meteo API. Configure Fused endpoint for the deployed workflow.";
  $("connectionLabel").textContent=CONFIG.weatherEndpoint?"Fused UDF connected":"Open-Meteo preview";
  $("coordsLabel").textContent=`${point().lat.toFixed(4)}, ${point().lon.toFixed(4)}`;
 }catch(e){$("weatherStatus").textContent=e.message;$("connectionLabel").textContent="Data request failed"}
 finally{$("analyseBtn").disabled=false;$("analyseBtn").innerHTML='Run seasonal analysis <span>→</span>'}
}
async function loadCalendar(){calendarData=await (await fetch("data/crop_calendars.json")).json();renderCalendar()}
$("county").addEventListener("change",()=>{const c=$("county").value,p=COUNTY_POINTS[c];if(p)setPoint(p[0],p[1]);if(REGION_BY_COUNTY[c])$("region").value=REGION_BY_COUNTY[c];renderCalendar()});
["crop","season","region"].forEach(id=>$(id).addEventListener("change",renderCalendar));
$("analyseBtn").addEventListener("click",analyse);$("refreshBtn").addEventListener("click",analyse);$("stacBtn").addEventListener("click",searchStac);
$("lat").addEventListener("change",()=>setPoint(Number($("lat").value),Number($("lon").value)));
$("lon").addEventListener("change",()=>setPoint(Number($("lat").value),Number($("lon").value)));
(async()=>{initMap();await loadCalendar();await analyse()})();
