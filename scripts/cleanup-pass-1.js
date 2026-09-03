const fs = require('fs');

const path = 'index.html';
let html = fs.readFileSync(path, 'utf8');

function replaceOnce(from, to, label) {
  const count = html.split(from).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly 1 match, found ${count}`);
  html = html.replace(from, to);
}

// 1) Remove the silent six-target wipe and add one-tap undo.
replaceOnce(
`#clear-pins-btn.show{display:block;}\n#pin-legend`,
`#clear-pins-btn.show{display:block;}\n#undo-pin-btn{\n  position:fixed;left:12px;bottom:calc(68px + 52px);z-index:400;\n  background:rgba(4,4,6,0.85);backdrop-filter:blur(14px);\n  border:1px solid rgba(134,239,172,0.28);border-radius:10px;\n  color:rgba(134,239,172,0.85);font-family:'Oswald',sans-serif;\n  font-size:10px;letter-spacing:2px;padding:8px 12px;cursor:pointer;display:none;\n}\n#undo-pin-btn.show{display:block;}\n#pin-legend`,
'undo button CSS');

replaceOnce(
`  <button id="clear-pins-btn" onclick="clearPins()">✕ CLEAR PINS</button>\n  <div id="pin-legend"></div>`,
`  <button id="undo-pin-btn" onclick="undoLastPin()">↶ UNDO LAST</button>\n  <button id="clear-pins-btn" onclick="clearPins()">✕ CLEAR PINS</button>\n  <div id="pin-legend"></div>`,
'undo button HTML');

replaceOnce(
`function dropPin(){\n  const num=S.droppedPins.length+1;\n  if(num>6){clearPins();}\n  const icon=`,
`function dropPin(){\n  const num=S.droppedPins.length+1;\n  const icon=`,
'remove six-target reset');

replaceOnce(
`  S.droppedPins.push({marker,val:S.dragVal,num:S.droppedPins.length+1,mode:S.mode});\n  // Always show clear button when pins exist on any map tab\n  document.getElementById('clear-pins-btn').classList.add('show');`,
`  S.droppedPins.push({marker,val:S.dragVal,num:S.droppedPins.length+1,mode:S.mode,latlng,course:S.mode==='golf'?activeGolfCourse:null,location:S.mode==='photo'?activePhotoLoc:null});\n  // Always show repair controls when targets exist on any map tab\n  document.getElementById('clear-pins-btn').classList.add('show');\n  document.getElementById('undo-pin-btn').classList.add('show');`,
'pin state and undo visibility');

replaceOnce(
`function clearPins(){\n  S.droppedPins.forEach(p=>map.removeLayer(p.marker));\n  S.droppedPins=[];\n  document.getElementById('clear-pins-btn').classList.remove('show');\n  updatePinLegend();\n}\nfunction updatePinLegend(){`,
`function clearPins(){\n  S.droppedPins.forEach(p=>{if(map.hasLayer(p.marker))map.removeLayer(p.marker);});\n  S.droppedPins=[];\n  document.getElementById('clear-pins-btn').classList.remove('show');\n  document.getElementById('undo-pin-btn').classList.remove('show');\n  updatePinLegend();\n}\nfunction undoLastPin(){\n  const last=S.droppedPins.pop();\n  if(!last)return;\n  if(map.hasLayer(last.marker))map.removeLayer(last.marker);\n  if(!S.droppedPins.length){\n    document.getElementById('clear-pins-btn').classList.remove('show');\n    document.getElementById('undo-pin-btn').classList.remove('show');\n  }\n  updatePinLegend();\n  showToast('Last target removed',S.mode==='photo'?'photo':'golf',1400);\n}\nfunction updatePinLegend(){`,
'undo function');

// 2) Preserve prior ball locations as small breadcrumbs instead of deleting them.
replaceOnce(
`coinMarker:null,\ncoinPos:null,`,
`coinMarker:null,\ncoinMarkers:[],\ncoinPos:null,`,
'coin marker history state');

replaceOnce(
`// ═══ COIN DROP ═══\nfunction updateCoinBtn(){`,
`function makeCoinBreadcrumbIcon(num){\n  const html=\`<div style="width:14px;height:14px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fde68a,#fbbf24 55%,#b45309);border:1px solid rgba(255,255,255,0.7);box-shadow:0 1px 5px rgba(0,0,0,0.65);display:flex;align-items:center;justify-content:center;font-family:'Oswald',sans-serif;font-size:7px;font-weight:700;color:#1f1300;">\${num}</div>\`;\n  return L.divIcon({className:'',html,iconSize:[14,14],iconAnchor:[7,7]});\n}\n\nfunction hideGolfShotMarkers(){\n  if(S.coinMarker&&map.hasLayer(S.coinMarker))map.removeLayer(S.coinMarker);\n  S.coinMarkers.forEach(m=>{if(map.hasLayer(m.marker))map.removeLayer(m.marker);});\n}\nfunction showGolfShotMarkers(){\n  S.coinMarkers.forEach(m=>{if(!map.hasLayer(m.marker))m.marker.addTo(map);});\n  if(S.coinMarker&&!map.hasLayer(S.coinMarker))S.coinMarker.addTo(map);\n}\n\n// ═══ COIN DROP ═══\nfunction updateCoinBtn(){`,
'coin breadcrumb helpers');

