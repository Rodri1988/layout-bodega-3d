// Arranque: crea la escena e inicia la animación. Se carga al final

/**
 * Inicializa la escena, iluminación, controles y eventos
 */
function init() {
  const container = document.getElementById('canvas-container');

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f172a);
  scene.fog = new THREE.FogExp2(0x0f172a, 0.0038);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 500);
  camera.position.copy(cameraPresets.iso.pos);

  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Controles Orbitales
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.copy(cameraPresets.iso.target);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.maxPolarAngle = Math.PI / 2 - 0.03; // Evita atravesar el suelo
  controls.minDistance = 8;
  controls.maxDistance = 175;

  // Iluminación Industrial Realista
  const hemiLight = new THREE.HemisphereLight(0xf8fafc, 0x334155, 0.72);
  hemiLight.position.set(0, 60, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
  dirLight.position.set(45, 85, 55);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 10;
  dirLight.shadow.camera.far = 220;
  const dShadow = 75;
  dirLight.shadow.camera.left = -dShadow;
  dirLight.shadow.camera.right = dShadow;
  dirLight.shadow.camera.top = dShadow;
  dirLight.shadow.camera.bottom = -dShadow;
  dirLight.shadow.bias = -0.0005;
  scene.add(dirLight);

  // Luz de relleno secundaria
  const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.35);
  fillLight.position.set(-55, 45, -45);
  scene.add(fillLight);

  // Agregar grupos de capas a la escena
  Object.values(layers).forEach(group => scene.add(group));

  // Construir elementos del plano
  buildFloorAndPerimeter();
  buildAllRacks();
  buildSpecialZones();
  buildSecondFloorMezzanine();
  buildPhotoDetails();
  buildAislesAndMeasurements();
  buildFireExtinguishers();

  // Raycaster para selección interactiva
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  setupUIEvents();
  window.addEventListener('resize', onWindowResize);
  setupWalkMode();
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointerup', onPointerUp);
}

function animate() {
  requestAnimationFrame(animate);

  if (cameraAnim.active) {
    cameraAnim.progress += 0.035;
    const t = Math.min(cameraAnim.progress, 1);
    // Easing cubic out
    const ease = 1 - Math.pow(1 - t, 3);

    camera.position.lerpVectors(cameraAnim.startPos, cameraAnim.endPos, ease);
    controls.target.lerpVectors(cameraAnim.startTarget, cameraAnim.endTarget, ease);

    if (t >= 1) {
      cameraAnim.active = false;
    }
  }

  const dt = Math.min(walkClock.getDelta(), 0.05);
  if (walk.active) updateWalk(dt);
  else controls.update();
  renderer.render(scene, camera);
}

window.onload = function () {
  init();
  animate();
  setupInventory();
};
