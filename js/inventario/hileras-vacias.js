// Marca con una flecha las hileras sin productos, según el Excel cargado (modo prueba)

const emptyRows = { group: null, arrows: [], list: [] };

function clearEmptyRows() {
  if (emptyRows.group) {
    emptyRows.group.traverse(o => {
      if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); }
      if (o.geometry && !o.isSprite) o.geometry.dispose();
    });
    scene.remove(emptyRows.group);
  }
  emptyRows.group = new THREE.Group();
  scene.add(emptyRows.group);
  emptyRows.arrows = [];
  emptyRows.list = [];
}

function makeArrow(color, text) {
  const g = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color });
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.75, 1.1, 20), mat);
  head.rotation.x = Math.PI;           // punta hacia abajo
  head.position.y = 0.55;
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 1.0, 12), mat);
  shaft.position.y = 1.55;
  const t = createTextTexture(text, { bgColor: '#' + color.toString(16).padStart(6, '0'), textColor: '#ffffff', borderColor: '#ffffff', fontSize: 44 });
  const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: t.texture }));
  label.scale.set(0.85 * t.aspect, 0.85, 1);
  label.position.y = 2.7;
  g.add(head, shaft, label);
  // Se dibujan por delante de los racks para que no queden tapadas al caminar
  g.children.forEach(o => { o.material.depthTest = false; o.material.transparent = true; o.renderOrder = o === label ? 21 : 20; });
  return g;
}

function updateEmptyRows() {
  clearEmptyRows();
  inv.objects.forEach((o, key) => {
    if (o.userData.type !== 'Módulo de Rack') return;
    const products = inv.byKey.get(key) || [];
    const kind = !products.length ? 'vacia' : products.every(r => r.zero) ? 'cero' : null;
    if (!kind) return;
    const pos = o.getWorldPosition(new THREE.Vector3());
    const arrow = makeArrow(kind === 'vacia' ? 0xdc2626 : 0xd97706, `${kind === 'vacia' ? 'VACÍA' : 'EN CERO'} · ${key}`);
    arrow.position.set(pos.x, 7.9, pos.z);
    arrow.userData.phase = emptyRows.arrows.length * 0.6;
    emptyRows.group.add(arrow);
    emptyRows.arrows.push(arrow);
    emptyRows.list.push({ key, kind, code: `Pasillo ${key.split('-')[0]} · Hilera ${key.split('-')[1]}` });
  });
  emptyRows.list.sort((a, b) => a.key.localeCompare(b.key, 'es', { numeric: true }));
  emptyRows.group.visible = $('inv-empty').checked;
  renderEmptyList();
}

function renderEmptyList() {
  const box = $('inv-empty-list');
  box.textContent = '';
  const n = k => emptyRows.list.filter(r => r.kind === k).length;
  $('inv-empty-title').textContent = `Hileras de racks: ${n('vacia')} sin productos · ${n('cero')} solo en cero`;
  emptyRows.list.forEach(r => addLine(box, `${r.kind === 'vacia' ? '🔴' : '🟠'} ${r.code}`, 'inv-item',
    () => {
      goToResult({ key: r.key });
      inv.marker.visible = false;   // la hilera ya tiene su propia flecha
    }));
}

// Las flechas suben y bajan suavemente (se llama en cada cuadro)
function animateEmptyRows() {
  const t = performance.now() / 320;
  const walking = document.body.classList.contains('walking');
  emptyRows.arrows.forEach(a => {
    a.position.y = 7.9 + Math.sin(t + a.userData.phase) * 0.3;
    // En el recorrido solo se muestran las flechas cercanas
    a.visible = !walking || Math.hypot(a.position.x - camera.position.x, a.position.z - camera.position.z) < 22;
  });
}
