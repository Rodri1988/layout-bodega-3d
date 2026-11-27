// Panel de inventario, colores y búsqueda (modo prueba)

function moduleState(list) {
  const s = list.map(r => r.status);
  if (s.some(x => x === 'Diferencia confirmada' || x === 'DUPLICADO')) return 'dif';
  if (s.every(x => x === 'Cuadrado')) return 'ok';
  if (s.every(x => x === 'Pendiente')) return 'pend';
  return 'proc';
}

function paintOverlay() {
  if (inv.overlay) {
    inv.overlay.children.forEach(m => { m.geometry.dispose(); m.material.dispose(); });
    scene.remove(inv.overlay);
  }
  inv.overlay = new THREE.Group();
  scene.add(inv.overlay);
  const mode = $('inv-mode').value;
  if (mode === 'none') return;
  inv.byKey.forEach((list, key) => {
    const o = inv.objects.get(key), p = o.geometry.parameters;
    const flat = p.depth === undefined; // carriles: son planos
    const geo = flat ? new THREE.BoxGeometry(p.width, 0.1, p.height)
                     : new THREE.BoxGeometry(p.width + 0.08, p.height + 0.08, p.depth - 0.12);
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      color: INV_COLORS[mode === 'status' ? moduleState(list) : 'stock'],
      transparent: true, opacity: 0.38, depthWrite: false }));
    o.getWorldPosition(mesh.position);
    if (flat) mesh.position.y += 0.08;
    inv.overlay.add(mesh);
  });
  $('inv-legend').classList.toggle('inv-hidden', mode !== 'status');
}

function loadInventory(rows, hasStatus, fileName) {
  inv.rows = rows; inv.hasStatus = hasStatus; inv.loaded = true;
  inv.byKey.clear(); inv.unmapped = [];
  rows.forEach(r => {
    const key = invKey(r.code);
    r.key = key && inv.objects.has(key) ? key : null;
    if (!r.key) { inv.unmapped.push(r); return; }
    if (!inv.byKey.has(r.key)) inv.byKey.set(r.key, []);
    inv.byKey.get(r.key).push(r);
  });
  const statusOpt = $('inv-mode').querySelector('[value="status"]');
  statusOpt.disabled = !hasStatus;
  $('inv-mode').value = hasStatus ? 'status' : 'stock';
  $('inv-info').textContent = `${fileName}: ${rows.length} líneas · ${rows.length - inv.unmapped.length} ubicadas en el 3D · ${inv.unmapped.length} sin lugar en el 3D`;
  $('inv-tools').classList.remove('inv-hidden');
  $('inv-search').value = ''; $('inv-results').textContent = '';
  document.getElementById('inspector-card').classList.add('hidden');
  paintOverlay();
}

function addLine(parent, text, cls, onClick) {
  const el = document.createElement(onClick ? 'button' : 'div');
  el.className = cls; el.textContent = text;   // textContent: el Excel nunca se interpreta como HTML
  if (onClick) el.addEventListener('click', onClick);
  parent.appendChild(el);
  return el;
}

// Lista de productos dentro de la ficha del elemento seleccionado
function renderProducts(obj) {
  const box = $('insp-products');
  box.textContent = '';
  if (!inv.loaded || !obj.userData.invKey) return;
  // Se ocultan la descripción y datos de ejemplo del 3D para no confundirlos con datos reales
  $('insp-desc').textContent = 'Modo prueba: productos según el archivo cargado (sin cantidades).';
  $('insp-meta').textContent = '';
  const list = (inv.byKey.get(obj.userData.invKey) || []).slice().sort((a, b) =>
    (b.code.split('-')[3] - a.code.split('-')[3]) || a.code.localeCompare(b.code, 'es', { numeric: true }));
  if (!list.length) { addLine(box, 'El archivo no registra productos aquí.', 'inv-item'); return; }
  let level = null;
  list.forEach(r => {
    const nv = r.code.split('-')[3];
    if (nv !== level) { level = nv; addLine(box, `Nivel ${nv}`, 'inv-level'); }
    const extra = (r.zero ? ' · en cero en sistema' : '') + (inv.hasStatus ? ` · ${r.status}` : '');
    addLine(box, `${r.code}  ·  ${r.sku}\n${r.name}${extra}`, 'inv-item');
  });
}

function goToResult(r) {
  if (!r.key) return;
  const o = inv.objects.get(r.key), pos = new THREE.Vector3();
  o.getWorldPosition(pos);
  if (!inv.marker) {
    inv.marker = new THREE.Mesh(new THREE.ConeGeometry(0.8, 2, 16), new THREE.MeshBasicMaterial({ color: 0xec4899, depthTest: false }));
    inv.marker.rotation.x = Math.PI;
    inv.marker.renderOrder = 10;
    scene.add(inv.marker);
  }
  const upper = pos.y > 5;
  inv.marker.position.set(pos.x, upper ? 10 : 8.2, pos.z);
  inv.marker.visible = true;
  cameraAnim.active = true; cameraAnim.progress = 0;
  cameraAnim.startPos.copy(camera.position); cameraAnim.startTarget.copy(controls.target);
  cameraAnim.endPos.set(pos.x - 10, pos.y + 22, pos.z + 18);
  cameraAnim.endTarget.copy(pos);
  showInspector(o);
}

function runSearch() {
  const q = $('inv-search').value.trim().toLowerCase();
  const box = $('inv-results');
  box.textContent = '';
  if (q.length < 2) return;
  const found = inv.rows.filter(r => `${r.sku} ${r.name} ${r.code}`.toLowerCase().includes(q));
  addLine(box, `${found.length} resultado(s)${found.length > 40 ? ' · se muestran 40' : ''}`, 'inv-level');
  found.slice(0, 40).forEach(r => addLine(box, `${r.code} · ${r.sku}\n${r.name}${r.key ? '' : ' · (sin lugar en el 3D)'}`, 'inv-item', () => goToResult(r)));
}

function setupInventory() {
  indexLayoutObjects();
  const panel = $('inv-panel'), open = $('inv-open');
  const toggle = () => { panel.classList.toggle('inv-hidden'); open.classList.toggle('inv-hidden'); };
  open.addEventListener('click', () => { document.getElementById('control-sidebar').classList.add('hidden'); document.getElementById('open-sidebar-btn').classList.remove('hidden'); toggle(); });
  $('inv-min').addEventListener('click', toggle);
  $('inv-mode').addEventListener('change', paintOverlay);
  $('inv-search').addEventListener('input', runSearch);
  $('inv-unmapped').addEventListener('click', () => {
    const box = $('inv-results'); box.textContent = '';
    addLine(box, `${inv.unmapped.length} línea(s) sin lugar en el 3D`, 'inv-level');
    inv.unmapped.forEach(r => addLine(box, `${r.code} · ${r.sku}\n${r.name}`, 'inv-item'));
  });
  $('inv-file').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      if (typeof XLSX === 'undefined') throw new Error('No cargó el lector de Excel. Revisa tu conexión a internet.');
      const { rows, hasStatus } = parseWorkbook(XLSX.read(await file.arrayBuffer()));
      loadInventory(rows, hasStatus, file.name);
    } catch (err) {
      $('inv-info').textContent = `No se pudo cargar: ${err.message}`;
    }
    e.target.value = '';
  });
  // Envuelve la ficha original para sumar los productos
  const baseInspector = showInspector;
  showInspector = obj => { baseInspector(obj); renderProducts(obj); };
  $('close-inspector').addEventListener('click', () => { if (inv.marker) inv.marker.visible = false; });
}
