// Colisiones y alturas al caminar

// =====================================================================
// MODO RECORRIDO EN PRIMERA PERSONA
// =====================================================================
const EYE = 1.7;          // altura de los ojos (m)
const RADIUS = 0.3;       // "ancho" del caminante (m)
const FLOOR2_Y = 4.8;

const colliders = [];     // cajas sólidas en planta + rango de altura
const walkOnly = new THREE.Group();   // señalética visible solo al caminar
walkOnly.visible = false;
const walkHiddenMaterials = [];
let walkWallMaterial = null;
let floor2Title = null;
let facadeMaterial = null;
const walkClock = new THREE.Clock();

const walk = {
  active: false, x: -20.5, y: 0, z: 31, yaw: 0, pitch: 0,
  keys: {}, joy: { x: 0, y: 0 }, tour: null, saved: null, hudTimer: 0
};

function addCollider(x, z, w, d, yMin, yMax, layer) {
  colliders.push({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2, yMin, yMax, layer });
}
function addMeshCollider(mesh, layer) {
  const p = mesh.geometry.parameters;
  addCollider(mesh.position.x, mesh.position.z, p.width, p.depth,
    mesh.position.y - p.height / 2, mesh.position.y + p.height / 2, layer);
}
function isBlocked(x, z, y) {
  if (x < -61.4 || x > 61.4 || z < -35.4 || z > 35.4) return true;
  return colliders.some(c =>
    (!c.layer || c.layer.visible) &&
    y + EYE > c.yMin && y + 0.6 < c.yMax &&
    x > c.x0 - RADIUS && x < c.x1 + RADIUS &&
    z > c.z0 - RADIUS && z < c.z1 + RADIUS);
}

// Altura del piso bajo los pies (escalera, foso y rampa del portón)
function groundHeight(x, z, currentY) {
  if (x >= STAIR.minX && x <= STAIR.maxX && z >= STAIR.zN && z <= STAIR.zS) {
    const h = stairHeight(x);
    if (Math.abs(h - currentY) < 0.6) return h;
  }
  if (currentY > FLOOR2_Y / 2) return FLOOR2_Y;
  if (x > PIT.x0 && x <= PIT.x1 && z > PIT.zBack) return -PIT.depth;
  if (x > PIT.x1 && x < PIT.rampX1 && z > PIT.rampTop) {
    return -PIT.depth * Math.min(1, (z - PIT.rampTop) / (PIT.rampFoot - PIT.rampTop));
  }
  return 0;
}

function stepTo(x, z) {
  if (isBlocked(x, z, walk.y)) return;
  const h = groundHeight(x, z, walk.y);
  if (Math.abs(h - walk.y) > 0.35) return; // desniveles: solo se pasa por rampa o escalera
  walk.x = x; walk.z = z; walk.y = h;
}

function tryMove(dx, dz) {
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / 0.1));
  for (let i = 0; i < steps; i++) {
    // Ejes por separado: permite deslizarse a lo largo de un rack o muro
    const nx = walk.x + dx / steps;
    stepTo(nx, walk.z);
    stepTo(walk.x, walk.z + dz / steps);
  }
}
