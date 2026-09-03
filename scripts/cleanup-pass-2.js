const fs = require('fs');

const path = 'index.html';
let html = fs.readFileSync(path, 'utf8');

function replaceOnce(from, to, label) {
  const count = html.split(from).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly 1 match, found ${count}`);
  html = html.replace(from, to);
}

// Human field test showed the coin action only appeared after tapping Golf again.
// Keep its visibility synchronized as soon as GPS becomes available.
replaceOnce(
`  drawGPSMarker();\n}\nfunction recenter(){`,
`  drawGPSMarker();\n  updateCoinBtn();\n}\nfunction recenter(){`,
'coin button visibility after GPS lock');

// clearPins removed the CSS class but an inline display:block could keep the control visible.
replaceOnce(
`  document.getElementById('clear-pins-btn').classList.remove('show');\n  document.getElementById('undo-pin-btn').classList.remove('show');\n  updatePinLegend();`,
`  document.getElementById('clear-pins-btn').classList.remove('show');\n  document.getElementById('clear-pins-btn').style.display='none';\n  document.getElementById('undo-pin-btn').classList.remove('show');\n  document.getElementById('undo-pin-btn').style.display='none';\n  updatePinLegend();`,
'clear target control visibility');

fs.writeFileSync(path, html);
console.log('Third Eye cleanup pass 2 applied successfully.');
