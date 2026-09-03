const fs = require('fs');

const path = 'index.html';
let html = fs.readFileSync(path, 'utf8');

function replaceOnce(from, to, label) {
  const count = html.split(from).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly 1 match, found ${count}`);
  html = html.replace(from, to);
}

// Compact bench HUD: course across the top, wind hanging left, switch hanging right.
replaceOnce(
`/* ── TOP HUD — glassmorphism panels ── */
#top-hud{position:fixed;top:max(14px,env(safe-area-inset-top,14px));left:12px;right:12px;z-index:400;display:flex;flex-direction:column;gap:8px;pointer-events:none;transition:opacity 0.3s ease;}
#course-badge{
  background:rgba(6,14,6,0.82);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
  border:1px solid rgba(134,239,172,0.12);border-radius:16px;
  padding:10px 14px;display:flex;align-items:center;gap:10px;pointer-events:auto;
  box-shadow:var(--glow-green),inset 0 1px 0 rgba(134,239,172,0.06);
}
#course-name-display{
  font-family:'Cinzel',serif;font-size:16px;font-weight:600;
  color:var(--accent);letter-spacing:2px;flex:1;
}
#course-switch-btn{
  background:rgba(134,239,172,0.06);border:1px solid rgba(134,239,172,0.18);
  border-radius:20px;padding:4px 12px;
  font-family:'Oswald',sans-serif;font-size:10px;letter-spacing:2px;
  color:rgba(134,239,172,0.6);cursor:pointer;transition:all .2s;
}

/* ── WIND WIDGETS ── */
#wind-widget-golf{
  background:rgba(6,14,6,0.82);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
  border:1px solid rgba(134,239,172,0.1);border-radius:16px;
  padding:10px 14px;display:flex;align-items:center;gap:12px;
  pointer-events:auto;align-self:flex-start;
  box-shadow:var(--glow-green),inset 0 1px 0 rgba(134,239,172,0.05);
}
#wind-compass-golf{width:48px;height:48px;position:relative;flex-shrink:0;}
#wind-canvas-golf{position:absolute;inset:0;}`,
`/* ── TOP HUD — compact bench layout ── */
#top-hud{position:fixed;top:max(14px,env(safe-area-inset-top,14px));left:12px;right:12px;z-index:400;display:flex;flex-direction:column;gap:0;pointer-events:none;transition:opacity .3s ease;}
#hud-bar{background:rgba(6,14,6,0.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(134,239,172,0.14);border-radius:15px 15px 0 0;min-height:42px;padding:9px 14px;display:flex;align-items:center;justify-content:center;pointer-events:auto;box-shadow:var(--glow-green),inset 0 1px 0 rgba(134,239,172,0.06);position:relative;z-index:2;}
#course-name-display{font-family:'Cinzel',serif;font-size:15px;font-weight:600;color:var(--accent);letter-spacing:2px;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;}
#hud-tabs{display:grid;grid-template-columns:1fr 1fr;position:relative;z-index:1;}
#hud-wind-tab{min-height:54px;background:rgba(6,14,6,0.84);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(134,239,172,0.1);border-top:none;border-radius:0 0 0 13px;padding:6px 10px;display:flex;align-items:center;justify-content:center;gap:7px;pointer-events:auto;box-shadow:0 6px 18px rgba(0,0,0,.22);}
#hud-switch-tab{min-height:54px;background:rgba(6,14,6,0.84);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(134,239,172,0.1);border-left:none;border-top:none;border-radius:0 0 13px 0;padding:8px 12px;display:flex;align-items:center;justify-content:center;pointer-events:auto;cursor:pointer;color:rgba(134,239,172,.7);font-family:'Oswald',sans-serif;font-size:10px;letter-spacing:2px;transition:background .2s;}
#hud-switch-tab:active{background:rgba(134,239,172,.09);}

/* ── WIND WIDGETS ── */
#wind-compass-golf{width:40px;height:40px;position:relative;flex-shrink:0;overflow:hidden;}
#wind-canvas-golf{position:absolute;inset:0;width:40px;height:40px;}`,
'bench HUD CSS');

