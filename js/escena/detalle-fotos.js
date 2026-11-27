// Portón de entrada, escalera, fachada y zona de trabajo

// =====================================================================
// DETALLE SEGÚN FOTOS: PORTÓN (FOSO + RAMPA), FACHADA, ESCALERA Y MESAS
// Las medidas son aproximadas (estimadas a ojo desde las fotos).
// =====================================================================
const PIT = { depth: 1.2, x0: -25.5, x1: -18.5, zBack: 29, rampX1: -15.5, rampTop: 26, rampFoot: 31 };
// Escalera paralela a la fachada de Bodega 70: sube de este a oeste
const STAIR = { minX: -38.25, maxX: -27.0, zN: -11.2, zS: -9.7,
                topX: -35.9, midW: -32.4, midE: -31.0, midY: 2.4, topY: 4.8 };

function stairHeight(x) {
  const s = STAIR;
  if (x <= s.topX) return s.topY;
  if (x <= s.midW) return s.midY + (s.topY - s.midY) * (s.midW - x) / (s.midW - s.topX);
  if (x <= s.midE) return s.midY;
  return s.midY * (s.maxX - x) / (s.maxX - s.midE);
}

const matCache = {};
function flat(color, extra = {}) {
  const key = color + JSON.stringify(extra);
  return matCache[key] || (matCache[key] = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.65 }, extra)));
}
function box(layer, w, h, d, x, y, z, color, extra) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), flat(color, extra));
  m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true;
  layer.add(m);
  return m;
}
// Barra entre dos puntos (barandas y largueros)
function bar(layer, a, b, thick, color) {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
  const m = new THREE.Mesh(new THREE.BoxGeometry(thick, thick, va.distanceTo(vb)), flat(color));
  m.position.copy(va).add(vb).multiplyScalar(0.5);
  m.lookAt(vb);
  layer.add(m);
  return m;
}
function solid(x, z, w, d, yMin, yMax, layer) { addCollider(x, z, w, d, yMin, yMax, layer); }

// Piso de la nave con el recorte del foso
function buildFloorGeometry(W, D) {
  const pts = [[-W / 2, -D / 2], [W / 2, -D / 2], [W / 2, D / 2], [PIT.rampX1, D / 2], [PIT.rampX1, PIT.rampTop],
    [PIT.x1, PIT.rampTop], [PIT.x1, PIT.zBack], [PIT.x0, PIT.zBack], [PIT.x0, D / 2], [-W / 2, D / 2]];
  const shape = new THREE.Shape();
  pts.forEach(([x, z], i) => i ? shape.lineTo(x, -z) : shape.moveTo(x, -z));
  return new THREE.ShapeGeometry(shape);
}
function inPitHole(x, z) {
  return (x > PIT.x0 && x < PIT.x1 && z > PIT.zBack) || (x >= PIT.x1 && x < PIT.rampX1 && z > PIT.rampTop);
}
function buildGrid(W, D) {
  const v = [];
  const line = (x0, z0, x1, z1) => {
    const n = Math.ceil(Math.hypot(x1 - x0, z1 - z0) / 0.5);
    for (let i = 0; i < n; i++) {
      const a = i / n, b = (i + 1) / n;
      const ax = x0 + (x1 - x0) * a, az = z0 + (z1 - z0) * a, bx = x0 + (x1 - x0) * b, bz = z0 + (z1 - z0) * b;
      if (!inPitHole((ax + bx) / 2, (az + bz) / 2)) v.push(ax, 0.01, az, bx, 0.01, bz);
    }
  };
  for (let x = -W / 2; x <= W / 2; x += 4) line(x, -D / 2, x, D / 2);
  for (let z = -D / 2; z <= D / 2; z += 4) line(-W / 2, z, W / 2, z);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  return new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0xb8c2cf }));
}

