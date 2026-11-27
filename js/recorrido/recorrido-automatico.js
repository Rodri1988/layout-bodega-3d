// Puntos de salto y recorrido automático

// ---------- Puntos de salto ---------- [nombre, x, y, z, yaw]  (yaw 0 = mirando al norte)
const walkSpots = [
  ['Portón Entrada', -21.5, -1.2, 35.0, 0],
  ['Pasillo 21', -57.0, 0, 14, Math.PI],
  ['Pasillo 22', -48.0, 0, 14, 0],
  ['Pasillo 23', -39.6, 0, 14, 0],
  ['Pasillo 24', -29.2, 0, 33, 0],
  ['Pasillo 25', -11.5, 0, 14, 0],
  ['Pasillo 26', -2.3, 0, 14, 0],
  ['Pasillo 27', 7.4, 0, 14, 0],
  ['Pasillo 28', 16.8, 0, 14, 0],
  ['Bodega 70 · Acceso', -24.4, 0, -8, 0],
  ['Escalera al 2° Piso', -26.3, 0, -10.35, Math.PI / 2],
  ['Zona de trabajo', -29.5, 0, -4.6, Math.PI / 2 - 0.35],
  ['Bodega 29 (2° Piso)', -30.3, FLOOR2_Y, -19.5, 0],
  ['Oficina (2° Piso)', -20.6, FLOOR2_Y, -14.4, -0.5],
  ['Patio / Andenes', 40, 0, 31, -0.7]
];

function teleport(x, y, z, yaw) {
  stopTour();
  walk.x = x; walk.y = y; walk.z = z;
  if (yaw !== undefined) { walk.yaw = yaw; walk.pitch = 0; }
}

// ---------- Recorrido automático ---------- [x, z]
const tourPath = [
  [-21,34.5],[-17,34],[-17,24],[-29.2,23],[-29.2,30],[-29.2,14],
  [-39.6,14],[-39.6,32],[-39.6,14],[-39.6,-31],[-39.6,14],
  [-48,14],[-48,30],[-48,14],[-48,-31],[-48,14],
  [-57,14],[-57,31],[-57,-30],[-57,14],
  [-11.5,14],[-11.5,31],[-11.5,-29.5],[-11.5,14],
  [-2.3,14],[-2.3,30],[-2.3,14],[-2.3,-7.5],[-2.3,14],
  [7.4,14],[7.4,31],[7.4,-29.5],[-2.3,-29.5],[-2.3,-11.5],[-2.3,-29.5],
  [16.8,-29.5],[16.8,14],
  [-11.5,14],[-24.4,13],[-24.4,-8],
  [-24.4,-15],[-24.8,-20],[-27.7,-21],[-27.7,-31],[-27.7,-16],[-24.4,-15],[-24.4,-8],
  [-24.4,-9],[-26.3,-10.35],[-37.4,-10.35],[-37.4,-12.6],
  [-30.3,-14.4],[-30.3,-24],[-30.3,-14.4],[-20.3,-14.4],[-19.9,-22]
];

function startTour() {
  walk.x = tourPath[0][0]; walk.z = tourPath[0][1]; walk.y = -PIT.depth; walk.pitch = 0;
  walk.yaw = yawTo(tourPath[1]);
  walk.tour = { i: 1 };
  document.getElementById('walk-tour').textContent = '⏸ Detener recorrido';
}
function stopTour() {
  walk.tour = null;
  document.getElementById('walk-tour').textContent = '▶ Recorrido automático';
}
function yawTo(p) { return Math.atan2(-(p[0] - walk.x), -(p[1] - walk.z)); }

function updateTour(dt) {
  const target = tourPath[walk.tour.i];
  if (!target) { stopTour(); return; }
  const dist = Math.hypot(target[0] - walk.x, target[1] - walk.z);
  if (dist < 0.05) { walk.tour.i++; return; }
  // Primero gira, luego avanza
  let diff = yawTo(target) - walk.yaw;
  diff = Math.atan2(Math.sin(diff), Math.cos(diff));
  walk.yaw += Math.sign(diff) * Math.min(Math.abs(diff), 2.6 * dt);
  walk.pitch *= 0.95;
  if (Math.abs(diff) > 0.25) return;
  const step = Math.min(dist, 5 * dt);
  walk.x += (target[0] - walk.x) / dist * step;
  walk.z += (target[1] - walk.z) / dist * step;
  walk.y = groundHeight(walk.x, walk.z, walk.y);
}