replaceOnce(
`  const coinNum=S.shotLog.length+1;\n  if(S.coinMarker){map.removeLayer(S.coinMarker);S.coinMarker=null;}\n  S.coinPos={lat:S.gpsPos.lat,lng:S.gpsPos.lng};`,
`  const coinNum=S.shotLog.length+1;\n  if(S.coinMarker){\n    S.coinMarker.setIcon(makeCoinBreadcrumbIcon(Math.max(1,coinNum-1)));\n    S.coinMarker.setZIndexOffset(700);\n    S.coinMarkers.push({marker:S.coinMarker,latlng:S.coinPos,num:Math.max(1,coinNum-1)});\n    S.coinMarker=null;\n  }\n  S.coinPos={lat:S.gpsPos.lat,lng:S.gpsPos.lng};`,
'coin breadcrumb transition');

replaceOnce(
`  S.shotLog=[];\n  if(S.coinMarker){map.removeLayer(S.coinMarker);S.coinMarker=null;}\n  S.coinPos=null;`,
`  S.shotLog=[];\n  if(S.coinMarker){if(map.hasLayer(S.coinMarker))map.removeLayer(S.coinMarker);S.coinMarker=null;}\n  S.coinMarkers.forEach(m=>{if(map.hasLayer(m.marker))map.removeLayer(m.marker);});\n  S.coinMarkers=[];\n  S.coinPos=null;`,
'clear breadcrumb history');

// 3) Fix the club drawer race caused by clicks on the SVG inside the coin button.
replaceOnce(
`  if(panel.classList.contains('open')&&!panel.contains(e.target)&&e.target.id!=='shot-log-btn'){closeShotLog();}\n  const sheet=document.getElementById('club-sheet');\n  if(sheet.classList.contains('open')&&!sheet.contains(e.target)&&e.target.id!=='coin-btn'){closeClubSheet();}`,
`  if(panel.classList.contains('open')&&!panel.contains(e.target)&&!e.target.closest('#shot-log-btn')){closeShotLog();}\n  const sheet=document.getElementById('club-sheet');\n  if(sheet.classList.contains('open')&&!sheet.contains(e.target)&&!e.target.closest('#coin-btn')){closeClubSheet();}`,
'outside click handling');

// 4) Keep course targets from bleeding into another course, and keep Golf shot markers out of Photo.
replaceOnce(
`  activeGolfCourse=golfCourses[(i+1)%golfCourses.length];\n  sv('ce-active-golf',activeGolfCourse);`,
`  activeGolfCourse=golfCourses[(i+1)%golfCourses.length];\n  sv('ce-active-golf',activeGolfCourse);\n  clearPins();`,
'course switch target isolation');

replaceOnce(
`  // Update marker when switching between golf/photo map\n  if((tab==='map'||tab==='photo-map')&&S.gpsPos)drawGPSMarker();\n  updateCoinBtn();`,
`  // Keep mode-specific shot markers from bleeding across Golf / Photo.\n  if(tab==='photo-map')hideGolfShotMarkers();\n  if(tab==='map')showGolfShotMarkers();\n  // Update the GPS marker to the active mode icon.\n  if((tab==='map'||tab==='photo-map')&&S.gpsPos)drawGPSMarker();\n  if(tab==='photo-map')showToast('PHOTO: drag from the lens marker to your subject','photo',3200);\n  updateCoinBtn();`,
'mode-specific marker ownership and photo hint');

replaceOnce(
`  document.getElementById('clear-pins-btn').style.display=onMap&&S.droppedPins.length?'block':'none';\n  document.getElementById('pin-legend').style.display=onMap?'flex':'none';`,
`  document.getElementById('clear-pins-btn').style.display=onMap&&S.droppedPins.length?'block':'none';\n  document.getElementById('undo-pin-btn').style.display=onMap&&S.droppedPins.length?'block':'none';\n  document.getElementById('pin-legend').style.display=onMap?'flex':'none';`,
'undo visibility on tab switch');

fs.writeFileSync(path, html);
console.log('Third Eye cleanup pass 1 applied successfully.');