function buildEntrance() {
  const L = layers.zones, h = PIT.depth, zEnd = 36;
  const CONC = 0x9ca0a3, DARK = 0x7d8184, YEL = 0xfacc15;
  // Fondo del foso
  box(L, PIT.x1 - PIT.x0, 0.1, zEnd - PIT.zBack, (PIT.x0 + PIT.x1) / 2, -h - 0.05, (PIT.zBack + zEnd) / 2, CONC);
  box(L, PIT.rampX1 - PIT.x1, 0.1, zEnd - PIT.rampFoot, (PIT.x1 + PIT.rampX1) / 2, -h - 0.05, (PIT.rampFoot + zEnd) / 2, CONC);
  // Muros de hormigón del andén
  box(L, PIT.x1 - PIT.x0, h, 0.2, (PIT.x0 + PIT.x1) / 2, -h / 2, PIT.zBack - 0.1, DARK);
  box(L, 0.2, h, zEnd - PIT.zBack, PIT.x0 - 0.1, -h / 2, (PIT.zBack + zEnd) / 2, DARK);
  box(L, 0.2, h, zEnd - PIT.rampTop, PIT.rampX1 + 0.1, -h / 2, (PIT.rampTop + zEnd) / 2, DARK);
  box(L, 0.2, h, PIT.zBack - PIT.rampTop, PIT.x1 - 0.1, -h / 2, (PIT.rampTop + PIT.zBack) / 2, DARK);
  // Rampa
  const run = PIT.rampFoot - PIT.rampTop, len = Math.hypot(run, h), ang = Math.atan2(h, run);
  const rx = (PIT.x1 + PIT.rampX1) / 2, rw = PIT.rampX1 - PIT.x1;
  const ramp = box(L, rw, 0.12, len, rx, -h / 2 - 0.06, PIT.rampTop + run / 2, 0xb4b6b8);
  ramp.rotation.x = ang;
  for (let i = 1; i < 18; i++) { // estrías antideslizantes
    const t = i / 18;
    bar(L, [PIT.x1 + 0.15, -h * t + 0.015, PIT.rampTop + run * t], [PIT.rampX1 - 0.15, -h * t + 0.015, PIT.rampTop + run * t], 0.04, 0x8b8e91);
  }
  // Barandas amarillas con topes negros
  const rail = (x, z0, z1) => {
    const n = Math.max(1, Math.round((z1 - z0) / 2.2));
    for (let i = 0; i <= n; i++) {
      const z = z0 + (z1 - z0) * i / n;
      box(L, 0.22, 1.25, 0.22, x, 0.62, z, YEL);
      [0.1, 0.3, 0.5].forEach(y => box(L, 0.4, 0.16, 0.4, x, y, z, 0x1f2937));
    }
    [0.75, 1.15].forEach(y => bar(L, [x, y, z0], [x, y, z1], 0.14, YEL));
    solid(x, (z0 + z1) / 2, 0.3, z1 - z0 + 0.3, 0, 1.3, L);
  };
  rail(PIT.x0 - 0.35, 29.4, 35.2);
  rail(PIT.rampX1 + 0.45, 26.4, 29.9);
  rail(PIT.rampX1 + 0.45, 32.3, 35.2);
  // Pilares estructurales amarillos
  [[PIT.rampX1 + 0.55, 31.1], [PIT.rampX1 + 0.55, 21.0], [PIT.x0 - 1.0, 28.2]].forEach(([x, z]) => {
    box(L, 0.7, 9, 0.7, x, 4.5, z, 0xf5a623);
    solid(x, z, 0.7, 0.7, 0, 9, L);
  });
  // Letrero PARE
  const pare = createTextTexture('PARE', { bgColor: '#dc2626', textColor: '#ffffff', borderColor: '#ffffff', fontSize: 52 });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.75 * pare.aspect, 0.75), new THREE.MeshBasicMaterial({ map: pare.texture }));
  sign.position.set(PIT.x0 - 1.0, 3.0, 28.57);
  L.add(sign);
  // Pasos peatonales blancos: cruce frente al foso y camino hacia el acceso de Bodega 70
  const stripe = (x, z, w, d) => box(L, w, 0.02, d, x, 0.03, z, 0xffffff);
  for (let x = -27.6; x <= -13.6; x += 1.5) stripe(x, 24.6, 0.8, 0.45);
  for (let z = -7.6; z <= 23; z += 1.5) stripe(-24.5, z, 2.2, 0.6);
}

