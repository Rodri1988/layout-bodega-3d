// Entrar y salir del modo caminar, ubicación actual

// ---------- Entrar / salir ----------
function setWalkLook(on) {
  // Al caminar: losa y muros casi sólidos y sin volúmenes de color
  walkHiddenMaterials.forEach(m => m.visible = !on);
  walkOnly.visible = on;
  if (walkWallMaterial) walkWallMaterial.opacity = on ? 0.94 : 0.42;
  if (facadeMaterial) facadeMaterial.opacity = on ? 1 : 0.72;
  mezzanineSlabMaterial.opacity = on ? 1 : (isMezzanineTransparent ? 0.42 : 0.96);
  mezzanineSlabMaterial.color.setHex(on ? 0x8794a8 : 0xe2e8f0);
  officeFloorMaterial.opacity = on ? 1 : (isMezzanineTransparent ? 0.55 : 0.98);
  officeFloorMaterial.color.setHex(on ? 0xa8a29e : 0xf1f5f9);
  if (floor2Title) floor2Title.visible = !on;
  // Losas opacas al caminar, para que las etiquetas del piso se dibujen encima
  [mezzanineSlabMaterial, officeFloorMaterial].forEach(m => { m.transparent = !on; m.needsUpdate = true; });
  // Las etiquetas flotantes de números tapan la vista a la altura del 2° piso
  layers.modules.visible = on ? false : document.getElementById('layer-modules').checked;
}

function enterWalk() {
  if (walk.active) return;
  walk.saved = { pos: camera.position.clone(), target: controls.target.clone() };
  walk.active = true;
  cameraAnim.active = false;
  controls.enabled = false;
  camera.fov = 72; camera.near = 0.1;
  camera.updateProjectionMatrix();
  camera.rotation.order = 'YXZ';
  document.getElementById('inspector-card').classList.add('hidden');
  clearSelectionHighlight();
  document.body.classList.add('walking');
  document.getElementById('walk-hud').classList.remove('walk-hidden');
  setWalkLook(true);
  teleport(-21.5, -1.2, 35.0, 0);
  if (document.activeElement) document.activeElement.blur();
}

function exitWalk(restoreCamera = true) {
  if (!walk.active) return;
  stopTour();
  walk.active = false;
  walk.keys = {};
  controls.enabled = true;
  camera.fov = 45; camera.near = 0.5;
  camera.updateProjectionMatrix();
  if (restoreCamera) {
    camera.position.copy(walk.saved.pos);
    controls.target.copy(walk.saved.target);
  } else {
    controls.target.set(walk.x, walk.y + 1, walk.z);
  }
  document.body.classList.remove('walking');
  document.getElementById('walk-hud').classList.add('walk-hidden');
  document.getElementById('inspector-card').classList.add('hidden');
  clearSelectionHighlight();
  setWalkLook(false);
}

// ---------- Apuntar e inspeccionar ----------
function pickAt(ndcX, ndcY) {
  raycaster.setFromCamera({ x: ndcX, y: ndcY }, camera);
  const isShown = o => { for (; o; o = o.parent) if (!o.visible) return false; return true; };
  return raycaster.intersectObjects(interactiveObjects, false)
    .find(h => h.distance < 9 && isShown(h.object) &&
      // no seleccionar cosas del otro piso a través de la losa
      (h.point.y > FLOOR2_Y - 0.1) === (walk.y > FLOOR2_Y / 2));
}

// ---------- Ubicación actual ----------
function placeName() {
  const { x, y, z } = walk;
  if (y < -0.05) return 'Portón Entrada · Andén';
  if (y > 0.05 && y < FLOOR2_Y - 0.1) return 'Escalera';
  if (y > FLOOR2_Y / 2) {
    if (x > -22.3) return 'Oficina';
    return z < -18 ? 'Bodega 29' : 'Pasillo bajo Bodega 29';
  }
  if (x > -38.5 && x < -13.5 && z < -11.2) return 'Interior Bodega 70';
  if (x > 45) return 'Andenes 30 – 33';
  if (x > 29.5 && z > 14) return 'Patio';
  if (x > 20 && z > 25) return 'Pasillo 31';
  if (x > 34) return 'Sector Red Húmeda';
  if (z > 10.5 && z < 19) return 'Cruce transversal';
  const bands = [[-58.9,-55.1,21],[-49.8,-46,22],[-40.7,-36.9,23],[-31.6,-26.8,24],
                 [-13.4,-9.8,25],[-4.5,-0.1,26],[5.2,9.6,27],[14.9,18.5,28]];
  const b = bands.find(r => x >= r[0] && x <= r[1] && (r[2] !== 24 || z > 10.5));
  return b ? `Pasillo ${b[2]}` : 'Área abierta';
}
