// Minimapa

// ---------- Minimapa ----------
const MAP_S = 4; // píxeles por metro (lienzo 496 x 288)
function drawMap() {
  const cv = document.getElementById('walk-map');
  const g = cv.getContext('2d');
  const upper = walk.y > FLOOR2_Y / 2;
  const mx = x => (x + 62) * MAP_S, mz = z => (z + 36) * MAP_S;
  g.fillStyle = '#e2e8f0'; g.fillRect(0, 0, cv.width, cv.height);
  if (upper) {
    g.fillStyle = '#94a3b8'; g.fillRect(0, 0, cv.width, cv.height);
    g.fillStyle = '#e0f2fe'; g.fillRect(mx(-38.5), mz(-35.2), 25 * MAP_S, 24 * MAP_S);
  }
  colliders.forEach(c => {
    const onLevel = upper ? (c.yMin >= 4.5) : (c.yMin < 1);
    if (!onLevel || (c.layer && !c.layer.visible)) return;
    g.fillStyle = c.layer === layers.racks ? '#ea580c' : c.layer === layers.fire ? '#dc2626' : '#334155';
    g.fillRect(mx(c.x0), mz(c.z0), Math.max(2, (c.x1 - c.x0) * MAP_S), Math.max(2, (c.z1 - c.z0) * MAP_S));
  });
  g.fillStyle = '#f59e0b';
  g.fillRect(mx(STAIR.minX), mz(STAIR.zN), (STAIR.maxX - STAIR.minX) * MAP_S, (STAIR.zS - STAIR.zN) * MAP_S);
  if (!upper) {
    g.fillStyle = '#9ca3af';
    g.fillRect(mx(PIT.x0), mz(PIT.zBack), (PIT.x1 - PIT.x0) * MAP_S, (36 - PIT.zBack) * MAP_S);
    g.fillRect(mx(PIT.x1), mz(PIT.rampTop), (PIT.rampX1 - PIT.x1) * MAP_S, (36 - PIT.rampTop) * MAP_S);
  }
  g.font = '700 15px Inter, Arial'; g.fillStyle = '#0f172a'; g.textAlign = 'center';
  if (upper) {
    g.fillText('B29', mx(-30.3), mz(-26)); g.fillText('Of.', mx(-18), mz(-23));
  } else {
    [[21,-57],[22,-48],[23,-39.6],[24,-29.2],[25,-11.5],[26,-2.3],[27,7.4],[28,16.8]]
      .forEach(([n, x]) => g.fillText(n, mx(x), mz(n === 24 ? 28 : 16)));
  }
  // Posición y dirección de la mirada
  g.save();
  g.translate(mx(walk.x), mz(walk.z));
  g.rotate(-walk.yaw);
  g.fillStyle = '#059669'; g.strokeStyle = '#ffffff'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(0, -12); g.lineTo(8, 8); g.lineTo(0, 4); g.lineTo(-8, 8); g.closePath();
  g.fill(); g.stroke();
  g.restore();
}

function onMapClick(e) {
  const r = e.currentTarget.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width * 124 - 62;
  const z = (e.clientY - r.top) / r.height * 72 - 36;
  const upper = walk.y > FLOOR2_Y / 2;
  if (upper && (x < -38.1 || x > -13.9 || z < -34.8 || z > -11.6)) return;
  // Busca el punto libre más cercano al toque
  for (let rad = 0; rad <= 4; rad += 0.4) {
    for (let a = 0; a < 16; a++) {
      const px = x + Math.cos(a * Math.PI / 8) * rad, pz = z + Math.sin(a * Math.PI / 8) * rad;
      const onStair = px < STAIR.maxX && px > STAIR.minX - 0.3 && pz > STAIR.zN - 0.2 && pz < STAIR.zS + 0.3;
      const y = upper ? FLOOR2_Y : inPitHole(px, pz) ? groundHeight(px, pz, 0) : 0;
      if (!onStair && !isBlocked(px, pz, y)) { teleport(px, y, pz); return; }
    }
  }
}
