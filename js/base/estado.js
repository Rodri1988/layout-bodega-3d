// Variables globales, capas, vistas de cámara y materiales

/**
 * APLICACIÓN 3D INTERACTIVA: LAYOUT BODEGA INDUSTRIAL
 * Dimensiones del plano maestro (unidades 3D = metros aproximados):
 * Ancho total (X): 124m (-62 a +62)
 * Profundidad total (Z): 72m (-36 a +36) -> Z negativo es arriba en el plano 2D, Z positivo es abajo (Portón Entrada).
 */

let scene, camera, renderer, controls;
let raycaster, mouse;
let interactiveObjects = [];
let selectedObject = null;
let originalEmissive = new THREE.Color(0x000000);

// Grupos de capas para activar/desactivar visibilidad
const layers = {
  racks: new THREE.Group(),
  bodega70: new THREE.Group(),
  modules: new THREE.Group(),
  aisles: new THREE.Group(),
  fire: new THREE.Group(),
  zones: new THREE.Group(),
  floor2: new THREE.Group()
};

let mezzanineSlabMaterial = null;
let officeFloorMaterial = null;
let isMezzanineTransparent = true;

// Animación suave de cámara
let cameraAnim = {
  active: false,
  startPos: new THREE.Vector3(),
  endPos: new THREE.Vector3(),
  startTarget: new THREE.Vector3(),
  endTarget: new THREE.Vector3(),
  progress: 0
};

// Catálogo de vistas predefinidas
const cameraPresets = {
  iso:      { pos: new THREE.Vector3(-48, 58, 68),   target: new THREE.Vector3(0, 0, 2) },
  top:      { pos: new THREE.Vector3(0, 102, 0.1),   target: new THREE.Vector3(0, 0, 0) },
  bodega70: { pos: new THREE.Vector3(-26, 26, -2),   target: new THREE.Vector3(-26, 1.5, -23.2) },
  piso2:    { pos: new THREE.Vector3(-26, 30, -1),   target: new THREE.Vector3(-26, 5.2, -23.2) },
  entrada:  { pos: new THREE.Vector3(-18, 22, 54),   target: new THREE.Vector3(-18, 2, 22) },
  pasillo22:{ pos: new THREE.Vector3(-46, 30, 38),   target: new THREE.Vector3(-46, 2, 4) },
  pasillo25:{ pos: new THREE.Vector3(2, 36, 42),     target: new THREE.Vector3(2, 2, -2) },
  beexx:    { pos: new THREE.Vector3(34, 36, 36),    target: new THREE.Vector3(34, 2, 0) },
  andenes:  { pos: new THREE.Vector3(52, 42, 46),    target: new THREE.Vector3(46, 2, 0) }
};

// Materiales compartidos para óptimo rendimiento
const materials = {
  postBlue: new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.45, metalness: 0.6 }),
  beamOrange: new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4, metalness: 0.35 }),
  palletWood: new THREE.MeshStandardMaterial({ color: 0xb4834b, roughness: 0.85 }),
  boxColors: [
    new THREE.MeshStandardMaterial({ color: 0xd6b485, roughness: 0.75 }),
    new THREE.MeshStandardMaterial({ color: 0xc89d6c, roughness: 0.75 }),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6 }),
    new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.55 }),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.65 })
  ],
  extRed: new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3, metalness: 0.4 }),
  extBlack: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 }),
  extBrass: new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.3, metalness: 0.8 }),
  wallConcrete: new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.8 }),
  mezzanineFloor: new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.7, metalness: 0.2 }),
  zoneGlass: new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.22,
    roughness: 0.2
  })
};