function buildStairAndFacade() {
  const L = layers.floor2, s = STAIR, GREY = 0x8b929b, zc = (s.zN + s.zS) / 2, w = s.zS - s.zN;
  // Peldaños
  const flight = (xa, xb, ya, yb, n) => {
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      box(L, Math.abs(xb - xa) / n * 1.1, 0.07, w, xa + (xb - xa) * t, ya + (yb - ya) * (i + 1) / n - 0.04, zc, 0x6b7280);
    }
    [s.zN + 0.08, s.zS - 0.04].forEach(z => bar(L, [xa, ya, z], [xb, yb, z], 0.18, GREY));
  };
  flight(s.maxX, s.midE, 0, s.midY, 10);
  flight(s.midW, s.topX, s.midY, s.topY, 10);
  box(L, s.midE - s.midW, 0.12, w, (s.midE + s.midW) / 2, s.midY - 0.07, zc, GREY);   // descanso
  box(L, s.topX - s.minX, 0.14, w, (s.topX + s.minX) / 2, s.topY - 0.08, zc, GREY);   // plataforma superior
  // Pilares de la escalera
  [[-38.15, s.zS - 0.1, s.topY], [-35.95, s.zS - 0.1, s.topY], [-31.7, s.zS - 0.1, s.midY]].forEach(([x, z, h]) =>
    box(L, 0.12, h, 0.12, x, h / 2, z, GREY));
  // Baranda de la cara visible (y cierre oeste de la plataforma)
  const nodes = [s.maxX, s.midE, s.midW, s.topX, s.minX];
  [0.55, 0.8, 1.1].forEach(dy => {
    for (let i = 0; i < nodes.length - 1; i++)
      bar(L, [nodes[i], stairHeight(nodes[i]) + dy, s.zS], [nodes[i + 1], stairHeight(nodes[i + 1]) + dy, s.zS], dy > 1 ? 0.09 : 0.05, 0xcbd0d6);
    bar(L, [s.minX, s.topY + dy, s.zN], [s.minX, s.topY + dy, s.zS], 0.05, 0xcbd0d6);
  });
  for (let x = s.maxX; x >= s.minX; x -= 1.1) box(L, 0.07, 1.1, 0.07, x, stairHeight(x) + 0.55, s.zS, 0xcbd0d6);
  // Colisiones: costado sur completo y extremo oeste
  solid((s.minX + s.maxX) / 2, s.zS + 0.02, s.maxX - s.minX, 0.08, 0, 7, null);
  solid(s.minX - 0.03, zc, 0.08, w, 0, 7, null);

  // Balcón: antepecho gris con luces azules y celosía detrás
  const bx0 = -36.1, bx1 = -22.3, bw = bx1 - bx0, bc = (bx0 + bx1) / 2;
  box(L, bw, 1.15, 0.1, bc, 5.25, -11.14, 0xa3a9b0);
  for (let x = bx0 + 0.2; x < bx1; x += 0.42) {
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), new THREE.MeshBasicMaterial({ color: 0x3b5bff }));
    dot.position.set(x, 5.74 - Math.abs(Math.sin(x * 2.1)) * 0.08, -11.06);
    L.add(dot);
  }
  for (let y = 5.95; y <= 7.6; y += 0.17) box(L, bw, 0.07, 0.04, bc, y, -11.24, 0x77736a);
  // Oficina: muro blanco con ventanales
  box(L, 8.6, 1.15, 0.1, -18.0, 5.3, -11.2, 0xf1efe8);
  [-20.9, -18.0, -15.1].forEach(x => {
    box(L, 2.55, 1.6, 0.06, x, 6.75, -11.18, 0xbfe3f5, { emissive: 0x3b4a52, roughness: 0.2 });
    box(L, 0.08, 1.6, 0.1, x, 6.75, -11.16, 0x9ca3af);
  });
  box(L, 8.6, 0.25, 0.12, -18.0, 7.7, -11.2, 0xf1efe8);
  // Letrero de extintor del balcón
  box(L, 0.55, 0.9, 0.05, -25.2, 7.0, -11.18, 0xdc2626);
}