replaceOnce(
`  <!-- Golf HUD -->
  <div id="top-hud">
    <div id="course-badge">
      <span id="course-name-display">SELECT COURSE</span>
      <button id="course-switch-btn" onclick="cycleCourse()">SWITCH ⇄</button>
    </div>
    <div id="wind-widget-golf">
      <div id="wind-compass-golf"><canvas id="wind-canvas-golf" width="48" height="48"></canvas></div>
      <div class="wind-info">
        <div class="wind-speed-val" id="golf-wind-speed">— mph</div>
        <div class="wind-dir-val" id="golf-wind-dir">FETCHING WIND</div>
      </div>
      <div class="wind-relation" id="golf-wind-rel">—</div>
    </div>
  </div>`,
`  <!-- BENCH HUD — Golf -->
  <div id="top-hud">
    <div id="hud-bar">
      <span id="course-name-display">SELECT COURSE</span>
    </div>
    <div id="hud-tabs">
      <div id="hud-wind-tab">
        <div id="wind-compass-golf"><canvas id="wind-canvas-golf" width="48" height="48"></canvas></div>
        <div class="wind-info">
          <div class="wind-speed-val" id="golf-wind-speed">— mph</div>
          <div class="wind-dir-val" id="golf-wind-dir">WIND</div>
          <div class="wind-relation" id="golf-wind-rel">—</div>
        </div>
      </div>
      <button id="hud-switch-tab" onclick="cycleCourse()">⇄ SWITCH COURSE</button>
    </div>
  </div>`,
'bench HUD HTML');

// Make the action control read as a dime rather than a large gold coin.
replaceOnce(
`#coin-btn{
  position:fixed;right:12px;
  bottom:calc(68px + 14px + 40px * 4 + 5px * 4 + 12px);
  z-index:400;width:52px;height:52px;border-radius:50%;
  background:radial-gradient(circle at 35% 28%,#fde68a,#fbbf24 50%,#d97706 80%,#92400e);
  border:2px solid rgba(251,191,36,0.5);
  box-shadow:0 0 0 0 rgba(251,191,36,0.3),0 4px 16px rgba(0,0,0,0.6);
  cursor:pointer;display:none;align-items:center;justify-content:center;
  transition:transform .15s;
  animation:coinPulse 3s ease-in-out infinite;
}
#coin-btn.show{display:flex;}
#coin-btn:active{transform:scale(0.9);}
@keyframes coinPulse{
  0%,100%{box-shadow:0 0 0 0 rgba(251,191,36,0.3),0 4px 16px rgba(0,0,0,0.6);}
  50%{box-shadow:0 0 0 8px rgba(251,191,36,0),0 4px 16px rgba(0,0,0,0.6);}
}`,
`#coin-btn{
  position:fixed;right:12px;
  bottom:calc(68px + 14px + 40px * 4 + 5px * 4 + 12px);
  z-index:400;width:46px;height:46px;border-radius:50%;
  background:rgba(10,12,12,.92);backdrop-filter:blur(12px);
  border:1px solid rgba(226,232,240,.38);
  box-shadow:0 0 0 0 rgba(226,232,240,.18),0 4px 16px rgba(0,0,0,.6);
  cursor:pointer;display:none;align-items:center;justify-content:center;
  transition:transform .15s;
  animation:coinPulse 3s ease-in-out infinite;
  padding:0;
}
#coin-btn.show{display:flex;}
#coin-btn:active{transform:scale(.92);}
@keyframes coinPulse{
  0%,100%{box-shadow:0 0 0 0 rgba(226,232,240,.18),0 4px 16px rgba(0,0,0,.6);}
  50%{box-shadow:0 0 0 7px rgba(226,232,240,0),0 4px 16px rgba(0,0,0,.6);}
}`,
'dime button CSS');

replaceOnce(
`<button id="coin-btn" onclick="dropCoin()">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="rgba(0,0,0,0.18)" stroke="rgba(0,0,0,0.25)" stroke-width="1.2"/>
    <circle cx="12" cy="12" r="7.5" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="1"/>
    <text x="12" y="16" text-anchor="middle" font-size="11" font-family="serif" font-weight="900" fill="rgba(0,0,0,0.55)">🪙</text>
  </svg>
</button>`,
`<button id="coin-btn" onclick="dropCoin()" aria-label="Drop ball marker">
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="16" cy="16" r="15" fill="#e8e8e8" stroke="#aeb4bb" stroke-width="0.8"/>
    <circle cx="16" cy="16" r="14" fill="none" stroke="#c8cdd2" stroke-width="1.5" stroke-dasharray="1.2 1.1"/>
    <circle cx="16" cy="16" r="12.4" fill="#d9dde1"/>
    <ellipse cx="16" cy="17" rx="4.7" ry="6.1" fill="#bcc2c8"/>
    <ellipse cx="16" cy="11.7" rx="3.5" ry="3.8" fill="#c7ccd1"/>
    <path d="M19.5 12.7 Q21.2 13.6 20.4 15" stroke="#a3a9af" stroke-width="0.8" fill="none"/>
    <path d="M12.8 10.8 Q13.1 7.2 16 7.1 Q18.8 7.2 19.2 10.8" fill="#b3b9bf"/>
    <path id="dime-liberty" d="M6.2 16 A9.8 9.8 0 0 1 25.8 16" fill="none"/>
    <text font-size="2.8" font-family="serif" fill="#7c8288" letter-spacing="0.7"><textPath href="#dime-liberty" startOffset="11%">LIBERTY</textPath></text>
    <text x="16" y="28" text-anchor="middle" font-size="2.6" font-family="serif" fill="#7c8288">10¢</text>
    <ellipse cx="12" cy="11.5" rx="2.7" ry="1.7" fill="rgba(255,255,255,.38)" transform="rotate(-24 12 11.5)"/>
  </svg>
</button>`,
'dime button HTML');

// Keep current and breadcrumb map markers visually consistent with the dime action.
replaceOnce(
`  const html=\`<div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 3px 8px rgba(0,0,0,0.7));">
    <div style="width:32px;height:32px;border-radius:50%;
      background:radial-gradient(circle at 35% 28%,#fde68a,#fbbf24 50%,#d97706 80%,#92400e);
      border:2px solid rgba(251,191,36,0.6);
      display:flex;align-items:center;justify-content:center;
      font-family:'Cinzel',serif;font-size:13px;font-weight:700;color:rgba(0,0,0,0.7);
      box-shadow:0 0 12px rgba(251,191,36,0.4);">
      \${num}
    </div>
    <div style="width:2px;height:8px;background:linear-gradient(to bottom,#d97706,rgba(217,119,6,0));margin-top:-1px;"></div>
  </div>\`;
  return L.divIcon({className:'',html,iconSize:[32,42],iconAnchor:[16,42]});`,
`  const html=\`<div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 3px 8px rgba(0,0,0,.72));">
    <div style="width:28px;height:28px;border-radius:50%;background:radial-gradient(circle at 34% 28%,#f8fafc,#d7dce1 52%,#aeb4bb 82%,#737981);border:1.5px solid rgba(255,255,255,.78);display:flex;align-items:center;justify-content:center;font-family:'Cinzel',serif;font-size:11px;font-weight:700;color:#353a40;box-shadow:0 0 9px rgba(226,232,240,.28);">\${num}</div>
    <div style="width:1px;height:6px;background:linear-gradient(to bottom,#cbd5e1,rgba(203,213,225,0));margin-top:-1px;"></div>
  </div>\`;
  return L.divIcon({className:'',html,iconSize:[28,35],iconAnchor:[14,35]});`,
'current dime map marker');

replaceOnce(
`  const html=\`<div style="width:14px;height:14px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fde68a,#fbbf24 55%,#b45309);border:1px solid rgba(255,255,255,0.7);box-shadow:0 1px 5px rgba(0,0,0,0.65);display:flex;align-items:center;justify-content:center;font-family:'Oswald',sans-serif;font-size:7px;font-weight:700;color:#1f1300;">\${num}</div>\`;`,
`  const html=\`<div style="width:12px;height:12px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#f8fafc,#cbd5e1 58%,#8b929a);border:1px solid rgba(255,255,255,.72);box-shadow:0 1px 4px rgba(0,0,0,.62);display:flex;align-items:center;justify-content:center;font-family:'Oswald',sans-serif;font-size:6px;font-weight:700;color:#343a40;">\${num}</div>\`;`,
'breadcrumb dime marker');

replaceOnce(
`  return L.divIcon({className:'',html,iconSize:[14,14],iconAnchor:[7,7]});`,
`  return L.divIcon({className:'',html,iconSize:[12,12],iconAnchor:[6,6]});`,
'breadcrumb icon sizing');

fs.writeFileSync(path, html);
console.log('Third Eye cleanup pass 3 applied successfully.');