// Puerta de acceso a Bodega 70 (marco y hoja abierta)
function buildDoor() {
  const L = layers.bodega70;
  [-25.72, -23.0].forEach(x => box(L, 0.12, 3.0, 0.42, x, 1.5, -11.2, 0x6b7280));
  box(L, 2.84, 0.14, 0.42, -24.36, 3.05, -11.2, 0x6b7280);
  box(L, 2.7, 1.68, 0.3, -24.36, 3.96, -11.2, 0xf1efe8);
  box(L, 0.08, 2.95, 1.2, -23.02, 1.48, -10.4, 0x9aa1aa);
  solid(-23.02, -10.4, 0.12, 1.2, 0, 3, L);
}

function buildWorkArea() {
  const L = layers.zones;
  const WOOD = 0xc9743d, PLY = 0xd2ad7c, GREY = 0x4b5563, BLUE = 0x1d4ed8, ORANGE = 0xf97316, CARD = 0xb98d5a, DARK = 0x111827;
  const legs = (x, z, w, d, h, color) => [-1, 1].forEach(i => [-1, 1].forEach(j =>
    box(L, 0.09, h, 0.09, x + i * (w / 2 - 0.1), h / 2, z + j * (d / 2 - 0.1), color)));
  const table = (x, z, w, d, top, leg, h = 0.82) => {
    box(L, w, 0.08, d, x, h, z, top); legs(x, z, w, d, h, leg);
    solid(x, z, w, d, 0, h + 0.2, L);
  };
  const crate = (x, y, z, w, h, d, color = CARD) => box(L, w, h, d, x, y + h / 2, z, color);

  // Escritorio de punta redondeada
  table(-33.9, -5.9, 2.0, 1.0, WOOD, GREY);
  const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.08, 24), flat(WOOD));
  tip.position.set(-32.9, 0.82, -5.9); L.add(tip);
  box(L, 1.5, 0.74, 0.7, -34.0, 0.4, -5.9, GREY);
  crate(-33.4, 0.86, -5.85, 0.4, 0.02, 0.3, 0xffffff);
  // Mesa de trabajo de madera
  table(-34.2, -7.2, 2.3, 0.9, PLY, GREY);
  // Mesón azul/naranja con impresora y monitor
  table(-34.0, -8.7, 2.1, 0.9, PLY, BLUE, 0.98);
  box(L, 2.14, 0.1, 0.94, -34.0, 0.91, -8.7, ORANGE);
  box(L, 2.0, 0.07, 0.85, -34.0, 0.4, -8.7, ORANGE);
  crate(-34.5, 1.03, -8.75, 0.55, 0.3, 0.45, DARK);
  crate(-33.4, 1.03, -8.95, 0.7, 0.48, 0.07, DARK);
  // Mesón largo de embalaje con cajas y plástico burbuja
  table(-37.0, -6.7, 1.1, 4.2, 0xe5e7eb, DARK, 0.9);
  crate(-37.0, 0.94, -5.2, 0.8, 0.45, 0.6); crate(-37.1, 0.94, -6.1, 0.6, 0.35, 0.7);
  crate(-36.9, 0.94, -7.1, 0.7, 0.5, 0.55, 0xe7e2d6);
  const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.9, 16), flat(0xe0f2fe, { transparent: true, opacity: 0.8 }));
  roll.rotation.x = Math.PI / 2; roll.position.set(-37.0, 1.22, -8.2); L.add(roll);
  // Sillas
  [[-35.8, -5.9, -1], [-35.9, -8.0, -1]].forEach(([x, z, dir]) => {
    box(L, 0.55, 0.1, 0.55, x, 0.52, z, DARK);
    box(L, 0.1, 0.65, 0.5, x + dir * 0.28, 0.9, z, DARK);
    box(L, 0.08, 0.45, 0.08, x, 0.25, z, GREY);
    box(L, 0.55, 0.05, 0.08, x, 0.05, z, GREY); box(L, 0.08, 0.05, 0.55, x, 0.05, z, GREY);
    solid(x, z, 0.55, 0.55, 0, 1.2, L);
  });
  // Carro plano amarillo
  box(L, 1.2, 0.1, 0.7, -32.0, 0.25, -4.7, 0xb4533a);
  [-0.33, 0.33].forEach(dz => box(L, 0.08, 0.9, 0.08, -31.45, 0.72, -4.7 + dz, 0xfacc15));
  [0.8, 1.17].forEach(y => box(L, 0.08, 0.08, 0.74, -31.45, y, -4.7, 0xfacc15));
  [-0.45, 0.45].forEach(dx => [-0.3, 0.3].forEach(dz => box(L, 0.18, 0.18, 0.08, -32.0 + dx, 0.1, -4.7 + dz, DARK)));
  solid(-32.0, -4.7, 1.3, 0.75, 0, 1.2, L);
  // Pallet con material embalado
  const pallet = (x, z, boxes, color) => {
    box(L, 1.4, 0.18, 1.1, x, 0.09, z, 0xa9773f);
    for (let i = 0; i < boxes; i++) box(L, 1.3 - (i % 2) * 0.1, 0.22, 1.0, x, 0.3 + i * 0.23, z, color);
    solid(x, z, 1.4, 1.1, 0, 0.3 + boxes * 0.23, L);
  };
  pallet(-35.6, -3.6, 3, 0xe5e7eb);
  pallet(-20.9, -9.5, 7, 0xc29a6b);
  pallet(-19.0, -9.4, 3, 0x6b7280);
  // Pizarra blanca delante de la escalera
  [-31.2, -29.0].forEach(x => box(L, 0.08, 1.2, 0.08, x, 0.6, -9.45, GREY));
  box(L, 3.0, 1.45, 0.07, -30.1, 1.85, -9.45, 0xffffff, { emissive: 0x333333 });
  box(L, 3.08, 0.06, 0.1, -30.1, 2.6, -9.45, 0x9ca3af); box(L, 3.08, 0.06, 0.1, -30.1, 1.1, -9.45, 0x9ca3af);
  box(L, 0.16, 0.3, 0.06, -29.0, 1.7, -9.38, DARK);
  solid(-30.1, -9.45, 3.0, 0.12, 0, 2.7, L);
  // Balanza de piso
  box(L, 1.9, 0.14, 1.3, -30.0, 0.09, -8.1, 0x52575e, { metalness: 0.6, roughness: 0.5 });
  // Mesa con film stretch, cajas y basurero junto al inicio de la escalera
  table(-27.8, -9.15, 1.4, 0.6, 0xe7ddc9, GREY);
  crate(-28.1, 0.86, -9.15, 0.55, 0.9, 0.35);
  crate(-29.1, 0, -9.1, 0.5, 0.4, 0.4);
  box(L, 0.35, 0.55, 0.35, -28.5, 0.28, -9.1, DARK);
  // Botiquín
  box(L, 0.75, 0.75, 0.12, -33.2, 1.75, -10.98, 0xf3f4f6);
  box(L, 0.3, 0.1, 0.14, -33.35, 1.85, -10.97, 0x16a34a); box(L, 0.1, 0.3, 0.14, -33.35, 1.85, -10.97, 0x16a34a);
  // Derecha del acceso: tablero eléctrico, cargador rojo y mueble
  table(-22.0, -10.6, 1.1, 0.6, 0x7c4a2d, DARK);
  crate(-22.0, 0.86, -10.65, 0.85, 0.45, 0.4, 0xdc2626);
  box(L, 0.7, 0.8, 0.18, -22.0, 2.05, -10.95, 0xd1d5db);
  box(L, 1.1, 2.1, 0.55, -16.6, 1.05, -10.65, GREY);
  solid(-16.6, -10.65, 1.1, 0.55, 0, 2.1, L);
  addFloorLabel('Zona de trabajo', -33.6, -2.2, 1.1,
    { bgColor: 'rgba(15, 23, 42, 0.9)', textColor: '#fde68a', borderColor: '#f59e0b', fontSize: 36 }, layers.zones);
}

function buildPhotoDetails() {
  buildEntrance();
  buildStairAndFacade();
  buildDoor();
  buildWorkArea();
}
